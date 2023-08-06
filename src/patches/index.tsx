import { Injector, Logger, common, components, types, util, webpack } from "replugged";
import Overlay from "../components/Overlay";
import { defaultSet } from "..";
import { ModuleExports } from "replugged/dist/types";
import Button from "../components/Button";

const {
  ContextMenu: { MenuItem },
} = components;
const { ContextMenuTypes } = types;
const { React, guilds } = common;

const { image } = await webpack.waitForModule<{
  image: string;
}>(webpack.filters.byProps("image", "modal", "responsiveWidthMobile"));

const {
  getGuildBannerURL,
  getChannelIconURL,
  getGuildIconURL,
  getGuildMemberAvatarURL,
  getUserAvatarURL,
  isAnimatedIconHash,
} = webpack.getByProps(["getUserAvatarURL"]);
const initMemorizeRender = () =>
  window._.memoize(
    (render, patch) =>
      (...renderArgs) =>
        patch(render(...renderArgs)),
  );
export default class MainPatch {
  private inject = new Injector();
  private logger = Logger.plugin("ImageUtilis | Overlay");
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
    });
  }

  public stop() {
    this.inject.uninjectAll();
  }

  private overlay(args: unknown[], res: JSX.Element, settings: keyof typeof defaultSet) {
    let tree;
    const nativeModalChildren = util.findInReactTree(res, (m: any) => m?.props?.render);
    try {
      tree = nativeModalChildren?.props?.render();
    } catch (error) {
      this.logger.error(error);
    }

    if (tree) {
      if (util.findInReactTree(tree, (m: any) => m.props?.className === image)) {
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
  }

  get contextMenuPatches() {
    // this.inject.utils.addMenuItem(ContextMenuTypes.Message, (data, menu) => {
    //   return <MenuItem
    //     id="image-utils"
    //     label="Image Utils"
    //     action={() => console.log(data)}
    //   >

    //   </MenuItem>
    // })

    // })
    return {
      UserContext(data, res, settings) {
        // console.log(data, res, settings)
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

        const images = {
          isCurrentGuild,
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

        return Button.render({ images, settings });
      },

      GuildContext(data, res, settings) {
        let url, e;
        const params = {
          id: data.guild.id,
          icon: data.guild.icon,
          size: 4096,
          canAnimate: false,
        };

        let images = {
          default: {
            png: { src: getGuildIconURL(params)?.replace(".webp?", ".png?") },
            webp: { src: getGuildIconURL(params) },
            gif: isAnimatedIconHash(data.guild.icon)
              ? { src: getGuildIconURL({ ...params, canAnimate: true }) }
              : null,
          },
          guildBanner: [{}],
        };

        if (data.guild.banner) {
          url = new URL(getGuildBannerURL(data.guild));
          e = url.pathname.split(".").pop();
          images.guildBanner = [
            {
              [e]: {
                src: fixUrlSize(url.href),
                widht: 2048,
                height: 918,
              },
            },
          ];
        }

        if (images.default.webp.src) {
          return Button.render({ images, settings });
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
        res.children = [
          ...button.props.children,
          //...LensSettings.render(settings)
        ];
        return res;
      },

      GdmContext(data, res, settings) {
        const [src] = getChannelIconURL(data.channel).split("?");
        const link = src.startsWith("http") ? src : `https://discord.com${src}`;
        const images = {
          png: { src: link.endsWith(".webp") ? link.replace(".webp", ".png") : link },
          webp: { src: link.endsWith(".png") ? link.replace(".png", ".webp") : link },
        };

        return Button.render({ images, settings });
      },
    };
  }
}

function getImage(target) {
  const src = (target.tagName === "IMG" ? target.src : target.href).split("?").shift();
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
