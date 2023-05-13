import { Injector, Logger, webpack } from "replugged";
import ImageModalWrapper from "./components/ImageModalWrapper";

const inject = new Injector();
const logger = Logger.plugin("PluginTemplate");

// webpack.getByProps([ 'wrapper', 'downloadLink' ])
export async function start(): Promise<void> {
  const sus = webpack.getById(159689);
  // console.log(this.children)
  
}

export function stop(): void {
  inject.uninjectAll();
}




