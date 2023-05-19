export default new(class LensHandlers {
  public onMouseButton(e) {
    const res = {};

    if (e.button !== 2) {
      res.show = e.type === "mousedown";
    }
    return res;
  }

  public onMouseMove(e) {
    return {
      positionX: e.clientX,
      positionY: e.clientY,
    };
  }

  public onWheel(e, current, borders) {
    const change = (target) => {
      const [min] = borders[target];
      const step = target === "wheelStep" ? min : current.wheelStep * min;
      const plus = e.deltaY < 0 ? step : step * -1;

      return {
        [target]: fixConfines(current[target] + plus, borders[target]),
      };
    };

    if (e.ctrlKey) {
      return change("radius");
    } else if (e.shiftKey) {
      return change("wheelStep");
    }
    return change("zooming");
  }
})

function fixConfines(num, borders) {
  const [min, max] = borders;

  if (num < min) {
    num = min;
  }
  if (num > max) {
    num = max;
  }
  return Number(num);
}
