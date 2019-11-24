import { Color, Point } from "../models/Base";

export default class ImageDataEx extends ImageData {
  /**
   * 将指定点数组以指定颜色数组绘制到画布的指定偏移点上，绘制颜色和偏移点是可选的
   *
   * 当点数组和颜色数组长度不对等的时候，有以下三种情况：
   *
   * - 颜色数组长度为0：取黑色
   * - 颜色数组长度短于点数组：当颜色数组的颜色依次应用到绘制点后，剩余的绘制点沿用最后一个有效颜色
   * - 颜色数组长度长于点数组：舍弃多余的颜色
   *
   * @param points
   * @param colors
   * @param dPoint
   */
  public setPoints(points: Point[], ...colors: Color[]) {
    for (let index = 0, color = Color.black; index < points.length; index++) {
      const point = points[index];
      if (index < colors.length) {
        color = colors[index];
      }

      this.data[point.Y * this.width * 4 + point.X * 4 + 0] = color.red;
      this.data[point.Y * this.width * 4 + point.X * 4 + 1] = color.green;
      this.data[point.Y * this.width * 4 + point.X * 4 + 2] = color.blue;
      this.data[point.Y * this.width * 4 + point.X * 4 + 3] = color.alpha;
    }
  }
}
