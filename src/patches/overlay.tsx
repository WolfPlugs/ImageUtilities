import { Injector, Logger, webpack } from 'replugged';
import { findInReactTree, findInTree } from '../utils/find';
import {ImageModalWrapper} from "../components/ImageModalwrapper" 
import OverlayUI from '../components/OverlayUI';
const inject = new Injector();
const logger = Logger.plugin("ImageUtilis | Overlay");

export default  class Overlay {
  constructor(children: any) {
    this.children = children;
  }


  start({ modalLayer, imageModalRender}) {
    const sus2 = webpack.getById(570738);
    inject.after(sus2 as any, "y", (_, res) => this.ImageModal(res, imageModalRender));
    this.patchModalLayer(modalLayer);
  }

  stop() {
    inject.uninjectAll();
  }


  ImageModal(res, opts) {
    const { downloadLink, wrapper } = webpack.getByProps([ 'wrapper', 'downloadLink' ])
    let Wrapper = findInReactTree(res, (m) => m?.props?.className === wrapper).props.children;
    let footers = Wrapper.findIndex((m) => m?.props?.className === downloadLink);
    const image = res?.props?.children?.[1];

    if (res) {
      if (!image) return res;
      const { height, width } = image;
  
      image.props.height *= 8;
      image.props.width *= 8;
      image.props.maxHeight = (document.body.clientHeight * 70) / 100;
      image.props.maxWidth = (document.body.clientWidth * 80) / 100;
  
    }

    Wrapper[footers] = <OverlayUI originalFooter={Wrapper[footers]} {...opts.overlayUI}></OverlayUI>
    return res;
  }


  patchModalLayer(modalLayer) {
    const ModalLayer = findInReactTree(this.children, ({ props }) => props?.render);

    inject.after(ModalLayer.props, 'render', (args, res) => {
      res.props.children = <ImageModalWrapper {...modalLayer}>{res.props.children}</ImageModalWrapper>
      return res;
    });
   
  }
}
