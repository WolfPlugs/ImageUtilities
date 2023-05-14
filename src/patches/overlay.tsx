import { Injector, Logger, webpack } from 'replugged';
const inject = new Injector();
const logger = Logger.plugin("ImageUtilis | Overlay");

export class Overlay {
  constructor(children) {
    this.children = children;
  }


  start() {
    const sus2 = webpack.getById(570738);
    inject.after(sus2, "y", (_, res) => { this.ImageModal(res); });
  }

  stop() {
    inject.uninjectAll();
  }


  ImageModal(res) {
    if (res) {
      const imgae = res.props.children[1];
      const { height, width } = res.props.children[1];
      logger.log("", height, width);
  
      imgae.height = height * 2;
      imgae.width = width * 2;
      imgae.maxHeight = (document.body.clientHeight * 70) / 100;
      imgae.maxWidth = (document.body.clientWidth * 80) / 100;
  
      logger.log("", res.props.children[1]);
    }
    return res;
  }
}
