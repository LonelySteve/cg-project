import { ColorType } from "../../components/Canvas/ColorToggleButtonGroup";
import Color from "../models/Color";
import Point from "../models/Point";
import Size from "../models/Size";
import CanvasCommonHandler from "./commonHandler/CanvasCommonHandler";

export type PickHandler = (
  event: CustomEventInit<{
    pickPoint: Point;
    pickColor: Color;
    pickColorType: ColorType | undefined;
  }>
) => void;

/**
 * 取色/坐标器
 *
 * 这个类的实现较为复杂，因此这里写下一些要点。
 *
 * 提出几个概念：
 *
 * - 放大级别：放大倍数，内部实现上实际值为 2 的幂
 * - 放大区域：在 canvas 上实际被放大的区域，其宽和高应当是个奇数
 * - 放大视图：放大区域被放大指定放大级别后重绘到 canvas 的部分
 * - 放大视图绘制点：将放大视图绘制到 canvas 上，需要指定下这个偏移量
 * - 当前选取点：一般是指放大区域的中心点（因此放大区域宽和高应当是个奇数），但是也有特殊情况
 *
 */
export default class Picker {
  readonly zoomLevel = 3;
  readonly zoomWidth = 33;
  readonly zoomHeight = 33;
  readonly zoomViewUnitWidth = 1 << this.zoomLevel;
  readonly zoomViewUnitHeight = 1 << this.zoomLevel;
  readonly zoomViewWidth = this.zoomWidth << this.zoomLevel;
  readonly zoomViewHeight = this.zoomHeight << this.zoomLevel;

  /**
   * 指示当前是否启用取点/色器
   */
  public isEnable: boolean = false;
  /**
   * 当前鼠标在 canvas 中的相对位置
   */
  public currentMouseRelativePosition?: Point;
  /**
   * 当前取色类别
   */
  public colorType?: ColorType;

  protected canvasCommonHandler: CanvasCommonHandler;

  constructor(canvasCommonHandler: CanvasCommonHandler) {
    this.canvasCommonHandler = canvasCommonHandler;
  }

  /**
   * 获取放大区域的左上角坐标
   */
  public get zoomAreaPosition(): Point {
    return this.getViewPosition(this.zoomWidth, this.zoomHeight);
  }

  /**
   * 获取放大视图的左上角坐标
   */
  public get zoomViewPosition(): Point {
    // 要避免渲染的视图超过 canvas 区域，否则用户无法看到完整的放大视图
    return this.getViewPosition(this.zoomViewWidth, this.zoomViewHeight);
  }

  /**
   * 获取当前选取点（在 canvas 中实际坐标）
   */
  public get pickPoint(): Point {
    if (this.currentMouseRelativePosition === undefined) {
      throw new Error("Picker 当前没有选取到任何点哦~");
    }
    return this.currentMouseRelativePosition;
  }
  /**
   * 获取当前选取点（在放大视图中的映射到 canvas 的坐标）
   */
  public get pickPointInZoomView(): Point {
    const offset = Point.sub(
      this.pickPoint,
      this.zoomAreaPosition.toSize()
    ).toSize();

    return Point.add(this.zoomViewPosition, offset.shiftLeft(this.zoomLevel));
  }

  /** 获取当前选取点的颜色 */
  public get pickPointColor(): Color {
    return this.canvasCommonHandler.imageDataEx.getPixelColor(this.pickPoint);
  }

  /**
   * 启用取点/色器
   */
  public enable() {
    if (this.isEnable) {
      return;
    }
    // 尝试添加监听器
    try {
      // 禁用平滑效果
      this.canvasCommonHandler.ctx.imageSmoothingEnabled = false;
      const canvas = this.canvasCommonHandler.getCanvasHTMLElement();

      canvas.addEventListener("mousemove", this.handleMouseMove);
      canvas.addEventListener("mouseup", this.handleMouseUp);

      this.isEnable = true;
    } catch (error) {
      console.error("启用 Picker 失败，原因：" + error);
    }
    return this;
  }
  /**
   * 禁用取点/色器
   */
  public disable() {
    if (!this.isEnable) {
      return;
    }
    // 尝试移除监听器
    try {
      const canvas = this.canvasCommonHandler.getCanvasHTMLElement();
      canvas.removeEventListener("mousemove", this.handleMouseMove);
      canvas.removeEventListener("mouseup", this.handleMouseUp);
      // 应用缓存，把残留的 Picker 影像刷掉
      this.canvasCommonHandler.applyImageData();
      this.isEnable = false;
    } catch (error) {
      console.error("禁用 Picker 失败，原因：" + error);
    }
    return this;
  }
  /**
   * 切换当前取色/点器的启用状态
   */
  public toggle() {
    this.isEnable ? this.disable() : this.enable();
  }

  public handleMouseMove = (event: MouseEvent) => {
    // 设置当前鼠标指针的相对于 canvas 的位置
    this.currentMouseRelativePosition = new Point(event.offsetX, event.offsetY);
    // 应用一次图像缓存，这可能会导致未完成的工作（动画帧）被冲掉，因此在使用 Picker 时，内部算法应处于未工作的状态

    this.drawAnimateFrame();
    event.stopPropagation();
  };

  public handleMouseUp = (event: MouseEvent) => {
    this.currentMouseRelativePosition = new Point(event.offsetX, event.offsetY);
    if (event.button === 0) {
      // 当 picker 当前工作并选取到一个像素时发生

      const pickEvent = new CustomEvent<{
        pickPoint: Point;
        pickColor: Color;
        pickColorType: ColorType | undefined;
      }>("onPick");

      pickEvent.initCustomEvent("onPick", true, true, {
        pickPoint: this.pickPoint,
        pickColor: this.pickPointColor,
        pickColorType: this.colorType
      });

      this.canvasCommonHandler.getCanvasHTMLElement().dispatchEvent(pickEvent); // 派发事件
    }
    this.disable();
    event.stopPropagation();
  };

  protected getViewPosition(width: number, height: number): Point {
    if (this.currentMouseRelativePosition === undefined) {
      throw new Error("这很奇怪，为啥 Picker 获取当前鼠标位置是空的呢？");
    }
    const [minX, minY, maxX, maxY] = [
      0,
      0,
      this.canvasCommonHandler.ctx.canvas.width - width,
      this.canvasCommonHandler.ctx.canvas.height - height
    ];
    // 计算实际点
    const rp = new Point(
      this.currentMouseRelativePosition.X - width / 2,
      this.currentMouseRelativePosition.Y - height / 2
    );
    // 对实际点处理，使其必然落入有效区间内
    return rp
      .constraint({ origin: new Point(minX, minY), size: new Size(maxX, maxY) })
      .round();
  }

  private drawExtraInfo() {
    const ctx = this.canvasCommonHandler.ctx;
    ctx.save();

    // 在放大视图下方绘制一个半透明黑的矩形，这个矩形占高大概 30 %
    const bgColor = new Color(33, 33, 33, 100);

    ctx.fillStyle = bgColor.cssStyle;
    ctx.fillRect(
      this.zoomViewPosition.X,
      this.zoomViewPosition.Y + this.zoomViewHeight * 0.7,
      this.zoomViewWidth,
      this.zoomViewHeight * 0.3
    );
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = this.pickPointColor.reverse.cssStyle;
    ctx.fillStyle = this.pickPointColor.cssStyle;
    ctx.font = "24px Open Sans,Microsoft YaHei bolder ";

    const point = this.pickPoint;
    const pointColor = this.pickPointColor;
    const pointInfo = `(${point.X}, ${point.Y})`;
    const pointColorInfo = `rgba(${pointColor.red}, ${pointColor.green}, ${pointColor.blue}, ${pointColor.alpha})`;

    const pointInfoTextMeasure = ctx.measureText(pointInfo);
    const pointColorInfoTextMeasure = ctx.measureText(pointColorInfo);

    const [pointInfoX, pointInfoY] = [
      (this.zoomViewWidth - pointInfoTextMeasure.width) / 2 +
        this.zoomViewPosition.X,
      this.zoomViewPosition.Y + this.zoomViewHeight * 0.8
    ];
    ctx.strokeText(pointInfo, pointInfoX, pointInfoY);
    ctx.fillText(pointInfo, pointInfoX, pointInfoY);
    const [pointColorInfoX, pointColorInfoY] = [
      (this.zoomViewWidth - pointColorInfoTextMeasure.width) / 2 +
        this.zoomViewPosition.X,
      this.zoomViewPosition.Y + this.zoomViewHeight * 0.95
    ];
    ctx.strokeText(pointColorInfo, pointColorInfoX, pointColorInfoY);
    ctx.fillText(pointColorInfo, pointColorInfoX, pointColorInfoY);
    ctx.restore();
  }
  private drawGridLine(color?: Color) {
    color = color || new Color(33, 33, 33, 50);

    const ctx = this.canvasCommonHandler.ctx;
    const [zX, zY] = [this.zoomViewPosition.X, this.zoomViewPosition.Y];
    const [zW, zH] = [this.zoomViewWidth, this.zoomViewHeight];

    ctx.save();
    ctx.strokeStyle = color.cssStyle;
    ctx.lineWidth = 0.5;

    const [stepx, stepy] = [this.zoomViewUnitWidth, this.zoomViewUnitHeight];
    // 画竖线
    for (let i = stepx + 0.5; i < zW; i += stepx) {
      ctx.beginPath();
      ctx.moveTo(i + zX, zY);
      ctx.lineTo(i + zX, zY + zH);
      ctx.stroke();
    }
    // 画横线
    for (let i = stepy + 0.5; i < zH; i += stepy) {
      ctx.beginPath();
      ctx.moveTo(zX, i + zY);
      ctx.lineTo(zX + zH, i + zY);
      ctx.stroke();
    }
    ctx.restore();
  }
  private drawPickPoint() {
    const ctx = this.canvasCommonHandler.ctx;
    ctx.save();
    ctx.strokeStyle = this.pickPointColor.reverse.cssStyle;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      this.pickPointInZoomView.X,
      this.pickPointInZoomView.Y,
      this.zoomViewUnitWidth,
      this.zoomViewUnitHeight
    );
    ctx.restore();
  }
  private drawBorder() {
    const ctx = this.canvasCommonHandler.ctx;
    // 简单画个反色的边框就行
    ctx.save();
    ctx.strokeStyle = this.pickPointColor.reverse.cssStyle;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      this.zoomViewPosition.X,
      this.zoomViewPosition.Y,
      this.zoomViewWidth,
      this.zoomViewHeight
    );
    ctx.restore();
  }

  private static warned = false;

  private drawAnimateFrame() {
    if (this.canvasCommonHandler.getAlgorithm().working && !Picker.warned) {
      console.warn("内部算法正在工作，使用 Picker 会影响动画帧等显示！");
      Picker.warned = true; // 只警告一遍
    }

    this.canvasCommonHandler.applyImageData();

    const zoomViewImageData = this.canvasCommonHandler.imageDataEx.getZoomImageData(
      {
        origin: this.zoomAreaPosition,
        size: new Size(this.zoomWidth, this.zoomHeight)
      },
      this.zoomLevel
    );

    this.canvasCommonHandler.ctx.putImageData(
      zoomViewImageData,
      this.zoomViewPosition.X,
      this.zoomViewPosition.Y
    );

    this.drawBorder();
    this.drawGridLine();
    this.drawPickPoint();
    this.drawExtraInfo();
  }
}
