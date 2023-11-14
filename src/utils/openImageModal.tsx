import { common, components, webpack } from "replugged";

const {
  Modal: { ModalRoot },
} = components;
const {
  i18n: { Messages },
  modal: { openModal },
} = common;

const ImageModal = webpack.getFunctionBySource(
  webpack.getBySource(".MEDIA_MODAL_CLOSE,"),
  ".MEDIA_MODAL_CLOSE,",
);

const { modal, image } = webpack.getByProps(["image", "modal"],{all:true}).find(c => c.applicationIcon === void 0);
const MaskedLink = webpack.getBySource(".MASKED_LINK)");
export default ({ original, src, width, height, stickerAssets }) => {
  openModal((props) => (
    <ModalRoot className={modal} size={"dynamic"} {...props}>
      <ImageModal
        className={image}
        shouldAnimate={true}
        src={src}
        placeholder={src}
        height={height}
        width={width}
        renderLinkComponent={(props) => <MaskedLink {...props} />}
        original={original || src}
      />
    </ModalRoot>
  ));
};
