import ImageDataEx from "../../models/ImageDataEx";
import Point from "../../models/Point";
import { AlgorithmType } from "../Algorithm";
import FillAlgorithm from "./FillAlgorithm";

export default class AreaEightNeighborContactSeedFill extends FillAlgorithm {
  readonly algorithmType = "AreaEightNeighborContactSeedFill" as AlgorithmType;

  private searchPoint(imageData: ImageDataEx, point: Point) {
    const pointColor = imageData.getPixelColor(point);
    if (
      imageData.existPixel(point) &&
      !pointColor.equals(this.borderColor) &&
      !pointColor.equals(this.fillColor)
    ) {
      this.addPoint(point);
    }
  }

  updateImageData(imageData: ImageDataEx) {
    // 如果当前没有种子点，则直接返回参数
    if (this.seedPoint === undefined) {
      return imageData;
    }

    this.addPoint(this.seedPoint);
    while (this.points.length > 0) {
      // 如果栈不为空
      const popPoint = this.popPoint();
      if (popPoint === undefined) {
        break;
      }
      if (
        imageData.existPixel(popPoint) &&
        this.fillColor.equals(imageData.getPixelColor(popPoint))
      ) {
        continue; // 跳过颜色相同的像素点
      }
      // 这里必须立即绘制点
      imageData.setPixel(popPoint, this.fillColor);
      // 搜索出栈点左方点的情况
      this.searchPoint(imageData, popPoint.left);
      // 搜索出栈点左上方点的情况
      this.searchPoint(imageData, popPoint.leftUp);
      // 搜索出栈点上方点的情况
      this.searchPoint(imageData, popPoint.up);
      // 搜索出栈点右上方点的情况
      this.searchPoint(imageData, popPoint.rightUp);
      // 搜索出栈点右点的情况
      this.searchPoint(imageData, popPoint.right);
      // 搜索出栈点右下点的情况
      this.searchPoint(imageData, popPoint.rightDown);
      // 搜索出栈点下点的情况
      this.searchPoint(imageData, popPoint.down);
      // 搜索出栈点左下点的情况
      this.searchPoint(imageData, popPoint.leftDown);
    }
    return imageData;
  }
}
