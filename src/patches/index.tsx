import { Injector, Logger, common, components, types, util, webpack } from "replugged";
import Overlay from "../components/Overlay";
import { defaultSet } from "..";
import { ModuleExports } from "replugged/dist/types";
import Button from "../components/Button";

const { ContextMenu: { MenuItem }} = components;
const { ContextMenuTypes } = types
const { React, guilds } = common;

const { image } = await webpack.waitForModule<{
  image: string;
}>(webpack.filters.byProps("image", "modal", "responsiveWidthMobile"));

const { getGuildMemberAvatarURL,getUserAvatarURL, isAnimatedIconHash } = webpack.getByProps(['getUserAvatarURL'])
const initMemorizeRender = () => window._.memoize((render, patch) => (...renderArgs) => (
  patch(render(...renderArgs))
));
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
    console.log(menus)
    this.inject.utils.addMenuItem(ContextMenuTypes.UserContext, (data, menu) => {
      return <MenuItem
        id="image-utils"
        label="Image Utils"
        action={() => menus.userContext(data, menu, this.settings)}
      >
      
      </MenuItem>
    })

  }

  get contextMenuPatches() {
    const memorizeRender = initMemorizeRender();

    function initButton(menu, args) {
      const btn = Button.render(args);
      memorizeRender.cache.clear();

      console.log(menu, args, btn)
    }
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
        console.log(data, res, settings)
        if (!data?.user) {
          return res;
        }
        const { user, guildId } = data;
        const guildMemberAvatarURLParams = { userId: user.id, guildId };
        const guildMemberAvatars =  Object.entries(user.guildMemberAvatars);
        const currentGuildId = guildMemberAvatars.findIndex(([ id ]) => id === guildId);
        const isCurrentGuild =  currentGuildId !== -1;

        if (isCurrentGuild) {
          guildMemberAvatars.splice(0, 0, guildMemberAvatars.splice(currentGuildId, 1)[0]);
        }

        const images = {
          isCurrentGuild,
          guildAvatars: guildMemberAvatars.map(([ guildId, avatar ]) => ({
            guildName: guilds.getGuild(guildId).name,
            png: { src: fixUrlSize(getGuildMemberAvatarURL({ ...guildMemberAvatarURLParams, avatar }, false).replace('.webp', '.png')) },
            webp: { src: fixUrlSize(getGuildMemberAvatarURL({ ...guildMemberAvatarURLParams, avatar }, false)) },
            gif:  isAnimatedIconHash(avatar) ? { src: getGuildMemberAvatarURL({ ...guildMemberAvatarURLParams, guildMemberAvatar: avatar }, true) } : null
          })),
          default: {
            png: { src: addDiscordHost(getUserAvatarURL(user, false, 2048).replace('.webp', '.png')) },
            webp: { src: addDiscordHost(getUserAvatarURL(user, false, 2048)) },
            gif:  isAnimatedIconHash(user.avatar) ? { src: getUserAvatarURL(user, true, 2048) } : null
          }
        };
        initButton.call(this, res, { images, settings })
        return res;
      }
      
    }
  }

  

  
}


function fixUrlSize (url) {
  url = new URL(url);
  url.searchParams.set('size', '2048');
  return url.href;
}

function addDiscordHost (url) {
  return new URL(url, (url.startsWith('/assets/')) ? `https:${window.GLOBAL_ENV.ASSET_ENDPOINT}` : undefined).href;
}
