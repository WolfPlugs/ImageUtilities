import { common, components, util } from "replugged";
import camelCaseify from "../utils/camelCaseify";

import Actions from "../utils/tools/Actions";
import buttonStructure from "../structures/button";

import imageSearchEngines from "../utils/imageSearchEngines.json";
import CustomContextMenu from "../patches/ContextMenu";

const { findInReactTree } = util;
const {
  React,
  i18n: { Messages },
} = common;

const priority = ["gif", "mp4", "png", "jpg", "webp"];

export default class ImageToolsButton extends React.PureComponent {
  btnId: { id: string; name: string };
  disabledActions: any;
  disabledISE: any;
  imageSearchEngines: (
    | { name: string; url: string; note: string; withoutEncode: undefined }
    | { name: string; url: string; note: undefined; withoutEncode: undefined }
    | { name: string; url: string; note: string; withoutEncode: boolean }
  )[];

  constructor(props) {
    super(props);

    this.btnId = { id: "image-tools-button", name: Messages.IMAGE };
    this.disabledISE = props.settings.get("disabledImageSearchEngines", []);
    this.disabledActions = props.settings.get("disabledActions", []);
    this.imageSearchEngines = imageSearchEngines.filter(({ name }) => {
      const id = name.replace(" ", "-").toLowerCase();
      return !this.disabledISE.includes(id);
    });
  }

  static render(props) {
    const itb = new ImageToolsButton(props);
    return itb.renderContextMenu();
  }

  static renderSticker(id, settings) {
    const itb = new ImageToolsButton({ settings });

    itb.disabledActions = ['copy-image', 'open-link', 'copy-link', 'save-as', 'search-image'];
    const [res] = CustomContextMenu.renderRawItems([{
      ...itb.btnId,
      type: 'submenu',
      items: itb.getBaseMenu({
        stickerAssets: {
          size: 320,
          sticker: {
            id,
            format_type: 3
          }
        },
        src: `https://media.discordapp.com/stickers/${id}.png?passtrough=true`
      }, []),
      getItems() {
        return this.items;
      }
    }]);
    res.props.action = findInReactTree(res, ({ props }) => props?.action).props.action;
    return res;
  }

  get disabled() {
    return {
      mp4: ["open-image", "copy-image", "save-as", "search-image"],
    };
  }

  getDisabledMethods(e: any) {
    return Array.isArray(this.disabled[e]) ? this.disabled[e] : [];
  }

  getItems(images: any) {
    images = images || this.props.images.default || this.props.images;
    const lowPriorityExtensions = this.props.settings.get("lowPriorityExtensions", []);
    const baseExtensions = Object.keys(images)
      .filter((e) => images[e] && priority.includes(e) && images !== "streamPreview")
      .sort((a, b) => priority.indexOf(a) - priority.indexOf(b));

    return baseExtensions.reduceRight((acc, e, i) => {
      if (acc.length > 1 && lowPriorityExtensions.includes(e)) {
        acc.splice(i, 1);
      }
      return acc;
    }, baseExtensions);
  }

  renderContextMenu() {
    const [res] = CustomContextMenu.renderRawItems([{
      ...this.btnId,
      type: 'submenu',
      items: this.getSubMenuItems(this.props.images, this.disabledActions),
      getItems() {
        return this.items;
      }
    }])

    const prioritySort = priority.filter((e) => this.getItems().includes(e));
    const actionId = this.props.settings.get("defaultAction", "open-image");
    res.props.action = this.getAction(prioritySort, actionId);
    // const saveImageBtn = findInReactTree(res, (m: any) => m.props?.id === "save-image");
    // if (saveImageBtn) {
    //   saveImageBtn.props.action = this.getAction(prioritySort, 'save');
    // }
    return res;
  }

  getSubMenuItems(images: any) {
    if (images.guildAvatars) {
      if (images.guildAvatars.length > 0) {
        return this.getGuildAvatarsMenu();
      }
      images = images.default;
    }

    if (images.guildBanner) {
      if (Object.keys(images.guildBanner[0]).length > 0) {
        return this.getGuildBannerMenu();
      }
      images = images.default;
    }

    const items = this.getItems(images);

    if (items.length >= 1) {
      return items.map((e) => ({
        type: "submenu",
        id: `sub-${e}`,
        name: e.toUpperCase(),
        items: this.getBaseMenu(images[e], this.getDisabledMethods(e)),
        getItems() {
          return this.items;
        },
      }));
    }
  }

  getGuildBannerMenu() {
    return [
      {
        type: "submenu",
        id: "guild-banner",
        name: "Guild Banner",
        items: this.getSubMenuItems(this.props.images.guildBanner[0]),
        getItems() {
          return this.items;
        }
      },
      {
        type: "submenu",
        id: "guild-icon",
        name: "Guild Icon",
        items: this.getSubMenuItems(this.props.images.default),

        getItems() {
          return this.items;
        }
      },
    ];
  }

  getGuildAvatarsMenu() {
    return [
      {
        type: 'submenu',
        id: 'guild-avatar',
        name: Messages.PER_GUILD_AVATAR,
        items: [
          ...(this.props.images.isCurrentGuild
            ? this.getSubMenuItems(this.props.images.guildAvatars.shift())
            : []),
          ...(this.props.images.guildAvatars.length > 0
            ? this.props.images.guildAvatars.map(({ guildName }, i) => ({
              type: 'submenu',
              name: guildName,
              items: this.getSubMenuItems(this.props.images.guildAvatars[i]),
              getItems() {
                return this.items;
              }
            }))
            : []),
        ],
        getItems() {
          return this.items;
        }
      },
      {
        type: 'submenu',
        id: 'user-avatar',
        name: Messages.PROFILE,
        items: this.getSubMenuItems(this.props.images.default),
        getItems() {
          return this.items;
        }
      },
    ];
  }

  getStreamMenuItem() {
    return {
        type: 'button',
        id: 'open-stream-preview',
        name: "Open Stream Preview",
        action: () => Actions.openImage({src: this.props.images.streamPreview}),
      };
  }

  getBaseMenu(image, disabled) {

    return buttonStructure
      .filter(({ id }) => !this.disabledActions.includes(id))
      .map((item) => ({
        disabled: disabled.includes(item.id),
        //name: item.name,
        ...item,
        ...this.getExtraItemsProperties(image, item.id)
      }));
  }

  getExtraItemsProperties(image, snakeId) {

    const id = camelCaseify(snakeId);
    const { src, original } = image;
    //const saveImageDirs = this.props.settings.get('saveImageDirs', []);

    const allowSubText = !this.props.settings.get("hideHints", false);

    // const defaultSaveDir = saveImageDirs[0]?.path || getDefaultSaveDir();

    const openLink = (url: string, withoutEncode) =>
      Actions.openLink(url + (withoutEncode ? src : encodeURIComponent(src)), { original });

    const data = {
      openImage: {
        action: () => Actions.openImage(image),
      },
      get copyImage() {
        return {
          disabled: src ? !/\.(png|jpg|jpeg)$/.test(new URL(src).pathname) : false,
        };
      },
      // save: {
      //   type: (saveImageDirs.length > 1) ? 'submenu' : 'button',
      //   subtext: (allowSubText) ? defaultSaveDir : null,
      //   items: saveImageDirs.map(({ name, path }) => ({
      //     type: 'button',
      //     name,
      //     subtext: (allowSubText) ? path : null,
      //     onClick: () => Actions.save(image.src, {
      //       downloadPath: path
      //     })
      //   })),
      //   getItems () {
      //     return this.items;
      //   }
      // },
      searchImage: {
        children: [
          ...this.imageSearchEngines.map((e) => ({
            type: "button",
            name: e.name,
            subtext: allowSubText ? e.note : null,
            action: () => openLink(e.url, e.withoutEncode)
          })),
          {
            type: "button",
            color: "danger",
            name: "Search everywhere",
            action: () =>
              this.imageSearchEngines.forEach(({ url, withoutEncode }) =>
                openLink(url, withoutEncode),
              )
          }
        ],
        getItems() {
          return this.children;
        }
      },
    };

    return {
      action: () =>
        Actions[id](image.src, {
          original,
        }),
      ...data[id],
    };
  }

  getAction(arr, id) {
    const key = arr.length ? arr[0] : this.getItems()[0];
    if (Array.isArray(this.disabled[key]) && this.disabled[key].includes(id)) {
      return () => null;
    }
    const { action } = this.getExtraItemsProperties(
      (this.props.images.default || this.props.images)[key],
      id,
    );
    return action;
  }
}
