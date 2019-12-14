import Algorithm, { AlgorithmType } from "../../algorithms/Algorithm";
import Color from "../../models/Color";
import ImageDataEx from "../../models/ImageDataEx";
import Point from "../../models/Point";
import Picker from "../Picker";

export type OperateType = "polygon" | "image" | "fill" | "rectangle";

/**
 * Canvas 公用处理器基类
 */
export default abstract class CanvasCommonHandler {
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
  public applyImageData(
    v?: ImageData,
    dx?: number,
    dy?: number,
    dirtyX?: number,
    dirtyY?: number,
    dirtyWidth?: number,
    dirtyHeight?: number
  ) {
    dx = dx || 0;
    dy = dy || 0;
    const imageData = v || this.imageData;
    this.ctx.save();
    // 根据传入参数有效性调用 putImageData 的不同重载
    if (
      dirtyX !== undefined &&
      dirtyY !== undefined &&
      dirtyWidth !== undefined &&
      dirtyHeight !== undefined
    ) {
      this.ctx.putImageData(
        imageData,
        dx,
        dy,
        dirtyX,
        dirtyY,
        dirtyWidth,
        dirtyHeight
      );
    } else {
      this.ctx.putImageData(imageData, dx, dy);
    }

    this.ctx.restore();
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

  // commonHandler 的生命周期钩子

  // 当设置准备就绪，准备正式使用此 commonHandler 时调用
  public load() {
    this.resume();
  }
  // 当不希望此 commonHandler 执行其功能时调用
  public suspend() {
    const canvas = this.getCanvasHTMLElement();
    // 移除事件监听

    // Picker
    canvas.removeEventListener("mousemove", this.pickerMouseMoveHandler);
    canvas.removeEventListener("mouseup", this.pickerMouseUpHandler);
    document.removeEventListener("keyup", this.pickerKeyUpHandler);
    // 子类
    canvas.removeEventListener("mouseup", this.mouseUpHandler);
    canvas.removeEventListener("mousedown", this.mouseDownHandler);
    canvas.removeEventListener("mouseenter", this.mouseEnterHandler);
    canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    canvas.removeEventListener("mouseleave", this.mouseLeaveHandler);
    canvas.removeEventListener("mouseover", this.mouseOverHandler);
    canvas.removeEventListener("mouseout", this.mouseOutHandler);
    canvas.removeEventListener("keydown", this.keyDownHandler);
    canvas.removeEventListener("keyup", this.KeyUpHandler);

    this.picker.hide();
  }
  // 从 suspend 状态中恢复使用时调用
  public resume() {
    const canvas = this.getCanvasHTMLElement();
    // 先移除一遍事件监听，以免反复添加相同的事件监听
    this.suspend();
    // 开始添加事件监听

    // Picker
    canvas.addEventListener("mousemove", this.pickerMouseMoveHandler);
    canvas.addEventListener("mouseup", this.pickerMouseUpHandler);
    document.addEventListener("keyup", this.pickerKeyUpHandler);
    // 子类
    canvas.addEventListener("mouseup", this.mouseUpHandler);
    canvas.addEventListener("mousedown", this.mouseDownHandler);
    canvas.addEventListener("mouseenter", this.mouseEnterHandler);
    canvas.addEventListener("mousemove", this.mouseMoveHandler);
    canvas.addEventListener("mouseleave", this.mouseLeaveHandler);
    canvas.addEventListener("mouseover", this.mouseOverHandler);
    canvas.addEventListener("mouseout", this.mouseOutHandler);
  }

  // 供子类实现的事件处理器
  protected mouseUpHandler = (ev: MouseEvent) => {};
  protected mouseDownHandler = (ev: MouseEvent) => {};
  protected mouseEnterHandler = (ev: MouseEvent) => {};
  protected mouseMoveHandler = (ev: MouseEvent) => {};
  protected mouseLeaveHandler = (ev: MouseEvent) => {};
  protected mouseOverHandler = (ev: MouseEvent) => {};
  protected mouseOutHandler = (ev: MouseEvent) => {};
  protected clickHandler = (ev: MouseEvent) => {};
  protected keyDownHandler = (ev: KeyboardEvent) => {};
  protected KeyUpHandler = (ev: KeyboardEvent) => {};

  private pickerMouseMoveHandler = (ev: MouseEvent) => {
    this.picker.pickPoint = new Point(ev.offsetX, ev.offsetY);
  };

  private pickerMouseUpHandler = (ev: MouseEvent) => {
    // 如果当前 picker 显示中，则不让其他事件处理程序被调用
    if (this.picker.isShow) ev.stopImmediatePropagation();

    switch (ev.button) {
      // 左键
      case 0:
        this.picker.accept();
        this.picker.hide();
        break;
      // 右键
      case 2:
        this.picker.hide();
        break;
      default:
        break;
    }
  };

  private pickerKeyUpHandler = (ev: KeyboardEvent) => {
    // 不允许算法工作时使用 Picker
    if (this.getAlgorithm().working) return;

    switch (ev.key.toLowerCase()) {
      case "z":
        this.picker.toggle();
        break;
      case "enter":
        this.picker.accept();
        this.picker.hide();
        break;
      case "escape":
        this.picker.hide();
        break;
      default:
        break;
    }

    if (this.picker.isShow) {
      if (this.picker.pickPoint) {
        switch (ev.key) {
          case "ArrowUp":
            this.picker.pickPoint = this.picker.pickPoint.up;
            break;
          case "ArrowDown":
            this.picker.pickPoint = this.picker.pickPoint.down;
            break;
          case "ArrowLeft":
            this.picker.pickPoint = this.picker.pickPoint.left;
            break;
          case "ArrowRight":
            this.picker.pickPoint = this.picker.pickPoint.right;
            break;
          default:
            break;
        }
      }
    }
  };

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
