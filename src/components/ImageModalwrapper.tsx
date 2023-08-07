import { common, util, webpack } from "replugged";
import Lens from "../utils/tools/index";

const { React } = common;
const { imageWrapper, imagePlaceholderOverlay } = await webpack.waitForModule<{
  imageWrapper: string;
  imagePlaceholderOverlay: string;
}>(webpack.filters.byProps("imageWrapper", "imagePlaceholderOverlay"));

interface LensConfig {
  show: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageModalWrapperProps {
  setUpdateLensConfig: (callback: (lensConfig: LensConfig) => void) => void;
}

interface ImageModalWrapperState {
  lensConfig: LensConfig;
}

export class ImageModalWrapper extends React.PureComponent<
  ImageModalWrapperProps,
  ImageModalWrapperState
> {
  props: any;
  state: any;
  setState: any;
  imgRef: any;
  $image: any;

  constructor(props: ImageModalWrapperProps) {
    super(props);
    this.imgRef = React.createRef();
    this.$image = null;
    this.state = {
      lensConfig: {},
    };

    props.setUpdateLensConfig((lensConfig: LensConfig) => {
      this.setState({ lensConfig });
    });
  }

  async componentDidMount() {
    await this.updateCurrentImg();
  }

  render() {
    return (
      <>
        <Lens {...this.state.lensConfig} />
        <div
          className={this.state.lensConfig.show ? "image-tools-blur-image" : ""}
          ref={this.imgRef}
          onMouseDown={() => {
            this.imgRef.current.click();
          }}>
          {" "}
          {this.props.children}{" "}
        </div>
      </>
    );
  }

  async updateCurrentImg() {
    this.props.set$image(await this.waitFor());
  }

  async waitFor(): Promise<HTMLElement | null> {
    const elem = this.imgRef.current?.querySelector(`.${imageWrapper} > img, video, canvas`);

    if (!elem || elem?.classList?.contains(imagePlaceholderOverlay)) {
      await util.sleep(5);
      return this.waitFor();
    }

    return elem;
  }
}
