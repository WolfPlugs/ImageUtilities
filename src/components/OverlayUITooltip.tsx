import { common, components } from "replugged";
import { Clipboard } from "../utils/clipboard";
const {
  React,
  i18n: { Messages },
} = common;
const { Tooltip, Clickable } = components;

export default class OverlayUIToolTip extends React.PureComponent {
  state: any;
  props: any;

  constructor(props) {
    super(props);
    this.state = {
      text: null,
    };
    this.openTooltip = this.openTooltip.bind(this);
  }

  render() {
    const isError = this.props.error;

    return (
      <Tooltip
        text={isError ? this.props.error.toString() : this.state.text}
        color={isError ? "red" : "green"}
        forceOpen={!isError}>
        <Clickable onClick={this.openTooltip}>{this.props.children}</Clickable>
      </Tooltip>
    );
  }

  openTooltip() {
    if (this.props.error) return;
    this.setState({ text: Messages.COPIED });
    Clipboard.copy(this.props.copyText);
    setTimeout(() => this.setState({ text: null }), 1000);
  }
}
