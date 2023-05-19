import { webpack } from "replugged";

const mod = await webpack.waitForModule(
  webpack.filters.bySource(
    'document.queryCommandEnabled("copy")||document.queryCommandSupported("copy")',
  ),
);

export const Clipboard: { SUPPORTED: boolean; copy: (content: string) => unknown } = {
  copy: Object.values(mod).find((e) => typeof e === "function") as (args: string) => void,
  SUPPORTED: Object.values(mod).find((e) => typeof e === "boolean") as unknown as boolean,
};
