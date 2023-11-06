import { Injector, Logger, webpack, util, common, types } from "replugged";
import { ImageModalWrapper } from "../components/ImageModalwrapper";
import OverlayUI from "../components/OverlayUI";

const inject = new Injector();
const logger = Logger.plugin("ImageUtilis | Overlay");
const { React } = common;
const { downloadLink, wrapper } = await webpack.waitForModule<{
  downloadLink: string;
  wrapper: string;
}>(webpack.filters.byProps("wrapper", "downloadLink"));

const { image } = await webpack.waitForModule<{
  image: string;
}>(webpack.filters.byProps("image"));

export default class Overlay {
  private children: any;
  private patchImageSize: boolean;
  constructor(settings, children: any) {
    this.children = children;
    this.patchImageSize = settings?.get("patchImageSize", true);
  }

  start({ modalLayer, imageModalRender }) {
    const image = webpack.getBySource<Record<string, types.AnyFunction>>(".MEDIA_MODAL_CLOSE,");
    inject.after(image, 'ImageModal', (_, res) =>
      this.imageModal(res, imageModalRender),
    );
    this.patchModalLayer(modalLayer);
  }

  stop() {
    inject.uninjectAll();
  }

  // imageRender(res) {
  //   // console.log(findInReactTree(res, ({ props }) => props))
  //   // const Video = findInReactTree(res, ({ m }) => m?.props?.alt === 'Video');
  //   // if (Video) {
  //   //   Video.props.play = true;
  //   // }
  //   // return res;
  // }

  imageModal(res, opts) {
    let Wrapper = util.findInReactTree(res, (m) => m?.props?.className === wrapper)?.props.children;
    let footers = Wrapper?.findIndex(
      (m) => m?.props?.className === downloadLink || m?.props.originalFooter,
    );
    let Image = res?.props?.children?.[1];

    if (res) {
      if (!Image) return res;

      if (this.patchImageSize) {
        const img = res.props;
        const { height, width } = img;

        img.height = height * 2;
        img.width = width * 2;
        img.maxHeight = (document.body.clientHeight * 70) / 100;
        img.maxWidth = (document.body.clientWidth * 80) / 100;
      }

      // if (Image.type.isAnimated({ original: Image.props.src })) {
      //   Image.props.animated = true;
      // }

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
    const ModalLayer = util.findInReactTree(
      this.children,
      ({ props }) =>
        props?.render?.toString?.()?.includes("Messages.IMAGE") ||
        props?.render?.toString?.()?.includes("modalCarouselClassName") ||
        props?.render?.toString?.()?.includes("ImageModal"),
    );

    if (!ModalLayer) return;

    inject.after(ModalLayer.props, "render", (args, res) => {
      if (res?.props?.items?.length) {
        for (const item of res?.props?.items) {
          if (!item?.component?.type?.toString()?.includes("lensConfig")) {
            item.component = (
              <ImageModalWrapper {...modalLayer}>{item.component}</ImageModalWrapper>
            );
          }
        }
      } else {
        if (!res?.props?.children?.type?.toString()?.includes("lensConfig")) {
          res.props.children = (
            <ImageModalWrapper {...modalLayer}>{res.props.children}</ImageModalWrapper>
          );
        }
      }
      return res;
    });
    if (!ModalLayer.props.patched) {
      ModalLayer._owner.updateQueue.baseState.children = {};
      ModalLayer.props.patched = true;
    }
  }
}
