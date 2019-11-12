import Color from "./Color";
import Point from "./Point";
import Rect from "./Rect";
import Size from "./Size";

export default class ImageDataEx extends ImageData {
  public static fromImageData(imageData: ImageData, deepCopy?: boolean) {
    return new ImageDataEx(
      deepCopy ? new Uint8ClampedArray(imageData.data) : imageData.data,
      imageData.width,
      imageData.height
    );
  }
  /**
   * 将指定点数组以指定颜色数组绘制到画布的指定偏移点上，绘制颜色是不定长的
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
  public setPixels(points: Point[], ...colors: Color[]) {
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
  /**
   * 将指定点设置为指定颜色
   *
   * @param point 指定要设置颜色的点
   * @param color 指定要设置的颜色
   */
  public setPixel(point: Point, color: Color) {
    this.data[point.Y * this.width * 4 + point.X * 4 + 0] = color.red;
    this.data[point.Y * this.width * 4 + point.X * 4 + 1] = color.green;
    this.data[point.Y * this.width * 4 + point.X * 4 + 2] = color.blue;
    this.data[point.Y * this.width * 4 + point.X * 4 + 3] = color.alpha;
  }
  /**
   * 获取指定点在当前图像数据中的颜色
   *
   * @param point 欲获取像素颜色的点
   */
  public getPixelColor(point: Point) {
    const red = this.data[point.Y * this.width * 4 + point.X * 4 + 0];
    const green = this.data[point.Y * this.width * 4 + point.X * 4 + 1];
    const blue = this.data[point.Y * this.width * 4 + point.X * 4 + 2];
    const alpha = this.data[point.Y * this.width * 4 + point.X * 4 + 3];
    return new Color(red, green, blue, alpha);
  }
  /**
   * 获取指定点是否存在在当前图像数据中
   *
   * @param point 欲判断的点
   */
  public existPixel(point: Point): boolean {
    return (
      point.X < this.width &&
      point.Y < this.height &&
      0 <= point.X &&
      0 <= point.Y
    );
  }

  /**
   * 给当前图像数据填充颜色，可以指定欲填充颜色的矩形区域，如果不指定填充的颜色，则使用透明色填充
   *
   * @param fillRect 欲填充的矩形区域，缺省则填充整个图像数据
   * @param color 欲填充的颜色，缺省为透明色
   */
  public fillColor(fillRect?: Rect, color?: Color) {
    const rect = fillRect || {
      origin: Point.ORIGIN,
      size: new Size(this.width, this.height)
    };
    color = color || Color.transparent;

    const [maxX, maxY] = [
      rect.origin.X + rect.size.width,
      rect.origin.Y + rect.size.height
    ];

    // TODO 如果填充的颜色分量相等，则可以进行快速填充

    for (let y = rect.origin.Y; y < maxY; y++) {
      for (let x = rect.origin.X; x < maxX; x++) {
        this.data[y * this.width * 4 + x * 4 + 0] = color.red;
        this.data[y * this.width * 4 + x * 4 + 1] = color.green;
        this.data[y * this.width * 4 + x * 4 + 2] = color.blue;
        this.data[y * this.width * 4 + x * 4 + 3] = color.alpha;
      }
    }
  }

  /**
   * 获取当前图像数据的部分区域的放大数据
   *
   * @param zoomRect 指定要被缩放的矩形区域
   * @param zoomLevel 指定缩放等级，如果小于一则按一计
   */
  public getZoomImageData(zoomRect: Rect, zoomLevel: number) {
    zoomLevel = zoomLevel < 1 ? 1 : Math.floor(zoomLevel);
    zoomLevel = zoomLevel < 1 ? 1 : Math.floor(zoomLevel);
    // 取整处理
    const point = zoomRect.origin;

    const [zw, zh] = [zoomRect.size.width, zoomRect.size.height];
    const ul = 1 << zoomLevel;
    const [uw, uh] = [ul, ul];
    const [w, h] = [zw << zoomLevel, zh << zoomLevel];

    const retVal = new ImageDataEx(w, h);

    for (let y = 0; y < zh; y++) {
      for (let x = 0; x < zw; x++) {
        const [rx, ry] = [x + point.X, y + point.Y];
        const [ux, uy] = [x * ul, y * ul];

        const pixelColor = new Color(
          this.data[ry * this.width * 4 + rx * 4 + 0],
          this.data[ry * this.width * 4 + rx * 4 + 1],
          this.data[ry * this.width * 4 + rx * 4 + 2],
          this.data[ry * this.width * 4 + rx * 4 + 3]
        );

        // 填充单元格颜色
        retVal.fillColor(
          { origin: new Point(ux, uy), size: new Size(uw, uh) },
          pixelColor
        );
      }
    }

    return retVal;
  }

  /**
   * 将指定矩形区域的边缘颜色进行黑白反转
   *
   * @param rect 指定想反转边缘颜色的矩形区域
   */
  public reverseRectBorderColor(rect: Rect) {
    // 取整处理
    rect.origin.round();
    rect.size.round();
    const drawingPoints: Point[] = new Array<Point>();
    const drawingColors: Color[] = new Array<Color>();

    for (const y of [rect.origin.Y, rect.origin.Y + rect.size.height - 1]) {
      for (let x = rect.origin.X; x < rect.origin.X + rect.size.width; x++) {
        const currentPoint = new Point(x, y);
        if (this.existPixel(currentPoint)) {
          drawingPoints.push(currentPoint);
          drawingColors.push(
            this.getPixelColor(currentPoint).toRgb().reverseBlackOrWhite
          );
        }
      }
    }
    for (const x of [rect.origin.X, rect.origin.X + rect.size.width - 1]) {
      for (
        let y = rect.origin.Y + 1;
        y < rect.origin.Y + rect.size.height - 1;
        y++
      ) {
        const currentPoint = new Point(x, y);
        if (this.existPixel(currentPoint)) {
          drawingPoints.push(currentPoint);
          drawingColors.push(
            this.getPixelColor(currentPoint).toRgb().reverseBlackOrWhite
          );
        }
      }
    }

    this.setPixels(drawingPoints, ...drawingColors);
  }

  public deepCopy() {
    return ImageDataEx.fromImageData(this, true);
  }
}
