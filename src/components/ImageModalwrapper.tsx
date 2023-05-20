import { common, util, webpack } from "replugged";
import Lens from "../utils/tools/index";

const { React } = common;
// @ts-ignore
const { imageWrapper, imagePlaceholderOverlay } = webpack.getByProps([
  "imageWrapper",
  "imagePlaceholderOverlay",
]);

export class ImageModalWrapper extends React.PureComponent {
  props: any;
  state: any;
  setState: any;
  imgRef: any;
  $image: any;

  constructor(props) {
    super(props);
    this.imgRef = React.createRef();
    this.$image = null;
    this.state = {
      lensConfig: {}
    };


    props.setUpdateLensConfig((lensConfig) => {
      this.setState({ lensConfig });
    });
  }



  componentDidMount() {
    this.updateCurrentImg();
  }

  render() {
    return (
      <>
        <Lens {...this.state.lensConfig} />
        <div
          className={[this.state.lensConfig.show ? "image-tools-blur-image" : ""]}
          ref={this.imgRef}
          onMouseDown={() => {
            this.imgRef.current.click(); // чтобы скрыть меню перед линзой
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

  async waitFor() {
    const elem = this.imgRef.current?.querySelector(`.${imageWrapper} > img, video, canvas`);

    if (!elem || elem?.classList?.contains(imagePlaceholderOverlay)) {
      await util.sleep(5);
      return this.waitFor();
    }

    return elem;
  }


}
