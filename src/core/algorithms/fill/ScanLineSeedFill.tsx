import ImageDataEx from "../../models/ImageDataEx";
import Point from "../../models/Point";
import { AlgorithmType } from "../Algorithm";
import FillAlgorithm from "./FillAlgorithm";

export default class ScanLineSeedFill extends FillAlgorithm {
  readonly algorithmType = "ScanLineSeedFill" as AlgorithmType;

  updateImageData(imageData: ImageDataEx) {
    if (this.seedPoint === undefined) {
      return imageData;
    }

    const getPixelColor = (point: Point) => {
      return imageData.getPixelColor(point);
    };

    this.addPoint(this.seedPoint);

    let xleft: number, xright: number; // 区间最左端与最右端像素
    let tempPoint: Point;
    let bSpanFill: boolean;

    const tempPointColorNotSame = (tempPoint: Point) =>
      imageData.existPixel(tempPoint) &&
      !getPixelColor(tempPoint).equals(this.fillColor) &&
      !getPixelColor(tempPoint).equals(this.borderColor);

    const handleScanLine = (popPoint: Point, i: number) => {
      tempPoint.X = xleft;
      tempPoint.Y = tempPoint.Y + i;

      while (imageData.existPixel(tempPoint) && tempPoint.X < xright) {
        bSpanFill = false;
        while (tempPointColorNotSame(tempPoint)) {
          bSpanFill = true;
          tempPoint.X++;
        }
        if (bSpanFill) {
          if (tempPoint.X === xright && tempPointColorNotSame(tempPoint)) {
            tempPoint.copyTo(popPoint);
          } else {
            popPoint.X = tempPoint.X - 1;
          }
          popPoint.Y = tempPoint.Y;
          this.addPoint(popPoint.copy());
          bSpanFill = false;
        }
        const tempPointColor = getPixelColor(tempPoint);

        while (
          imageData.existPixel(tempPoint) &&
          ((tempPointColor.equals(this.borderColor) && tempPoint.X < xright) ||
            (tempPointColor.equals(this.fillColor) && tempPoint.X < xright))
        ) {
          tempPoint.X++;
        }
      }
    };

    while (this.points.length > 0) {
      let popPoint = this.popPoint();
      if (popPoint === undefined) {
        break;
      }
      if (getPixelColor(popPoint).equals(this.fillColor)) {
        continue;
      }

      tempPoint = popPoint.copy();

      while (tempPointColorNotSame(tempPoint)) {
        imageData.setPixel(tempPoint, this.fillColor);
        tempPoint.X++;
      }
      xright = tempPoint.X - 1;
      tempPoint.X = popPoint.X - 1;
      while (tempPointColorNotSame(tempPoint)) {
        imageData.setPixel(tempPoint, this.fillColor);
        tempPoint.X--;
      }
      xleft = tempPoint.X + 1;
      // 处理上一条扫描线
      handleScanLine(popPoint, 1);
      // 处理下一条扫描线
      handleScanLine(popPoint, -2);
    }
    return imageData;
  }
}
