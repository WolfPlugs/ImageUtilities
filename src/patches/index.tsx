import { common, webpack, Injector, Logger } from "replugged";
import Overlay from "../components/Overlay";
import { findInReactTree } from "../utils/find";
const { React } = common;

export default class MainPatch {
  private inject = new Injector();
  private logger = Logger.plugin("ImageUtilis | Overlay");
  private settings: any;
  private modalIsOpen: boolean;

  constructor(settings) {
    this.settings = settings;
    this.modalIsOpen = false;
  }

  public start() {
    this.injectWithSettings(
      webpack.getBySource("._keysToEnter")?.prototype,
      "render",
      (...args) => {
        this.modalIsOpen = false;
        // eslint-disable-next-line no-return-assign
        return this.overlay(...args, () => (this.modalIsOpen = true));
      },
    );
  }

  public stop() {
    this.inject.uninjectAll();
  }

  private overlay(args, res, settings, instance) {
    let tree;
    const nativeModalChildren = findInReactTree(res, (m) => m?.props?.render);
    try {
      tree = nativeModalChildren?.props?.render();
    } catch (error) {
      this.logger.error(error);
    }

    if (tree) {
      const ImageModalClasses = webpack.getByProps(["image", "modal", "responsiveWidthMobile"]);
      if (findInReactTree(tree, (m) => m.props?.className === ImageModalClasses.image)) {
        res = <Overlay children={res} settings={settings}></Overlay>;
      }
    }

    return res;
  }

  private injectWithSettings(object, funcName, patch) {
    return this.inject.after(object, funcName, (args, res) => {
      return patch(args, res, this.settings);
    });
  }
}
