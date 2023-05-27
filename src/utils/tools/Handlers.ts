interface Current {
  positionX: number;
  positionY: number;
  radius: number;
  zooming: number;
  wheelStep: number;
}

interface Borders {
  radius: [number, number];
  zooming: [number, number];
  wheelStep: [number, number];
}


export default new (class LensHandlers {
  public onMouseButton(e: MouseEvent): { show: boolean } {
    const res = { show: false };

    if (e.button !== 2) {
      res.show = e.type === "mousedown";
    }
    return res;
  }

  public onMouseMove(e: MouseEvent): { positionX: number, positionY: number } {
    return {
      positionX: e.clientX,
      positionY: e.clientY,
    };
  }

  public onWheel(e: WheelEvent, current: Current, borders: Borders): { [key: string]: number } {
    const change = (target: keyof Borders): { [key: string]: number } => {
      const [min] = borders[target];
      const step = target === "wheelStep" ? min : current.wheelStep * min;
      const plus = e.deltaY < 0 ? step : step * -1;
  
      return {
        [target]: fixConfines(Number(current[target]) + plus, borders[target]),
      };
    };
  
    if (e.ctrlKey) {
      return change("radius");
    } else if (e.shiftKey) {
      return change("wheelStep");
    }
    return change("zooming");
  }
})();

function fixConfines(num: number, borders: [number, number]): number {
  const [min, max] = borders;

  if (num < min) {
    num = min;
  }
  if (num > max) {
    num = max;
  }
  return Number(num);
}
