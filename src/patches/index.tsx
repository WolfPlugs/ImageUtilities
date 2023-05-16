import { common, webpack, Injector, Logger } from "replugged";
import Overlay from "../components/Overlay";
import {findInReactTree} from "../utils/find"
const { React } = common;

export default class MainPatch {
  private inject = new Injector();
  private logger = Logger.plugin("ImageUtilis | Overlay");
  private modalIsOpen = false;
  

  public start () {
    this.inject.after(webpack.getBySource("._keysToEnter")?.prototype, "render", (...args) => {
      return this.overlay(...args, () => this.modalIsOpen = true);
    })
  }

  public stop () {
    this.inject.uninjectAll();
  }


  private overlay(args,res, instance) {
    let tree;
    const nativeModalChildren = findInReactTree(res, ( m ) => m?.props?.render);
    // console.log("Args", args);
    //     console.log("Res", res);
    //     console.log("Instance", instance);
    try {
      
      tree = nativeModalChildren?.props?.render();

    } catch (error) {
      this.logger.error(error)
    }
    let settings

    if (tree) {
      const ImageModalClasses = webpack.getByProps(["image","modal", "responsiveWidthMobile"]);
      if (findInReactTree(tree, (m) => m.props?.className === ImageModalClasses.image)) {
        res = <Overlay children={res}></Overlay>
        this.logger.log(res)
      }
      
    }

    return res;
  }
}
