import { common, settings, webpack } from 'replugged';
import Patcher from "../patches/overlay";
import getImages from "../utils/getImage";
import lensHandler from "../utils/tools/Handlers";
const { React, channels: { getChannelId }, lodash } = common;
const _ = lodash;
const { wrapper } = webpack.getByProps(['wrapper', 'downloadLink'])


export default class ImageToolsOverlay extends React.PureComponent {
  public patcher: Patcher;
  public images: any[];
  public state: any;
  public lensSettings: any;
  public lensConfig: any;
  public additionalHandler: any;
  public setState: any;
  public props: any;
  public sendDataToUI: Function;

  constructor(props) {
    super(props);
    this.images = getImages(getChannelId());
    this.state = {
      $image: null,
      currentImgIndex: null,
    }

    this.lensSettings = {
      get radius() {
        if (props.settings?.get('lensRadius') === 0) return props.settings?.set('lensRadius', 100);
        return props.settings?.get('lensRadius', 100);
      },
      set radius(v) { return props.settings?.set('lensRadius', v); },

      get zooming() {
        if (props.settings?.get('zoomRatio') === 0) return props.settings?.set('zoomRatio', 2);
        return props.settings?.get('zoomRatio', 2);
      },
      set zooming(v) { return props.settings?.set('zoomRatio', v); },

      get wheelStep() {
        if (props.settings?.get('wheelStep') === 0) return props.settings?.set('wheelStep', 1);
        return props.settings?.get('wheelStep', 1);
      },
      set wheelStep(v) { return props.settings?.set('wheelStep', v); }
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
        lensConfig: this.lensConfig,
        overlayUI: {
          headerButtons: this.getButtons(),
          sendDataToUI: (callback) => Object.defineProperty(this, "sendDataToUI", {
            get: () => {
              return callback;
            },
            configurable: true,
            enumerable: true,
          })
        }
      }
    }


    this.patcher = new Patcher(props.settings, props.children);
    this.patcher.start(injectOptions);

    this.additionalHandler = {}

    _.bindAll(this, ['onMouseMove', 'onMouseDown', 'onMouseButton', 'onWheel']);
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

  public onMouseMove(e) {
    const suppress = this.getAdditionalHandler(e, 'onMouseMove');
    if (suppress) return;
    this.updateLensConfig(lensHandler.onMouseMove(e))
  }

  public onMouseDown(e) {
    if (e.target.closest(`div.${wrapper}`) && this.state.$image) {
      this.onMouseButton(e)
    }
  }

  public onMouseButton(e) {
    if (e.target.closest('div.header, div.footer')) return;

    const suppress = this.getAdditionalHandler(e, 'onMouseButton');
    if (suppress) return;

    this.updateLensConfig(lensHandler.onMouseButton(e))
  }

  public onWheel(e) {
    if (this.props.settings.get('offScrollingOutside', false) && !e.target.closest(`div.${wrapper}`)) {
      return;
    }
    const suppress = this.getAdditionalHandler(e, 'onWheel');
    if (suppress) {
      return;
    }
    const val = lensHandler.onWheel(e,
      {
        radius: this.lensConfig.radius,
        zooming: this.lensConfig.zooming,
        wheelStep: this.lensConfig.wheelStep
      },
      {
        radius: [50, this.props.settings.get('maxLensRadius', 700)],
        zooming: [1, this.props.settings.get('maxZoomRatio', 15)],
        wheelStep: [0.1, 5]
      }
    );
    const [key] = Object.keys(val);

    this.lensSettings[key] = val[key];
    this.updateLensConfig(val);
  }

  public getAdditionalHandler(event: Function, handlerName: string) {
    const resource = this.additionalHandler[handlerName];
    if (!resource) return false;
    const res = resource.func(event);
    if (resource.capture && !res) return true;
    return false;
  }

  public updateLensConfig(data) {
    this.lensConfig = { ...this.lensConfig, ...data };

    if (('show' in data) || this.lensConfig.show) {
      this.state.updateLensConfig(this.lensConfig);
    }

    if (['radius', 'zooming', 'wheelStep'].some((k) => k in data)) {
      this.updateUI({
        lensConfig: this.lensConfig
      });
    }
  }

  public getButtons() {
    return [];
  }

 public updateCurrentImg($image) {
    const updateIU = () => {
      const result = this.images.findIndex(({ proxy_url }) => proxy_url === this.state.$image.src);
      const currentImgIndex = (result === -1) ? null : result;

      this.setState({ currentImgIndex });
      this.updateUI({
        $image,
        attachment: (currentImgIndex != null) ? this.images[currentImgIndex] : {},
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

  public updateUI(data) {
    console.log(this)
    this.sendDataToUI(data);
  }

}
