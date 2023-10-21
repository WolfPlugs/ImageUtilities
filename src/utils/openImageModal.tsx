import { common, components, i18n, webpack } from "replugged";

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
const { modal, image } = webpack.getByProps(["modal", "image"]);
const MaskedLink = webpack.getBySource(".MASKED_LINK)");

export default ({ original, src, width, height, stickerAssets }) => {
  openModal((props) => (
    <ModalRoot className={modal} size={"dynamic"} {...props}>
      <ImageModal
        className={image}
        shouldAnimate={true}
        src={src}
        placeholder={src}
        renderLinkComponent={(p) => <MaskedLink {...p} />}
        original={original || src}
      />
    </ModalRoot>
  ));
};
