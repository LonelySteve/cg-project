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
  public isShow: boolean = false;
  protected canvasCommonHandler: CanvasCommonHandler;
  /**
   * 当前选取点，实际渲染将使用该字段的值
   */
  private _pickPoint?: Point;
  /**
   * 被同意的选取点，仅用于对外输出
   */
  private _acceptedPickPoint?: Point;

  constructor(canvasCommonHandler: CanvasCommonHandler) {
    this.canvasCommonHandler = canvasCommonHandler;
  }

  /**
   * 获取放大区域的左上角坐标
   */
  public get zoomAreaPosition(): Point | undefined {
    return this.getViewPosition(this.zoomWidth, this.zoomHeight);
  }

  /**
   * 获取放大视图的左上角坐标
   */
  public get zoomViewPosition(): Point | undefined {
    // 要避免渲染的视图超过 canvas 区域，否则用户无法看到完整的放大视图
    return this.getViewPosition(this.zoomViewWidth, this.zoomViewHeight);
  }

  /**
   * 获取当前选取点（在 canvas 中实际坐标）
   */
  public get pickPoint(): Point | undefined {
    return this._pickPoint;
  }
  /**
   * 设置当前选取点（在 canvas 中实际坐标）
   *
   * 注意：该操作会尝试重绘动画帧
   */
  public set pickPoint(v: Point | undefined) {
    this._pickPoint = v;
    // 约束使选取点不超过 canvas 边界
    this._pickPoint = this.getViewPosition(1, 1);
    this.drawAnimateFrame();
  }
  /**
   * 获取受同意的点
   */
  public get acceptPickPoint() {
    return this._acceptedPickPoint;
  }
  /**
   * 获取受同意的点的颜色
   */
  public get acceptPickPointColor(): Color | undefined {
    if (this._acceptedPickPoint === undefined) return undefined;

    return this.canvasCommonHandler.imageDataEx.getPixelColor(
      this._acceptedPickPoint
    );
  }

  /**
   * 获取当前选取点（在放大视图中的映射到 canvas 的坐标）
   */
  public get pickPointInZoomView(): Point | undefined {
    if (this.pickPoint === undefined) return undefined;
    if (this.zoomAreaPosition === undefined) return undefined;
    if (this.zoomViewPosition === undefined) return undefined;

    const offset = Point.sub(
      this.pickPoint,
      this.zoomAreaPosition.toSize()
    ).toSize();

    return Point.add(this.zoomViewPosition, offset.shiftLeft(this.zoomLevel));
  }

  /** 获取当前选取点的颜色 */
  public get pickPointColor(): Color | undefined {
    if (this.pickPoint === undefined) return undefined;

    return this.canvasCommonHandler.imageDataEx.getPixelColor(this.pickPoint);
  }

  /**
   * 将指定的点设置为当前选中同意点，如果不指定，将使用当前渲染用选中点作为当前选中同意点
   */
  public accept(point?: Point) {
    this._acceptedPickPoint = point || this.pickPoint;
  }

  /**
   * 显示取点/色器
   */
  public show() {
    if (this.isShow) return;

    // 禁用平滑效果
    this.canvasCommonHandler.ctx.imageSmoothingEnabled = false;
    this.isShow = true;

    this.drawAnimateFrame();

    return this;
  }
  /**
   * 隐藏取点/色器
   */
  public hide() {
    if (!this.isShow) return;

    // 应用缓存，把残留的 Picker 影像刷掉
    this.canvasCommonHandler.applyImageData();
    this.isShow = false;

    return this;
  }

  /**
   * 切换当前取色/点器的启用状态
   */
  public toggle() {
    this.isShow ? this.hide() : this.show();
  }

  protected getViewPosition(width: number, height: number): Point | undefined {
    if (this.pickPoint === undefined) return undefined;

    const [minX, minY, maxX, maxY] = [
      0,
      0,
      this.canvasCommonHandler.ctx.canvas.width - width,
      this.canvasCommonHandler.ctx.canvas.height - height
    ];
    // 计算实际点
    const rp = new Point(
      this.pickPoint.X - width / 2,
      this.pickPoint.Y - height / 2
    );
    // 对实际点处理，使其必然落入有效区间内
    return rp
      .constraint({ origin: new Point(minX, minY), size: new Size(maxX, maxY) })
      .round();
  }

  private drawExtraInfo() {
    if (this.zoomViewPosition === undefined) return;
    if (this.pickPointColor === undefined) return;
    if (this.pickPoint === undefined) return;

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
    if (this.zoomViewPosition === undefined) return;

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
    if (this.pickPointColor === undefined) return;
    if (this.pickPointInZoomView === undefined) return;

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
    if (this.zoomViewPosition === undefined) return;
    if (this.pickPointColor === undefined) return;

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

  private drawAnimateFrame() {
    if (!this.isShow) return;
    if (this.zoomAreaPosition === undefined) return;
    if (this.zoomViewPosition === undefined) return;

    this.canvasCommonHandler.applyImageData(); // 刷掉动画帧残留
    // 获取已提交缓存的指定放大区域的放大视图的图像数据
    const zoomViewImageData = this.canvasCommonHandler.imageDataEx.getZoomImageData(
      {
        origin: this.zoomAreaPosition,
        size: new Size(this.zoomWidth, this.zoomHeight)
      },
      this.zoomLevel
    );
    // 绘制放大区域主体
    this.canvasCommonHandler.applyImageData(
      zoomViewImageData,
      this.zoomViewPosition.X,
      this.zoomViewPosition.Y
    );
    // 绘制亿点细节
    this.drawBorder(); // 绘制边框
    this.drawGridLine(); // 绘制网格线
    this.drawPickPoint(); // 绘制选取点
    this.drawExtraInfo(); // 绘制额外信息
  }
}
