// find replugged react
import { common } from "replugged";

const { React } = common;

export default class Lens extends React.PureComponent {
  render() {
    const style = { parent: {}, child: {}, raw: { x: 0, y: 0 } };

    if (this.props.show) {
      const [parentPos, childPos, rawPos] = this.getPos(this.props);
      const [parentSize, childSize] = this.getSize(this.props);

      style.parent = {
        display: "block",
        left: `${parentPos.x}px`,
        top: `${parentPos.y}px`,
        width: `${parentSize.w}px`,
        height: `${parentSize.h}px`,
        ...this.props.style,
      };
      style.child = {
        transform: `translate(${childPos.x}px, ${childPos.y}px)`,
        width: `${childSize.w}px`,
        height: `${childSize.h}px`,
      };
      style.raw = {
        ...rawPos,
      };
    }
    return (
      <>
        <div className="image-tools-lens" style={style.parent}>
          <div style={style.child}>{this.props.children}</div>
        </div>
        {this.props.renderPreview && this.props.renderPreview(style.raw)}
      </>
    );
  }

  getPos({ radius, zooming, positionX, positionY, getRectImage }) {
    const { left, right, top, bottom } = getRectImage();
    const X = fixConfines(positionX, [left, right]) - left;
    const Y = fixConfines(positionY, [top, bottom]) - top;

    return [
      {
        x: X - radius,
        y: Y - radius,
      },
      {
        x: radius - X * zooming,
        y: radius - Y * zooming,
      },
      {
        x: X,
        y: Y,
      },
    ];
  }

  getSize({ radius, zooming, getRectImage }) {
    const { width, height } = getRectImage();
    return [
      {
        w: radius * 2,
        h: radius * 2,
      },
      {
        w: width * zooming,
        h: height * zooming,
      },
    ];
  }
}

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
