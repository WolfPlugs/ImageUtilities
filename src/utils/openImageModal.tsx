import { webpack, components, i18n, common } from "replugged"

const { Modal: { ModalRoot } } = components
const { i18n: { Messages } } = common

const { modal, image } = webpack.getByProps([ 'modal', 'image' ])
const { openModal } = webpack.getByProps([ 'openModal' ])
const { Anchor } = webpack.getByProps([ 'Anchor' ])

export default ({ original, src, width, height, stickerAssets }) => {
  openModal((props) => 
    <ModalRoot className={modal} size='dynamic' aria-label={Messages.Image} children={
      <
    } />
  )

}
