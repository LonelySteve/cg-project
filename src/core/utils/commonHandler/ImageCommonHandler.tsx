import { AlgorithmType } from "../../algorithms/Algorithm";
import ImageAlgorithm from "../../algorithms/image/ImageAlgorithm";
import Point from "../../models/Point";
import Rect, { getPointPosition, Position, standardization } from "../../models/Rect";
import CanvasCommonHandler from "./CanvasCommonHandler";

export default class ImageCommonHandler extends CanvasCommonHandler {
  readonly operateType = "image";
  readonly pickTolerance: number = 8;
  readonly supportedAlgorithmTypes = ["_InternalImage"] as AlgorithmType[];

  protected dragPosition?: Position;
  protected dragPoint?: Point;

  public imageBitmap?: ImageBitmap;

  public loadImage(imageBitmap: ImageBitmap) {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.setImage(imageBitmap);
    algorithm.startWork();
    this.drawAnimateFrame();
  }

  public acceptImageRect() {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.stopWork();
    this.applyImageData(); // 清除动画帧残留
    this.draw();
    algorithm.reset();
  }

  public abandon() {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.stopWork();
    algorithm.reset();
    this.applyImageData(); // 清除动画帧残留
    this.draw();
  }

  mouseDownHandler: React.MouseEventHandler<HTMLCanvasElement> = event => {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    // 当前算法还没确定提交
    if (algorithm.working) {
      const imageRect = algorithm.getImageRect();
      const current = new Point(
        event.nativeEvent.offsetX,
        event.nativeEvent.offsetY
      );
      // 获取拖拽点的位置
      this.dragPosition = getPointPosition(
        current,
        imageRect,
        this.pickTolerance
      );
      if (this.dragPosition !== undefined) {
        this.dragPoint = current;
      }
    }
  };

  mouseLeaveHandler: React.MouseEventHandler<HTMLCanvasElement> = event => {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.applyImageRect();
    this.dragPosition = this.dragPoint = undefined;
  };

  mouseUpHandler: React.MouseEventHandler<HTMLCanvasElement> = event => {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.applyImageRect();
    this.dragPosition = this.dragPoint = undefined;
  };

  mouseMoveHandler: React.MouseEventHandler<HTMLCanvasElement> = event => {
    const current = new Point(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY
    );

    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    let imageRect: Rect;
    try {
      imageRect = algorithm.getImageRect();
    } catch (error) {
      return; // 当前 canvas 引用还未注入
    }
    const currentPointPosition = getPointPosition(
      current,
      imageRect,
      this.pickTolerance
    );
    const canvasHtmlElement = this.getCanvasHTMLElement();

    // 添加 cursor
    if (this.dragPosition === undefined) {
      switch (currentPointPosition) {
        case Position.up:
        case Position.down:
          canvasHtmlElement.style.cursor = "ns-resize";
          break;
        case Position.left:
        case Position.right:
          canvasHtmlElement.style.cursor = "ew-resize";
          break;
        case Position.leftUp:
        case Position.rightDown:
          canvasHtmlElement.style.cursor = "nwse-resize";
          break;
        case Position.rightUp:
        case Position.leftDown:
          canvasHtmlElement.style.cursor = "nesw-resize";
          break;
        default:
          canvasHtmlElement.style.cursor = "default";
          break;
      }
    }

    if (!algorithm.working) {
      canvasHtmlElement.style.cursor = "default";
    }

    if (this.dragPosition !== undefined && this.dragPoint !== undefined) {
      const offsetX: number = this.dragPoint.X - current.X;
      const offsetY: number = this.dragPoint.Y - current.Y;
      // 标准化 imageRect，以暂时消除 BUG，如果要做翻转，这里不能这样写
      standardization(imageRect);
      switch (this.dragPosition) {
        case Position.right:
          algorithm.setImageRect({
            origin: imageRect.origin,
            size: imageRect.size.copy().addSize(-offsetX, 0)
          });
          break;
        case Position.down:
          algorithm.setImageRect({
            origin: imageRect.origin,
            size: imageRect.size.copy().addSize(0, -offsetY)
          });
          break;
        case Position.up:
          algorithm.setImageRect({
            origin: imageRect.origin.copy().addSize(0, -offsetY),
            size: imageRect.size.copy().addSize(0, offsetY)
          });
          break;
        case Position.left:
          algorithm.setImageRect({
            origin: imageRect.origin.copy().addSize(-offsetX, 0),
            size: imageRect.size.copy().addSize(offsetX, 0)
          });
          break;
        case Position.rightDown:
          algorithm.setImageRect({
            origin: imageRect.origin,
            size: imageRect.size.copy().addSize(-offsetX, -offsetY)
          });
          break;
        case Position.leftDown:
          algorithm.setImageRect({
            origin: imageRect.origin.copy().addSize(-offsetX, 0),
            size: imageRect.size.copy().addSize(offsetX, -offsetY)
          });
          break;
        case Position.rightUp:
          algorithm.setImageRect({
            origin: imageRect.origin.copy().addSize(0, -offsetY),
            size: imageRect.size.copy().addSize(-offsetX, offsetY)
          });
          break;
        case Position.leftUp:
          algorithm.setImageRect({
            origin: imageRect.origin.copy().addSize(-offsetX, -offsetY),
            size: imageRect.size.copy().addSize(offsetX, offsetY)
          });
          break;
      }
      this.drawAnimateFrame();
    }
  };

  protected drawAnimateFrame() {
    const imageAlgorithm = this.getAlgorithm() as ImageAlgorithm;
    if (imageAlgorithm.working) {
      this.applyImageData(); // 清除上一帧残留
      const newImageData = this.getNewImageData();
      this.applyImageData(imageAlgorithm.drawStretchedBorder(newImageData));
    }
  }
}
