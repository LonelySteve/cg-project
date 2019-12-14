import Algorithm, { AlgorithmType } from "../../algorithms/Algorithm";
import Color from "../../models/Color";
import ImageDataEx from "../../models/ImageDataEx";
import Picker from "../Picker";

export interface ReactMouseEventCommonHandler<T = Element> {
  mouseUpHandler?: React.MouseEventHandler<T>;
  mouseDownHandler?: React.MouseEventHandler<T>;
  mouseEnterHandler?: React.MouseEventHandler<T>;
  mouseMoveHandler?: React.MouseEventHandler<T>;
  mouseLeaveHandler?: React.MouseEventHandler<T>;
  mouseOverHandler?: React.MouseEventHandler<T>;
  mouseOutHandler?: React.MouseEventHandler<T>;
  clickHandler?: React.MouseEventHandler<T>;
}

export type OperateType = "polygon" | "image" | "fill";

/**
 * Canvas 公用处理器基类
 */
export default abstract class CanvasCommonHandler
  implements ReactMouseEventCommonHandler<HTMLCanvasElement> {
  /**
   * 标识当前处理器进行的操作类型，这是一个只读字段
   */
  readonly operateType?: OperateType;
  /**
   * 表示此处理器支持的算法类型，这是一个只读字段
   */
  readonly supportedAlgorithmTypes: AlgorithmType[] = [];
  /**
   * 当前上下文ID，这是一个只读字段
   */
  readonly contextId = "2d";
  readonly picker = new Picker(this);
  // 默认的 canvas 背景颜色，将用于清空画布
  public defaultBgColor: Color = Color.white;
  // 当前的 canvas 引用对象
  private _canvasRef?: React.RefObject<HTMLCanvasElement>;
  private _canvasHTMLElement?: HTMLCanvasElement;
  private _ctx?: CanvasRenderingContext2D | null;
  private _imageData?: ImageData;
  // 每一种公用处理器都只对应一种算法
  private _algorithm?: Algorithm;

  /**
   * 获取当前的 canvas 引用对象
   */
  public getCanvasRef(): React.RefObject<HTMLCanvasElement> {
    if (this._canvasRef === undefined) {
      throw new Error("当前的 canvas 引用未定义！");
    }
    return this._canvasRef;
  }
  /**
   * 设置当前的 canvas 引用对象
   */
  public setCanvasRef(v: React.RefObject<HTMLCanvasElement>) {
    this._canvasRef = v;
    return this;
  }
  /**
   * 获取当前的 canvas 的元素对象
   */
  public getCanvasHTMLElement(): HTMLCanvasElement {
    if (this._canvasHTMLElement === undefined) {
      const element = this.getCanvasRef().current;
      if (element === null) {
        throw new Error("当前的 canvas 引用的元素对象无效！");
      }
      this._canvasHTMLElement = element;
    }
    return this._canvasHTMLElement;
  }
  /**
   * 获取算法对象
   */
  public getAlgorithm(): Algorithm {
    if (this._algorithm === undefined) {
      throw new Error("未定义事件处理器的算法！");
    }
    return this._algorithm;
  }
  /**
   * 设置算法对象
   */
  public setAlgorithm(v: Algorithm) {
    // 检查算法类型
    if (v.algorithmType === undefined) {
      throw new Error("貌似愚蠢的开发者忘了给新算法设定只读的类型字段呢！");
    }
    if (this.supportedAlgorithmTypes.indexOf(v.algorithmType) === -1) {
      if (this.operateType === undefined) {
        throw new Error(
          "貌似愚蠢的开发者忘了给新公用处理器设定只读的类型字段呢！"
        );
      }
      throw new Error(
        `${this.operateType} 操作不支持 ${v.algorithmType} 算法！`
      );
    }
    this._algorithm = v;
    return this;
  }
  /**
   * 获取当前 canvas 的操作上下文对象
   */
  public get ctx(): CanvasRenderingContext2D {
    if (!this._ctx) {
      this._ctx = this.getCanvasHTMLElement().getContext(this.contextId);
      if (!this._ctx) {
        throw new Error("无效的 canvas 操作上下文！");
      }
    }
    return this._ctx;
  }
  /**
   * 获取图片数据
   *
   * 注意：此方法优先返回内部的缓存，如果缓存失效，则尝试取当前 canvas 的图片数据
   */
  public get imageData(): ImageData {
    if (this._imageData) {
      return this._imageData;
    }
    return (this._imageData = this.ctx.getImageData(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height
    ));
  }
  /**
   * 设置图片数据
   *
   * 注意：这并不会影响当前 canvas，如果想应用当前缓存的图像数据，可以使用 `applyImageData` 方法
   */
  public set imageData(v: ImageData) {
    this._imageData = new ImageData(
      new Uint8ClampedArray(v.data),
      v.width,
      v.height
    );
  }

  /**
   * 获取当前图片数据缓存的 ImageDataEx 类型的浅拷贝
   */
  public get imageDataEx(): ImageDataEx {
    return new ImageDataEx(
      this.imageData.data,
      this.imageData.width,
      this.imageData.height
    );
  }
  /**
   * 将指定的图像数据或者本对象图像数据缓存应用到绑定的 canvas 中
   *
   * 注意：此方法不会影响当前图像缓存
   *
   * @param v 欲应用到当前 canvas 的图像数据，如果缺省，则使用本对象的缓存
   */
  public applyImageData(v?: ImageData) {
    const imageData = v || this.imageData;
    // 记得先清空画布
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.putImageData(imageData, 0, 0);
  }
  /**
   * 清空 canvas 内容
   *
   * 注意：为了不使之前绘制的内容被重绘，因此内部缓存也会被清空
   */
  public clearCanvas() {
    // 清空内部缓存
    this._imageData = undefined;
    this.ctx.fillStyle = this.defaultBgColor.cssStyle;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  // 供子类实现的事件处理器
  mouseUpHandler?: React.MouseEventHandler<HTMLCanvasElement>;
  mouseDownHandler?: React.MouseEventHandler<HTMLCanvasElement>;
  mouseEnterHandler?: React.MouseEventHandler<HTMLCanvasElement>;
  mouseMoveHandler?: React.MouseEventHandler<HTMLCanvasElement>;
  mouseLeaveHandler?: React.MouseEventHandler<HTMLCanvasElement>;
  mouseOverHandler?: React.MouseEventHandler<HTMLCanvasElement>;
  mouseOutHandler?: React.MouseEventHandler<HTMLCanvasElement>;
  clickHandler?: React.MouseEventHandler<HTMLCanvasElement>;

  /**
   * 以当前的缓存或canvas图片数据为基础，在这之上用内部算法绘制内容后返回新的图片数据
   *
   * @param flush 是否刷新缓存，缺省情况下不会刷新缓存
   */
  protected getNewImageData(flush?: boolean): ImageDataEx {
    const newImageData = this.getAlgorithm().updateImageData(
      this.imageDataEx.deepCopy()
    );
    if (flush && newImageData) {
      this.imageData = newImageData;
    }
    return newImageData;
  }
  /**
   * 绘制一帧画面，该画面内容不会存至缓存
   */
  protected drawOneFrame() {
    const newImageData = this.getNewImageData();
    newImageData && this.applyImageData(newImageData);
  }
  /**
   * 向画布中绘制，该操作会刷新缓存
   */
  protected draw() {
    const newImageData = this.getNewImageData(true);
    newImageData && this.applyImageData(newImageData);
  }
}
