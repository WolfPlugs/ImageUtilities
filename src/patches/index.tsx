import { common, webpack, Injector, Logger } from "replugged";
import Overlay from "../components/Overlay";
import { findInReactTree } from "../utils/find";
import { defaultSet } from "..";
import { ModuleExports } from "replugged/dist/types";
const { React } = common;
const { image } = await webpack.waitForModule<{
  image: string;
}>(webpack.filters.byProps("image", "modal", "responsiveWidthMobile"));

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
  }

  public stop() {
    this.inject.uninjectAll();
  }

  private overlay(args: unknown[], res: JSX.Element, settings: keyof typeof defaultSet) {
    let tree;
    const nativeModalChildren = findInReactTree(res, (m: any) => m?.props?.render);
    try {
      tree = nativeModalChildren?.props?.render();
    } catch (error) {
      this.logger.error(error);
    }

    if (tree) {

      if (findInReactTree(tree, (m: any) => m.props?.className === image)) {
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
}
