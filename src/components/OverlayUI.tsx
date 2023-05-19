import { common, components, webpack } from "replugged";
import OverlayUITooltip from "./OverlayUITooltip";

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
    const { $image, attachment } = this.state.data;
    const { href } = this.props.originalFooter.props;
    const url = new URL(href);

    const renderTooltip = (child, text, error) => (
      <p style={{ color: (error) ? 'var(--text-danger)' : null }}>
        <OverlayUITooltip copyText={text || child} error={error}>{child}</OverlayUITooltip>
      </p>
    );
    const renderLoading = () => (
      <span className='string'>
        <p>loading...</p>
      </span>
    );
    const renderSeparator = () => (
      <p style={{ pointerEvents: 'none' }}>|</p>
    );

    const renderResolution = () => {
      const get = (t) => this.state.resolution[t] || $image[`video${t}`] || $image[`natural${t}`] || ' ? ';
      if ($image) {
        return renderTooltip(`${get('Width')}x${get('Height')}`);
      }
      return null;
    };
    const renderSize = () => {
      if (attachment) {
        const strSize = this.bytes2str(attachment.size || this.state.size);
        if (!attachment.size && !this.state.size) {
          this.loadSize($image.src);
        }
        return renderTooltip(strSize, null, (this.failedLoadSize) ? this.failedLoadSize : null);
      }
      return null;
    };

    return (
      <div className='image-info'>
        <span className='string curtail'>
          {
            renderTooltip(url.pathname.split('/').pop())
          }
        </span>
        <span className='string'>
          {
            renderResolution() || renderLoading()} {renderSeparator()} {renderSize() || renderLoading()
          }
        </span>
        <span className='string curtail'>
          {
            renderTooltip(url.href)
          }
        </span>
      </div>
    );
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


  bytes2str(bytes) {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    if (bytes === null) {
      return '-';
    }
    if (bytes === 0) {
      return '0 Bytes';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

}
