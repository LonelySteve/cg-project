import ImageDataEx from "../../models/ImageDataEx";
import Point from "../../models/Point";
import Rect, { getPoint, Position } from "../../models/Rect";
import Size from "../../models/Size";
import Algorithm from "../Algorithm";

export default abstract class ImageAlgorithm extends Algorithm {
  readonly edgeLength: number = 8;

  public ctx?: CanvasRenderingContext2D | undefined;

  public image?: ImageBitmap;

  protected imageRect?: Rect;
  // 临时用于存储形状改变时的矩形数据，当工作结束才同步至 imageRect
  private _imageRect?: Rect;

  public getImage() {
    if (this.image === undefined) {
      throw new Error("未定义位图数据！");
    }
    return this.image;
  }

  public setImage(image: ImageBitmap) {
    this.image = image;
    this.imageRect = this.getCenterRect();
  }

  reset(): void {
    this.image = undefined;
    this._imageRect = this.imageRect = undefined;
  }

  public getImageRect() {
    if (this.imageRect === undefined) {
      return (this.imageRect = this.getCenterRect());
    }
    return this.imageRect;
  }

  public setImageRect(rect: Rect) {
    if (this.working) {
      this._imageRect = rect;
    } else {
      this.imageRect = rect; // 非工作时强行设置 rect， 可能会导致 BUG
    }
    return this;
  }

  public applyImageRect() {
    this.imageRect = this._imageRect;
  }

  public getCtx(): CanvasRenderingContext2D {
    if (this.ctx === undefined) {
      throw new Error("当前 canvas 上下文未定义！");
    }
    return this.ctx;
  }

  public setCtx(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    return this;
  }

  protected getWorkingImageRect() {
    // 首先判断 _imageRect 是否可用，如果不可用，再考虑使用 imageRect 缓存
    if (this.working && this._imageRect) {
      return this._imageRect;
    }
    return this.getImageRect();
  }

  protected getCenterRect(): Rect {
    const [canvasWidth, canvasHeight] = [
      this.getCtx().canvas.width,
      this.getCtx().canvas.height
    ];
    const image = this.getImage();
    const [imageWidth, imageHeight] = [image.width, image.height];
    // 要保证图片能够按比例缩放且居中
    let [scaledImageWidth, scaledImageHeight] = [imageWidth, imageHeight];
    if (canvasWidth / canvasHeight > imageWidth / imageHeight) {
      scaledImageHeight = canvasHeight;
      scaledImageWidth = (imageWidth / imageHeight) * scaledImageHeight;
    } else {
      scaledImageWidth = canvasWidth;
      scaledImageHeight = (imageHeight / imageWidth) * scaledImageWidth;
    }
    return {
      origin: new Point(
        (canvasWidth - scaledImageWidth) / 2,
        (canvasHeight - scaledImageHeight) / 2
      ).round(),
      size: new Size(scaledImageWidth, scaledImageHeight)
    };
  }

  public drawStretchedBorder(imageData: ImageDataEx, edgeLength?: number) {
    const edge =
      edgeLength === undefined || edgeLength <= 0
        ? this.edgeLength
        : edgeLength;
    const imageRect = this.getWorkingImageRect();
    if (imageRect === undefined) {
      throw new Error("未知图像尺寸");
    }
    // 为了提示用户其未完成状态，故需绘制一个边框，并且，为了视觉效果，该边框还必须与背景色进行黑白反色工作
    imageData.reverseRectBorderColor(imageRect);
    // 接下来绘制八个框框，这八个框框分别位于图像的 左上，上，右上，右，右下，下，左下，左
    const drawRectByCenterPoint = (point: Point) => {
      imageData.reverseRectBorderColor({
        origin: new Point(point.X - edge / 2, point.Y - edge / 2),
        size: new Size(edge, edge)
      });
    };
    // 左上
    drawRectByCenterPoint(getPoint(imageRect, Position.leftUp));
    // 上
    drawRectByCenterPoint(getPoint(imageRect, Position.up));
    // 右上
    drawRectByCenterPoint(getPoint(imageRect, Position.rightUp));
    // 右
    drawRectByCenterPoint(getPoint(imageRect, Position.right));
    // 右下
    drawRectByCenterPoint(getPoint(imageRect, Position.rightDown));
    // 下
    drawRectByCenterPoint(getPoint(imageRect, Position.down));
    // 左下
    drawRectByCenterPoint(getPoint(imageRect, Position.leftDown));
    // 左
    drawRectByCenterPoint(getPoint(imageRect, Position.left));
    return imageData;
  }
}
