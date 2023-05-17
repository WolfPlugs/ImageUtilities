import { common, settings } from 'replugged';
import Patcher from "../patches/overlay";
import getImages from "../utils/getImage";
import lensHandler from "../utils/tools/Handlers";
const { React, channels: { getChannelId } } = common;



export default class Overlay extends React.PureComponent {
  constructor(props) {
    super(props);
    const { get, set } = props.settings;
    this.patcher = new Patcher(props.children);
    this.images = getImages(getChannelId());
    this.state = {
      $image: null,
      currentImgIndex: null,
    }

    this.lensSettings = {
      get radius () { return get('lensRadius', 100); },
      set radius (v) { return set('lensRadius', v); },

      get zooming () { return get('zoomRatio', 2); },
      set zooming (v) { return set('zoomRatio', v); },

      get wheelStep () { return get('wheelStep', 1); },
      set wheelStep (v) { return set('wheelStep', v); }
    };

    this.lensConfig = {
      show: false,
      radius: this.lensSettings.radius,
      zooming: this.lensSettings.zooming,
      wheelStep: this.lensSettings.wheelStep,
      positionX: 0,
      positionY: 0,
      getRectImage: () => ({}),
      renderPreview: () => null,
      style: {
        borderColor: int2hex(get('lensColor', 0)),
        get imageRendering() {
          return get('disableAntiAliasing', null) ? 'pixelated' : null;
        },
        get borderRadius() {
          return `${get('borderRadius', 50)}%`;
        }
      }
    }
    const injectOptions = {
      modalLayer: {
        set$image: this.updateCurrentImg.bind(this),
        setUpdateLensConfig: (callback) => {
          this.setState({ updateLensConfig: callback }, () => {
            this.state.updateLensConfig("");
          });
        }
      },
      imageModalRender: {
        // lensConfig: this.lensConfig,
        overlayUI: {
          // headerButtons: this.getButtons(),
          sendDataToUI: (callback) => this.sendDataToUI = callback
        }
      }
    }
    const _ = "nothing"
    this.patcher.start(injectOptions);

    this.additionalHandler = {}
  }

  public render() {
    return (
      <div
      onMouseMove={this.onMouseMove}
      onMouseDown={this.onMouseDown}
      onMouseLeave={this.onMouseDown}
      onMouseUp={this.onMouseButton}
      onClick={this.onMouseButton}
      onKeyDown={(e) => {
          if (e.keyCode === 27) {
            this.patcher.stop();
            this.additionalHandler = {};
          }
        }}>{this.props.children}</div>)
  }

  private onMouseMove(e) {
    const suppress = this.getAdditionalHandler(e, 'onMouseMove');
    if (suppress) return;
    this.updateLensConfig(lensHandler.onMouseMove(e))
  }

  private onMouseDown(e) {
    if (e.target.closest(`div.${wrapper}`) && this.state.$image) {
      this.onMouseButton(e)
    }
  }

  private onMouseButton(e) {
    if(e.target.closest('div.header, div.footer')) return;

    const suppress = this.getAdditionalHandler(e, 'onMouseButton');
    if (suppress) return;

    this.updateLensConfig(lensHandler.onMouseButton(e))
  }

  private onWheel(e) {
    
  }

  private getAdditionalHandler (event, handlerName) {
    const resource = this.additionalHandler[handlerName];
    if (!resource) return false;
    const res = resource.func(event);
    if( resource.capture && !res ) return true;
    return false;
  }

  private updateCurrentImg($image) {
    const updateIU = () => {
      const result = this.images.findIndex(({ proxy_url }) => proxy_url === this.state.$image.src);
      const currentImgIndex = (result === -1) ? null : result;

      this.setState({ currentImgIndex });
      this.updateUI({
        $image,
        attachment: (currentImgIndex !== null) ? this.images[currentImgIndex] : {}
      });
    };
    const updateLens = () => {
      this.updateLensConfig({
        getRectImage: () => $image.getBoundingClientRect()
      });
    };

    this.setState({ $image }, () => {
      updateIU();
      updateLens();
    });
  }

  private updateUI(data) {
    this.sendDataToUI(data);
  }
}

