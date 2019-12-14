import { AlgorithmType } from "../../algorithms/Algorithm";
import ImageAlgorithm from "../../algorithms/image/ImageAlgorithm";
import Point from "../../models/Point";
import Rect, { copyRect, getPointPosition, Position, standardization } from "../../models/Rect";
import CanvasCommonHandler from "./CanvasCommonHandler";

export default class ImageCommonHandler extends CanvasCommonHandler {
  readonly operateType = "image";
  readonly pickTolerance: number = 8;
  readonly supportedAlgorithmTypes = ["_InternalImage"] as AlgorithmType[];

  protected dragPosition?: Position;
  protected dragPoint?: Point;

  protected dragImagePoint?: Point;

  public imageBitmap?: ImageBitmap;

  public loadImage(imageBitmap: ImageBitmap) {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.setImage(imageBitmap);
    algorithm.startWork();
    this.drawAnimateFrame();
  }

  public acceptImageRect() {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.applyImageRect();
    algorithm.stopWork();
    this.applyImageData(); // 清除动画帧残留
    this.draw();
    this.dragPosition = this.dragPoint = this.dragImagePoint = undefined;
    algorithm.reset();
  }

  public abandon() {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.stopWork();
    algorithm.reset();
    this.applyImageData(); // 清除动画帧残留
    this.draw();
  }

  protected mouseDownHandler = (event: MouseEvent) => {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    // 当前算法已经确定提交则不处理
    if (!algorithm.working) return;

    const imageRect = algorithm.getImageRect();
    const current = new Point(event.offsetX, event.offsetY);

    // 标准化 imageRect，以暂时消除 BUG，如果要做翻转，这里不能这样写
    const standardRect = standardization(copyRect(imageRect));

    // 获取拖拽点的位置
    this.dragPosition = getPointPosition(
      current,
      standardRect,
      this.pickTolerance
    );
    // 如果当前拖拽位置处于边
    if (this.dragPosition !== undefined) {
      this.dragPoint = current;
      return;
    }
    // 如果当前点处于图像矩形区域内
    if (current.inRect(standardRect)) {
      this.dragImagePoint = current;
      return;
    }
  };

  protected KeyUpHandler = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      // 按下回车键确认
      case "enter":
        this.acceptImageRect();
        break;
      // 按下 Esc 键放弃
      case "escape":
        this.abandon();
        break;
      default:
        break;
    }
  };

  protected mouseLeaveHandler = (event: MouseEvent) => {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.applyImageRect();
    this.dragPosition = this.dragPoint = this.dragImagePoint = undefined;
  };

  protected mouseUpHandler = (event: MouseEvent) => {
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    algorithm.applyImageRect();
    this.dragPosition = this.dragPoint = this.dragImagePoint = undefined;
  };

  protected mouseMoveHandler = (event: MouseEvent) => {
    const current = new Point(event.offsetX, event.offsetY);
    const algorithm = this.getAlgorithm() as ImageAlgorithm;
    let imageRect: Rect;
    try {
      imageRect = algorithm.getImageRect();
    } catch (error) {
      return; // 当前 canvas 引用还未注入
    }
    const canvasHtmlElememt = this.getCanvasHTMLElement();

    // 标准化 imageRect，以暂时消除 BUG，如果要做翻转，这里不能这样写
    const standardRect = standardization(copyRect(imageRect));

    this.handleImageTransform(
      algorithm,
      canvasHtmlElememt,
      standardRect,
      current
    );
    this.handleImageMove(algorithm, canvasHtmlElememt, standardRect, current);
    this.drawAnimateFrame();
  };

  protected drawAnimateFrame() {
    const imageAlgorithm = this.getAlgorithm() as ImageAlgorithm;
    if (imageAlgorithm.working) {
      this.applyImageData(); // 清除上一帧残留
      const newImageData = this.getNewImageData();
      this.applyImageData(imageAlgorithm.drawStretchedBorder(newImageData));
    }
  }

  private handleImageMove(
    algorithm: ImageAlgorithm,
    canvasHtmlElement: HTMLCanvasElement,
    imageRect: Rect,
    current: Point
  ) {
    // 添加 cursor
    const grabArea = copyRect(imageRect);

    if (current.inRect(grabArea) && this.dragPoint === undefined) {
      canvasHtmlElement.style.cursor = "grab";
    }

    if (this.dragImagePoint === undefined) return;

    // 添加 cursor
    canvasHtmlElement.style.cursor = "grabbing";

    const offsetX: number = this.dragImagePoint.X - current.X;
    const offsetY: number = this.dragImagePoint.Y - current.Y;

    algorithm.setImageRect({
      origin: imageRect.origin.copy().addSize(-offsetX, -offsetY),
      size: imageRect.size
    });

    this.drawAnimateFrame();
  }
  private handleImageTransform(
    algorithm: ImageAlgorithm,
    canvasHtmlElement: HTMLCanvasElement,
    imageRect: Rect,
    current: Point
  ) {
    const currentPointPosition = getPointPosition(
      current,
      imageRect,
      this.pickTolerance
    );

    // 添加 cursor

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
        if (this.dragPoint === undefined) {
          canvasHtmlElement.style.cursor = "default";
        }
        break;
    }

    if (!algorithm.working) {
      canvasHtmlElement.style.cursor = "default";
    }

    // 非拖拽模式直接返回
    if (this.dragPoint === undefined || this.dragPosition === undefined) return;

    const offsetX: number = this.dragPoint.X - current.X;
    const offsetY: number = this.dragPoint.Y - current.Y;

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
  }
}
