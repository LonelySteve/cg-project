import Color from "../../models/Color";
import ImageDataEx from "../../models/ImageDataEx";
import Point from "../../models/Point";
import StackAlgorithm from "../StackAlgorithm";

export interface IHasBorderColor {
  borderColor: Color;
}

export function instanceOfHasBorderColor(
  object: any
): object is IHasBorderColor {
  return "borderColor" in object;
}

export default abstract class PolygonAlgorithm extends StackAlgorithm
  implements IHasBorderColor {
  public borderColor: Color = Color.black;

  public setBorderColor(color: Color) {
    this.borderColor = color;
    return this;
  }

  public updateImageData(imageData: ImageDataEx) {
    let drawPoints = new Array<Point>();

    // 添加起始点到绘制点栈中，闭合多边形
    if (!this.working && this.points.length > 0) {
      this.addPoint(this.points[0]);
    }
    for (let i = 0; i < this.points.length; i++) {
      if (i === 0) {
        continue;
      }
      const prevPoint = this.points[i - 1];
      const nextPoint = this.points[i];
      drawPoints = drawPoints.concat(this.lineTwoPoints(prevPoint, nextPoint));
    }
    imageData.setPixels(drawPoints, this.borderColor);

    return imageData;
  }

  protected abstract lineTwoPoints(startPoint: Point, endPoint: Point): Point[];
}
