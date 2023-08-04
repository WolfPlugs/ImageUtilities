import { common, components, i18n, webpack } from "replugged"

const { Modal: { ModalRoot } } = components
const { i18n: { Messages } } = common

const openImageModal = webpack.getFunctionBySource(webpack.getBySource(".MEDIA_MODAL_CLOSE,"), ".MEDIA_MODAL_CLOSE,")
const { modal, image } = webpack.getByProps(['modal', 'image'])
const { openModal } = webpack.getByProps(['openModal'])
const { Anchor } = webpack.getByProps(['Anchor'])

export default ({ original, src, width, height, stickerAssets }) => {
  openModal((props) =>
    <ModalRoot
      className={modal}
      size='dynamic'
      aria-label={Messages.Image}
      children={
        <openImageModal
          className={image}
          src={src} height={height}
          width={width}
          renderLinkComponent={(p) => <Anchor {...p} />}
          original={original || src}
          stickerAssets={stickerAssets}
        />
      }
      {...props}
    />
  )

}
