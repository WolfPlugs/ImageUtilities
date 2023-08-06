import { common, components, util } from "replugged";
import camelCaseify from "../utils/camelCaseify";

import Actions from "../utils/tools/Actions";
import buttonStructure from "../structures/button";

import imageSearchEngines from "../utils/imageSearchEngines.json";

const { findInReactTree } = util;
const {
  React,
  i18n: { Messages },
} = common;
const {
  ContextMenu: { MenuItem },
} = components;
const priority = ["gif", "mp4", "png", "jpg", "webp"];

export default class ImageToolsButton extends React.PureComponent {
  btnId: { id: string; name: string };
  disabledActions: any;
  disabledISE: any;
  imageSearchEngines: (
    | { name: string; url: string; note: string; withoutEncode?: undefined }
    | { name: string; url: string; note?: undefined; withoutEncode?: undefined }
    | { name: string; url: string; note: string; withoutEncode: boolean }
  )[];

  constructor(props) {
    super(props);

    this.btnId = { id: "image-tools-button", label: Messages.IMAGE };
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
      .filter((e) => images[e] && priority.includes(e))
      .sort((a, b) => priority.indexOf(a) - priority.indexOf(b));

    return baseExtensions.reduceRight((acc, e, i) => {
      if (acc.length > 1 && lowPriorityExtensions.includes(e)) {
        acc.splice(i, 1);
      }
      return acc;
    }, baseExtensions);
  }

  renderContextMenu() {
    const res2 = (
      <MenuItem {...this.btnId} children={this.getSubMenuItems(this.props.images)}></MenuItem>
    );

    const prioritySort = priority.filter((e) => this.getItems().includes(e));
    const actionId = this.props.settings.get("defaultAction", "open-image");
    res2.props.action = this.getAction(prioritySort, actionId);
    // const saveImageBtn = findInReactTree(res2, ({ props }) => props?.id === 'save');
    // if (saveImageBtn) {
    //   saveImageBtn.props.action = this.getAction(prioritySort, 'save');
    // }

    return res2;
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
      return items.map((e) => (
        <MenuItem
          key={e}
          id={`sub-${e}`}
          label={e.toUpperCase()}
          children={this.getBaseMenu(images[e], this.getDisabledMethods(e))}
        />
        // getItems() {
        //   return this.items;
        // }
      ));
    }
  }

  getGuildBannerMenu() {
    return [
      <MenuItem key={"guild-banner"} id={"guild-banner"} label={"Guild Banner"}>
        {[
          this.getSubMenuItems(this.props.images.guildBanner[0]),
          // <MenuItem
          //   id={'lo'}
          //   key={'llol'}
          //   label={'lol'}
          //   children={this.getSubMenuItems(this.props.images.guildBanner[0])}
          //     />
        ]}
      </MenuItem>,
      <MenuItem
        key={"guild-icon"}
        id={"guild-icon"}
        label={"Guild Icon"}
        children={this.getSubMenuItems(this.props.images.default)}
      />,
    ];
  }

  getGuildAvatarsMenu() {
    return [
      <MenuItem key={"guild-avatar"} id={"guild-avatar"} label={Messages.PER_GUILD_AVATAR}>
        {[
          ...(this.props.images.isCurrentGuild
            ? this.getSubMenuItems(this.props.images.guildAvatars.shift())
            : []),
          ...(this.props.images.guildAvatars.length > 0
            ? this.props.images.guildAvatars.map(({ guildName }, i) => (
                <MenuItem
                  id={guildName}
                  key={guildName}
                  label={guildName}
                  children={this.getSubMenuItems(this.props.images.guildAvatars[i])}
                />
              ))
            : []),
        ]}
      </MenuItem>,
      <MenuItem
        key={"user-avatar"}
        id={"user-avatar"}
        label={Messages.PROFILE}
        children={this.getSubMenuItems(this.props.images.default)}
      />,
    ];
  }

  getBaseMenu(image, disabled) {
    return buttonStructure
      .filter(({ id }) => !this.disabledActions.includes(id))
      .map((item) => (
        <MenuItem
          disabled={disabled.includes(item.id)}
          label={item.name}
          {...item}
          {...this.getExtraItemsProperties(image, item.id)}
        />
      ));
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
          ...this.imageSearchEngines.map((e) => (
            <MenuItem
              id={e.name}
              key={e.name}
              label={e.name}
              subtext={allowSubText ? e.note : null}
              action={() => openLink(e.url, e.withoutEncode)}
            />
          )),
          <MenuItem
            id={"shit-o"}
            key={"shit-o"}
            color="danger"
            label="Search everywhere"
            action={() =>
              this.imageSearchEngines.forEach(({ url, withoutEncode }) =>
                openLink(url, withoutEncode),
              )
            }
          />,
        ],
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
