import { Injector, Logger, settings } from "replugged";
import Patcher from "./patches/index"
const defaultSet = {
  lensRadius: 0,
  zoomRatio: 0,
  wheelStep: 0,
}
const theSettings = await settings.init("imageUtilities", defaultSet)

class ImageUtilities {
  private inject = new Injector();
  private logger = Logger.plugin("ImageUtilities");
  private patcher = new Patcher(theSettings); 

 public async start(): Promise<void> {
  this.patcher.start();
  }

  public stop(): void {
    this.patcher.stop();
  }
}



const plugin = new ImageUtilities();
export async function start(): Promise<void> {
  await plugin.start(); 
}

export function stop(): void {
  plugin.stop();
}




