import { Injector, Logger, webpack } from "replugged";
import { findInReactTree } from "../utils/find";
import { ImageModalWrapper } from "../components/ImageModalwrapper";
import OverlayUI from "../components/OverlayUI";
const inject = new Injector();
const logger = Logger.plugin("ImageUtilis | Overlay");

export default class Overlay {
  private children: any;
  private patchImageSize: boolean;
  constructor(settings, children: any) {
    this.children = children;
    this.patchImageSize = settings?.get("patchImageSize", true);
  }


  start({ modalLayer, imageModalRender}) {
    const image = webpack.getById(570738);
    const video = webpack.getById(159689);
    // inject.after(video as any, "Z", (_, res) => this.imageRender(res));
    inject.after(image as any, "y", (_, res) => this.imageModal(res, imageModalRender));
    this.patchModalLayer(modalLayer);
  }

  stop() {
    inject.uninjectAll();
  }

  imageRender (res) {
    // console.log(findInReactTree(res, ({ props }) => props))

    // const Video = findInReactTree(res, ({ m }) => m?.props?.alt === 'Video');
    // if (Video) {
    //   Video.props.play = true;
    // }
    // return res;
    
  }

  imageModal(res, opts) {
    const { downloadLink, wrapper } = webpack.getByProps(["wrapper", "downloadLink"]);
    const { image } = webpack.getByProps(["image"]);
    let Wrapper = findInReactTree(res, (m) => m?.props?.className === wrapper).props.children;
    let footers = Wrapper.findIndex(
      (m) => m?.props?.className === downloadLink || m?.props.originalFooter,
    );
    let Image = res?.props?.children?.[1];
    console.log("Wrapper", Wrapper);
    console.log("Fotter Index", footers);
    console.log("Fotter", Wrapper[footers]);
    if (res) {
      if (!Image) return res;

      if (this.patchImageSize) {
        Image.props.height *= 8;
        Image.props.width *= 8;
        Image.props.maxHeight = (document.body.clientHeight * 70) / 100;
        Image.props.maxWidth = (document.body.clientWidth * 80) / 100;
      }

      if (Image.type.isAnimated({ original: Image.props.src })) {
        Image.props.animated = true;
      }
      opts.lensConfig.children = Image;
    }

    Wrapper[footers] = (
      <OverlayUI
        originalFooter={Wrapper[footers]?.props?.originalFooter ?? Wrapper[footers]}
        {...opts.overlayUI}></OverlayUI>
    );
    return res;
  }

  patchModalLayer(modalLayer) {
    const ModalLayer = findInReactTree(this.children, ({ props }) => props?.render);

    inject.after(ModalLayer.props, "render", (args, res) => {
      res.props.children = (
        <ImageModalWrapper {...modalLayer}>{res.props.children}</ImageModalWrapper>
      );
      return res;
    });
  }
}
