import { common } from "replugged";
import Patcher from "../patches/overlay";
import getImages from "../utils/getImage";
const { React, channels: { getChannelId } } = common;



export default class Overlay extends React.PureComponent {
    constructor(props){
        super(props);
        this.patcher = new Patcher(props.children);
        this.images = getImages(getChannelId());
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
    }
  
    render(){
        return (<div onClick={(e) => console.log(e)}>{this.props.children}</div>)
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
      // const updateLens = () => {
      //   this.updateLensConfig({
      //     getRectImage: () => $image.getBoundingClientRect()
      //   });
      // };
  
      this.setState({ $image }, () => {
        updateIU();
        updateLens();
      });
    }
  
    updateUI (data) {
      this.sendDataToUI(data);
    }
}

