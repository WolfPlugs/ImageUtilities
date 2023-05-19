import { common, components, webpack } from "replugged";

const { Text } = components;
const { React } = common;
const { downloadLink } = webpack.getByProps(["downloadLink"]);


export default class ImageToolsOverlayUI extends React.PureComponent {
  constructor({ sendDataToUI }) {
    super();
    sendDataToUI(this.getData.bind(this));

    this.state = {
      data: {},
      size: 0,
      resolution: { width: null, height: null },
    };
    this.failedLoadSize = false;
  }

  render() {
    return (
      <div className="image-tools-overlay-ui" style={{ color: "white", fontSize: "90px" }}>
        {this.renderLensConfig()}
        {this.renderHeader()}
        {this.renderFooter()}
      </div>
    )
  }

  private renderLensConfig() {
    return (
      <div className='lens-config'>
        <div className={`lens lens-hide`}></div>
        <Text>{ }: {Number(10).toFixed(1)}x</Text>
        <Text>{`[CTRL]`}: {Number(100).toFixed()}px</Text>
        <Text>{`[SHIFT]`}: {Number(50).toFixed(2)}</Text>
      </div>
    )
  }

  private renderHeader() {
    return (
      <div className='header'>
        {
          // console.log(this.props)
        }
      </div>
    )
  }

  private renderFooter() {
    return (
      <div className={`footer ${downloadLink}`}>
        <div className='content'>
          {this.props.originalFooter}
          {this.renderInfo()}
        </div>
      </div>
    )
  }

  private renderInfo() {
    // console.log(this.state.data)
  }

  private getData(obj) {
    const onStated = () => {
      const { $image } = obj;
      if (obj.lensConfig) {
        this.setState(() => ({
          showConfig: true
        }),
        this.hideConfig);
      }
      if ($image) {
        $image.addEventListener('loadedmetadata', () => {
          this.setState({
            resolution: { Width: obj.$image.videoWidth, Height: obj.$image.videoHeight }
          });
        }, false);
        $image.addEventListener('load', () => {
          this.setState({
            resolution: { Width: obj.$image.naturalWidth, Height: obj.$image.naturalHeight }
          });
        });
        if ($image.tagName !== 'IMG' && $image.tagName !== 'VIDEO') {
          this.setState({
            resolution: { Width: obj.$image.width, Height: obj.$image.height }
          });
        }
      }
    };

    this.setState(({ data }) => ({
      data: { ...data, ...obj }
    }),
    onStated);

  }

}
