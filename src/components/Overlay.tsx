import { common, webpack } from "replugged";
import Patcher from "../patches/overlay";
import getImages from "../utils/getImage";
import lensHandler from "../utils/tools/Handlers";
const {
  React,
  channels: { getChannelId },
  lodash,
} = common;
const _ = lodash;
const { wrapper } = await webpack.waitForModule<{
  wrapper: string;
}>(webpack.filters.byProps("wrapper", "downloadLink"));

export default class ImageToolsOverlay extends React.PureComponent {
  private patcher: Patcher;
  private images: any[];
  private state: any;
  private lensSettings: any;
  private lensConfig: any;
  private additionalHandler: any;

  constructor(props) {
    super(props);
    const get = props.settings.get.bind(props.settings);
    const set = props.settings.set.bind(props.settings);
    this.images = getImages(getChannelId() as string);
    this.state = {
      $image: null,
      currentImgIndex: null,
    };

    this.lensSettings = {
      get radius() {
        return get("lensRadius", 100);
      },
      set radius(v) {
        set("lensRadius", v);
      },

      get zooming() {
        return get("zoomRatio", 2);
      },
      set zooming(v) {
        set("zoomRatio", v);
      },

      get wheelStep() {
        return get("wheelStep", 1);
      },
      set wheelStep(v) {
        set("wheelStep", v);
      },
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
        borderColor: props.settings?.get("lensColor", 0),
        get imageRendering() {
          return props.settings?.get("disableAntiAliasing", null) ? "pixelated" : null;
        },
        get borderRadius() {
          return `${props.settings?.get("borderRadius", 50)}%`;
        },
      },
    };

    this.additionalHandler = {};

    _.bindAll(this, ["onMouseMove", "onMouseDown", "onMouseButton", "onWheel"]);
  }
  componentDidUpdate(): void {
    this.patcher = new Patcher(this.props.settings, this.props.children);
    const injectOptions = {
      modalLayer: {
        set$image: this.updateCurrentImg.bind(this),
        setUpdateLensConfig: (callback) => {
          this.setState(
            (prevState) => Object.assign({}, prevState, { updateLensConfig: callback }),
            () => {
              this.state.updateLensConfig("");
            },
          );
        },
      },
      imageModalRender: {
        lensConfig: this.lensConfig,
        overlayUI: {
          headerButtons: this.getButtons(),
          sendDataToUI: (callback) => {
            this.setState((prevState) => Object.assign({}, prevState, { sendDataToUI: callback }));
          },
        },
      },
    };
    this.patcher.start(injectOptions);
  }
  componentDidMount(): void {
    this.patcher = new Patcher(this.props.settings, this.props.children);
    const injectOptions = {
      modalLayer: {
        set$image: this.updateCurrentImg.bind(this),
        setUpdateLensConfig: (callback) => {
          this.setState(
            (prevState) => Object.assign({}, prevState, { updateLensConfig: callback }),
            () => {
              this.state.updateLensConfig("");
            },
          );
        },
      },
      imageModalRender: {
        lensConfig: this.lensConfig,
        overlayUI: {
          headerButtons: this.getButtons(),
          sendDataToUI: (callback) => {
            this.setState((prevState) => Object.assign({}, prevState, { sendDataToUI: callback }));
          },
        },
      },
    };
    this.patcher.start(injectOptions);
  }
  public render() {
    return (
      <div
        onMouseMove={this.onMouseMove}
        onMouseDown={this.onMouseDown}
        onMouseLeave={this.onMouseDown}
        onMouseUp={this.onMouseButton}
        onClick={this.onMouseButton}
        onWheel={this.onWheel}
        onKeyDown={(e) => {
          if (e.keyCode === 27) {
            this.patcher.stop();
            this.additionalHandler = {};
          }
        }}>
        {this.props.children}
      </div>
    );
  }

  onMouseMove(e) {
    const suppress = this.getAdditionalHandler(e, "onMouseMove");
    if (suppress) return;
    this.updateLensConfig(lensHandler.onMouseMove(e));
  }

  public onMouseDown(e) {
    if (e.target.closest(`div.${wrapper}`) && this.state.$image) {
      this.onMouseButton(e);
    }
  }

  onMouseButton(e) {
    if (e.target.closest("div.header, div.footer")) return;
    const suppress = this.getAdditionalHandler(e, "onMouseButton");
    if (suppress) return;

    this.updateLensConfig(lensHandler.onMouseButton(e));
  }

  onWheel(e) {
    if (
      this.props.settings.get("offScrollingOutside", false) &&
      !e.target.closest(`div.${wrapper}`)
    ) {
      return;
    }
    const suppress = this.getAdditionalHandler(e, "onWheel");
    if (suppress) {
      return;
    }
    const val = lensHandler.onWheel(
      e,
      {
        radius: this.lensConfig.radius,
        zooming: this.lensConfig.zooming,
        wheelStep: this.lensConfig.wheelStep,
      },
      {
        radius: [50, this.props?.settings?.get("maxLensRadius", 700)],
        zooming: [1, this.props?.settings?.get("maxZoomRatio", 15)],
        wheelStep: [0.1, 5],
      },
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

    if ("show" in data || this.lensConfig.show) {
      this.state.updateLensConfig(this.lensConfig);
    }

    if (["radius", "zooming", "wheelStep"].some((k) => k in data)) {
      this.updateUI({
        lensConfig: this.lensConfig,
      });
    }
  }

  public getButtons() {
    return [];
  }

  public updateCurrentImg($image) {
    const updateIU = () => {
      const result = this.images.findIndex(({ proxy_url }) => proxy_url === this.state.$image.src);
      const currentImgIndex = result === -1 ? null : result;

      this.setState((prevState) => Object.assign({}, prevState, { currentImgIndex }));
      this.updateUI({
        $image,
        attachment: currentImgIndex != null ? this.images[currentImgIndex] : {},
      });
    };

    const updateLens = () => {
      this.updateLensConfig({
        getRectImage: () => $image.getBoundingClientRect(),
      });
    };

    this.setState(
      (prevState) => Object.assign({}, prevState, { $image }),
      () => {
        updateIU();
        updateLens();
      },
    );
  }

  updateUI(data) {
    this.state?.sendDataToUI?.(data);
  }
}
