import { common, settings } from 'replugged';
import Patcher from "../patches/overlay";
import getImages from "../utils/getImage";
import lensHandler from "../utils/tools/Handlers";
const { React, channels: { getChannelId } } = common;



export default class Overlay extends React.PureComponent {
  private patcher: Patcher;
  private images: any[];
  private state: any;
  private lensSettings: any;
  private lensConfig: any;
  private sendDataToUI: any;
  private additionalHandler: any;
  
  constructor(props) {
    super(props);
    this.patcher = new Patcher(props.children);
    this.images = getImages(getChannelId());
    this.state = {
      $image: null,
      currentImgIndex: null,
    }

    this.lensSettings = {
      get radius () {
        if (props.settings?.get('lensRadius') === 0) return props.settings?.set('lensRadius', 100);
        return props.settings?.get('lensRadius', 100); 
      },
      set radius (v) { return props.settings?.set('lensRadius', v); },

      get zooming () {
        if (props.settings?.get('zoomRatio') === 0) return props.settings?.set('zoomRatio', 2);
        return props.settings?.get('zoomRatio', 2); 
      },
      set zooming (v) { return props.settings?.set('zoomRatio', v); },

      get wheelStep () {
        if (props.settings?.get('wheelStep') === 0) return props.settings?.set('wheelStep', 1);
        return props.settings?.get('wheelStep', 1); 
      },
      set wheelStep (v) { return props.settings?.set('wheelStep', v); }
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
        borderColor: (props.settings?.get('lensColor', 0)),
        get imageRendering() {
          return props.settings?.get('disableAntiAliasing', null) ? 'pixelated' : null;
        },
        get borderRadius() {
          return `${props.settings?.get('borderRadius', 50)}%`;
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

  onMouseMove(e) {
    console.log(this)
    const suppress = this.getAdditionalHandler(e, 'onMouseMove');
    if (suppress) return;
    this.updateLensConfig(lensHandler.onMouseMove(e))
  }

  onMouseDown(e) {
    if (e.target.closest(`div.${wrapper}`) && this.state.$image) {
      this.onMouseButton(e)
    }
  }

  onMouseButton(e) {
    if(e.target.closest('div.header, div.footer')) return;

    const suppress = this.getAdditionalHandler(e, 'onMouseButton');
    if (suppress) return;

    this.updateLensConfig(lensHandler.onMouseButton(e))
  }

  onWheel(e) {
    
  }

  getAdditionalHandler (event: Function, handlerName: string) {
    const resource = this.additionalHandler[handlerName];
    if (!resource) return false;
    const res = resource.func(event);
    if( resource.capture && !res ) return true;
    return false;
  }

  updateCurrentImg($image) {
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

  updateUI(data) {
    this.sendDataToUI(data);
  }
}

