import { Injector, Logger, common, components, types, util, webpack } from "replugged";
import Overlay from "../components/Overlay";
import { defaultSet } from "..";
import { ModuleExports } from "replugged/dist/types";
import Button from "../components/Button";
import LensSettings from "../utils/tools/Settings";

const { ContextMenuTypes } = types;
const { React, guilds, flux, lodash } = common;

const { image } = await webpack.waitForModule<{
  image: string;
}>(webpack.filters.byProps("image", "modal"));

const {
  getGuildBannerURL,
  getChannelIconURL,
  getGuildIconURL,
  getGuildMemberAvatarURL,
  getUserAvatarURL,
  isAnimatedIconHash,
} = webpack.getByProps(["getUserAvatarURL", "getGuildIconURL"]);

const ApplicationStreamingStore = webpack.getByStoreName("ApplicationStreamingStore");
const ApplicationStreamPreviewStore = webpack.getByStoreName("ApplicationStreamPreviewStore");

const initMemorizeRender = () =>
lodash._.memoize(
    (render, patch) =>
      (...renderArgs) =>
        patch(render(...renderArgs)),
  );
export default class MainPatch {
  private inject = new Injector();
  private logger = Logger.plugin("ImageUtilis | Index");
  private settings: keyof typeof defaultSet;
  private modalIsOpen: boolean;

  constructor(settings: keyof typeof defaultSet) {
    this.settings = settings;
    this.modalIsOpen = false;
  }

  public start() {
    this.injectWithSettings(
      webpack.getBySource("._keysToEnter")?.prototype,
      "render",
      (...args: any[]) => {
        this.modalIsOpen = false;
        // eslint-disable-next-line no-return-assign
        return this.overlay(...args, () => (this.modalIsOpen = true));
      },
    );
    this.getContextMenus({
      userContext: this.contextMenuPatches.UserContext,
      guildContext: this.contextMenuPatches.GuildContext,
      imageContext: this.contextMenuPatches.ImageContext,
      gdmContext: this.contextMenuPatches.GdmContext,
      messageContext: this.contextMenuPatches.MessageContext,
    });
  }

  public stop() {
    this.inject.uninjectAll();
  }

  private overlay(args: unknown[], res: JSX.Element, settings: keyof typeof defaultSet) {
    let tree;
    const nativeModalChildren = util.findInReactTree(
      res,
      (m: any) =>
        m?.props?.render?.toString?.()?.includes("Messages.IMAGE") ||
        m?.props?.render?.toString?.()?.includes("modalCarouselClassName") ||
        m?.props?.render?.toString?.()?.includes("ImageModal"),
    );
    try {
      tree = nativeModalChildren?.props?.render();
    } catch {}
    if (tree) {
      if (
        util.findInReactTree(
          tree,
          (m: any) =>
            m?.type?.toString?.()?.includes(".Messages.OPEN_IN_BROWSER") ||
            m?.props?.items?.some((i) =>
              i?.component?.type?.toString?.()?.includes(".Messages.OPEN_IN_BROWSER"),
            ),
        )
      ) {
        res = <Overlay children={res} settings={settings}></Overlay>;
      }
    }

    return res;
  }

  private injectWithSettings(object: ModuleExports, funcName: string, patch: Function) {
    return this.inject.after(object, funcName, (args: unknown[], res: JSX.Element) => {
      return patch(args, res, this.settings);
    });
  }

  private getContextMenus(menus: any) {
    this.inject.utils.addMenuItem(ContextMenuTypes.UserContext, (data, menu) => {
      return menus.userContext(data, menu, this.settings);
    });

    this.inject.utils.addMenuItem(ContextMenuTypes.GuildContext, (data, menu) => {
      return menus.guildContext(data, menu, this.settings);
    });

    this.inject.utils.addMenuItem(ContextMenuTypes.ImageContext, (data, menu) => {
      return menus.imageContext(data, menu, this.settings);
    });

    this.inject.utils.addMenuItem(ContextMenuTypes.GdmContext, (data, menu) => {
      return menus.gdmContext(data, menu, this.settings);
    });

    this.inject.utils.addMenuItem(ContextMenuTypes.Message, (data, menu) => {
      return menus.messageContext(data, menu, this.settings);
    });
  }

  get contextMenuPatches() {
    const memorizeRewnder = initMemorizeRender();

    function initButton(menu, args) {
      const btn = Button.render(args);
      memorizeRewnder.cache.clear();

      if (Array.isArray(menu)) {
        menu.splice(menu.length - 1, 0, btn);
      } else {
        menu.type = memorizeRewnder(menu.type, (res: any) => {
          res.props.children.splice(res.props.children.length - 1, 0, btn);
          return res;
        });
      }
      //return menu;
    }

    return {
      MessageContext(data, res, settings) {
        const stickerItems = data?.message?.stickerItems;
        const content = data?.message?.content;
        const target = data?.data[0]?.target;
        if (
          target.tagName === "IMG" ||
          target.getAttribute("data-role") === "img" ||
          (target.getAttribute("data-type") === "sticker" && stickerItems.length)
        ) {
          const { clientWidth: width, clientHeight: height } = target;
          const menu = res.children;
          const hideNativeButtons = settings.get("hideNativeButtons", true);

          if (hideNativeButtons) {
            const imageItemGroup = menu.find((m) =>
              m?.props?.children?.some?.(
                (c) =>
                  c?.props?.id === "copy-image" || c?.some?.((i) => i?.props?.id === "copy-image"),
              ),
            );
            if (imageItemGroup) {
              imageItemGroup.props.children = imageItemGroup.props.children.filter(
                (m) =>
                  m?.props?.id !== "copy-image" &&
                  m?.props?.id !== "save-image" &&
                  !m?.some?.((i) => i?.props?.id === "copy-image"),
              );
            }

            const linkItemGroup = menu.find((m) =>
              m?.props?.children?.some?.(
                (c) =>
                  c?.props?.id === "copy-native-link" ||
                  c?.some?.((i) => i?.props?.id === "copy-native-link"),
              ),
            );
            if (linkItemGroup) {
              linkItemGroup.props.children = linkItemGroup.props.children.filter(
                (m) =>
                  m?.props?.id !== "copy-native-link" &&
                  m?.props?.id !== "open-native-link" &&
                  !m?.some?.((i) => i?.props?.id === "copy-native-link"),
              );
            }
          }
          if (target.tagName === "CANVAS") {

            menu.splice(menu.length - 1, 0, Button.renderSticker(stickerItems[0].id, settings));
          } else {
            const [e, src] = getImage(target);
            if (e === "svg") return;
            initButton(menu, {
              images: {
                [e]: {
                  src,
                  original: isUrl(content) ? content : null,
                  width: width,
                  height: height,
                  maxHeight: height,
                  maxWidth: width,
                },
              },
              settings,
            });
          }
        }
        //return res;
      },

      UserContext(data, res, settings) {
        if (!data?.user) {
          return res;
        }
        const { user, guildId } = data;
        const guildMemberAvatarURLParams = { userId: user.id, guildId };
        const guildMemberAvatars = Object.entries(user.guildMemberAvatars);
        const currentGuildId = guildMemberAvatars.findIndex(([id]) => id === guildId);
        const isCurrentGuild = currentGuildId !== -1;

        if (isCurrentGuild) {
          guildMemberAvatars.splice(0, 0, guildMemberAvatars.splice(currentGuildId, 1)[0]);
        }

        // const [stream, previewUrl] = flux.useStateFromStores(
        //   [ApplicationStreamingStore, ApplicationStreamPreviewStore],
        //   () => {
        //     const stream = ApplicationStreamingStore.getAnyStreamForUser(user.id);
        //     const previewUrl =
        //       stream &&
        //       ApplicationStreamPreviewStore.getPreviewURL(
        //         stream.guildId,
        //         stream.channelId,
        //         stream.ownerId,
        //       );

        //     return [stream, previewUrl];
        //   },
        // );

        const images = {
          isCurrentGuild,
          //streamPreview: stream && previewUrl.startsWith("https://") ? previewUrl : null,
          guildAvatars: guildMemberAvatars.map(([guildId, avatar]) => ({
            guildName: guilds.getGuild(guildId).name,
            png: {
              src: fixUrlSize(
                getGuildMemberAvatarURL({ ...guildMemberAvatarURLParams, avatar }, false).replace(
                  ".webp",
                  ".png",
                ),
              ),
            },
            webp: {
              src: fixUrlSize(
                getGuildMemberAvatarURL({ ...guildMemberAvatarURLParams, avatar }, false),
              ),
            },
            gif: isAnimatedIconHash(avatar)
              ? {
                  src: getGuildMemberAvatarURL(
                    { ...guildMemberAvatarURLParams, guildMemberAvatar: avatar },
                    true,
                  ),
                }
              : null,
          })),
          default: {
            png: {
              src: addDiscordHost(getUserAvatarURL(user, false, 2048).replace(".webp", ".png")),
            },
            webp: { src: addDiscordHost(getUserAvatarURL(user, false, 2048)) },
            gif: isAnimatedIconHash(user.avatar)
              ? { src: getUserAvatarURL(user, true, 2048) }
              : null,
          },
        };
        return initButton.call(this, res.children, { images, settings });
      },

      GuildContext(data, res, settings) {
        let url, e;
        const params = {
          id: data?.guild?.id,
          icon: data?.guild?.icon,
          size: 4096,
          canAnimate: false,
        };

        let images = {
          default: {
            png: { src: getGuildIconURL(params)?.replace(".webp?", ".png?") },
            webp: { src: data?.guild?.icon ? getGuildIconURL(params) : null },
            gif: isAnimatedIconHash(data?.guild?.icon)
              ? { src: getGuildIconURL({ ...params, canAnimate: true }) }
              : null,
          },
          guildBanner: [{}],
        };

        if (data?.guild?.banner) {
          url = new URL(getGuildBannerURL(data.guild));
          e = url.pathname.split(".").pop();
          images.guildBanner = [
            {
              [e]: {
                src: fixUrlSize(url.href),
                width: 2048,
                height: 918,
              },
            },
          ];
        }

        if (images.default.webp.src) {
          return initButton(res.children, { images, settings });
        }
      },

      ImageContext(data, res, settings) {
        const [e, src] = getImage(data.target);
        const button = Button.render({
          images: { [e]: { src } },
          settings,
        });

        const openImage = util.findInReactTree(
          button,
          (res: any) => res.props?.id === "open-image",
        );

        openImage.props.disabled = true;
        res.children = [...button?.props?.children, ...LensSettings.render(settings)];
      },

      GdmContext(data, res, settings) {
        const [src] = getChannelIconURL(data.channel).split("?");
        const link = src.startsWith("http") ? src : `https://discord.com${src}`;
        const images = {
          png: { src: link.endsWith(".webp") ? link.replace(".webp", ".png") : link },
          webp: { src: link.endsWith(".png") ? link.replace(".png", ".webp") : link },
        };

       return initButton(res.children, { images, settings });
      },

      //StreamContext(data, res, settings) {},
    };
  }
}

function getImage(target) {
  const src = (target.tagName === "A" ? target.href : target.src).split("?").shift();
  let e = src.substr(src.lastIndexOf(".") + 1, src.length);
  if (e.length > 3) {
    if (src.endsWith("/mp4")) {
      e = "mp4";
    } else {
      e = "png";
    }
  }
  return [e, src];
}

function isUrl(string) {
  try {
    new URL(string);
  } catch {
    return false;
  }
  return true;
}

function fixUrlSize(url) {
  url = new URL(url);
  url.searchParams.set("size", "2048");
  return url.href;
}

function addDiscordHost(url) {
  return new URL(
    url,
    url.startsWith("/assets/") ? `https:${window.GLOBAL_ENV.ASSET_ENDPOINT}` : undefined,
  ).href;
}
