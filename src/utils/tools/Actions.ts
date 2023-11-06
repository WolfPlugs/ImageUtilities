/* eslint-disable @typescript-eslint/no-extraneous-class */
import { common, util, webpack } from "replugged";
import openImageModal from "../openImageModal";
// import { nativeImage } from 'electron'
const { toast, api } = common;

export default class Actions {
  public static openImage(args) {
    const defaultArgs = {
      height: 1024,
      width: 1024,
    };

    const { height, width, ...restArgs } = args;

    const finalArgs = {
      height: height || defaultArgs.height,
      width: width || defaultArgs.width,
      ...restArgs,
    };
    openImageModal(finalArgs);
  }

  public static openLink(url, { original }) {
    util.openExternal(original || url);
  }

  public static copyLink(url, { original }) {
    DiscordNative.clipboard.copy(original || url);
    // .then(() => {
    //   toast.toast("Link copied", toast.Kind.SUCCESS);
    // });
  }

  public static copyImage(url, params) {
    const { copyImage } = webpack.getByProps(["copyImage"]);
    copyImage(url)
      .then(() => {
        toast.toast("Image copied", toast.Kind.SUCCESS);
      })
      .catch(() =>
        Actions._fetchImage(url)
          .then((res) => {
            DiscordNative.clipboard.copyImage(res);
            toast.toast("Image copied", toast.Kind.SUCCESS);
          })
          .catch((e) => {
            // output.error(`${Messages.IMAGE_TOOLS_CANT_COPY} \n ${Messages.IMAGE_TOOLS_FAILED_LOAD}`, {
            //   text: Messages.COPY_LINK,
            //   size: 'small',
            //   look: 'outlined',
            //   onClick: () => Actions.copyLink(url, params)
            // });
            // console.error(e);
          }),
      );
  }

  public static _fetchImage(initUrl) {
    const url = new URL(initUrl);

    return run(url).catch(() => {
      url.hostname = "cdn.discordapp.com";
      return run(url);
    });

    function run(U) {
      return api.get(U.href).then(({ raw }) => raw);
    }
  }
}
