import { Injector, Logger, webpack } from "replugged";
import Patcher from "./patches/index"

class ImageUtilities {
  private inject = new Injector();
  private logger = Logger.plugin("ImageUtilities");
  private patcher = new Patcher();


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




