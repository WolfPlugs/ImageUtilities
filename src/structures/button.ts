import { common } from "replugged";

const {
  i18n: { Messages },
} = common;

export default [
  {
    type: "button",
    id: "open-image",
    get name() {
      return "Open Image";
    },
  },
  {
    type: "button",
    id: "copy-image",
    get name() {
      return "Copy Image";
    },
  },
  {
    type: "button",
    id: "open-link",
    get name() {
      return Messages.OPEN_LINK;
    },
  },
  {
    type: "button",
    id: "copy-link",
    get name() {
      return Messages.COPY_LINK;
    },
  },
  // {
  //   type: 'button',
  //   id: 'save',
  //   get name () { return Messages.SAVE_IMAGE_MENU_ITEM; }
  // },
  // {
  //   type: 'button',
  //   id: 'save-as',
  //   get name () { return "Save Image As..."; }
  // },
  {
    type: "submenu",
    id: "search-image",
    get name() {
      return "Search image in...";
    },
  },
];
