import { common, webpack, Injector, Logger } from "replugged";
import Overlay from "../components/Overlay";
const { React } = common;

export default class MainPatch {
  private inject = new Injector();
  private logger = Logger.plugin("ImageUtilis | Overlay");
  private modalIsOpen = false;
  

  public start () {
    this.inject.after(webpack.getByProps(['TransitionGroup', 'ReplaceTransition'])?.TransitionGroup.prototype, "render", (...args) => {
      this.logger.log("sus", args)
      return this.overlay(...args, () => this.modalIsOpen = true);
    })
  }

  public stop () {
    this.inject.uninjectAll();
  }


  private overlay(args, res) {
    let tree;
    this.logger.log("sus", args, res)
    try {
      // tree = 
    } catch (error) {
      this.logger.error(error)
    }
  }
}
