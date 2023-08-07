import { common } from "replugged";
import lensSettings from "../../structures/lensSettings";
import CustomContextMenu from "../../patches/ContextMenu";

const { React } = common;

export default class LensSettings extends React.PureComponent {
  static render (props) {    
    return CustomContextMenu.renderRawItems(lensSettings(props))
  }
}
