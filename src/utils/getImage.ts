import { common, webpack } from "replugged";
const {
  messages: { getMessages },
} = common;

export default function (channelId: string): void {
  const results = [];
  const IMG_EXPANSIONS = ["png", "gif", "jpg"];

  getMessages(channelId).forEach(({ attachments, embeds }) => {
    if (attachments?.length) {
      results.push(
        ...attachments.filter(({ filename }) => IMG_EXPANSIONS.some((e) => filename.endsWith(e))),
      );
    }
    if (embeds?.length) {
      results.push(
        ...embeds
          .filter(({ image }) => image)
          .map(({ image }) => ({
            ...image,
            proxy_url: image.proxyURL,
          })),
      );
    }
  });
  return results;
}
