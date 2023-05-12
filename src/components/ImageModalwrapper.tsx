import { common, webpack } from "replugged";
import Lens from "../Lens/index";

const { React } = common;
const { imageWrapper, imagePlaceholderOverlay } = webpack.getByProps([
  "imageWrapper",
  "imagePlaceholderOverlay",
]);

module.exports = class ImageModalWrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.imgRef = React.createRef();
    this.$image = null;
    this.state = {
      lengsConfig: {},
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
      await sleep(5);
      return this.waitFor();
    }

    return elem;
  }
};
