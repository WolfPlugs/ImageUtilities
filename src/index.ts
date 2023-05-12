import { Injector, Logger, webpack } from "replugged";
import ImageModalWrapper from "./components/ImageModalWrapper";

const inject = new Injector();
const logger = Logger.plugin("PluginTemplate");

// webpack.getByProps([ 'wrapper', 'downloadLink' ])
export async function start(): Promise<void> {
  const sus2 = webpack.getById(570738);
  const sus = webpack.getById(159689);
  inject.after(sus2, "y", (args, res, i) => {
    ImageModal(res);
  });
}

export function stop(): void {
  inject.uninjectAll();
}

function ImageModal(res) {
  if (res) {
    const imgae = res.props.children[1];
    const { height, width } = res.props.children[1];
    logger.log("ImageModal H, W", height, width);

    imgae.height = height * 2;
    imgae.width = width * 2;
    imgae.maxHeight = (document.body.clientHeight * 70) / 100;
    imgae.maxWidth = (document.body.clientWidth * 80) / 100;

    logger.log("ImageModal the rest", res.props.children[1]);
  }
  return res;
}
