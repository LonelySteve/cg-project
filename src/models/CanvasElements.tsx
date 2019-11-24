import { action } from "mobx";
import { CustomPainter, PainterBase } from "../painters/Painter";
import { Color, Point, Rect } from "./Base";

export interface IHasBorder {
  borderColor: Color;
}

export interface IHasFill {
  fillColor: Color;
}

enum CanvasElementType {
  unknown,
  line
}

export abstract class CanvasElement {
  private _label: string;
  private _typeName: string;

  painters: PainterBase[] = [];

  constructor(typeName: string, label: string) {
    this._label = label;
    this._typeName = typeName;
  }

  public get typeName(): string {
    return this._typeName;
  }

  @action
  appendPainter(painter: PainterBase) {
    this.painters.push(painter);
  }

  @action
  removePainters(func: (painter: PainterBase) => boolean): void {
    this.painters = this.painters.filter(func);
  }

  /**
   * 以当前绘制器组将当前元素绘制到指定的画布上
   *
   * @param ctx 指定要绘制到的画布的上下文对象
   */
  drawTo(ctx: CanvasRenderingContext2D) {
    let temp: ImageData | CanvasRenderingContext2D = ctx;
    this.painters.forEach(painter => {
      if (painter instanceof CustomPainter) {
        temp = painter.drawTo(temp);
      }
      temp = painter.drawTo(ctx);
    });
  }

  /**
   * 获取该元素的标签
   */
  public get label(): string {
    return this._label;
  }

  public abstract get rect(): Rect;

  /**
   * 判断指定点是否处于元素内
   * @param point 欲判断的点
   * @param faultToleranceFactor 容错因子
   */
  abstract containPoint(point: Point, faultToleranceFactor: number): boolean;
}

export class Line extends CanvasElement implements IHasBorder {
  borderColor: Color = Color.black;

  protected _startPoint?: Point;
  protected _endPoint?: Point;

  constructor(
    label: string,
    startPoint?: Point,
    endPoint?: Point,
    borderColor?: Color
  ) {
    super("line", label);
    if (startPoint !== undefined) {
      this.startPoint = startPoint;
    }
    if (endPoint !== undefined) {
      this.endPoint = endPoint;
    }
    if (borderColor) {
      this.borderColor = borderColor;
    }
  }

  public get rect(): Rect {
    return {
      X: Math.min(this.startPoint.X, this.endPoint.X),
      Y: Math.min(this.startPoint.Y, this.endPoint.Y),
      width: Math.abs(this.startPoint.X - this.endPoint.X),
      height: Math.abs(this.startPoint.Y - this.endPoint.Y)
    };
  }

  public containPoint(point: Point, faultToleranceFactor: number = 3): boolean {
    return this.getDistanceToPoint(point) <= faultToleranceFactor;
  }

  public set startPoint(v: Point) {
    this._startPoint = { X: Math.round(v.X), Y: Math.round(v.Y) };
  }

  public set endPoint(v: Point) {
    this._endPoint = { X: Math.round(v.X), Y: Math.round(v.Y) };
  }

  @action
  setStartPoint(point: Point) {
    this.startPoint = point;
  }

  @action
  setEndPoint(point: Point) {
    this.endPoint = point;
  }
  @action
  move(offsetPoint: Point) {
    this.setStartPoint({
      X: this.startPoint.X + offsetPoint.X,
      Y: this.startPoint.Y + offsetPoint.Y
    });
    this.setEndPoint({
      X: this.endPoint.X + offsetPoint.X,
      Y: this.endPoint.Y + offsetPoint.Y
    });
  }

  /**
   * 求指定点到本直线的距离
   * @param point 指定的点
   */
  public getDistanceToPoint(point: Point): number {
    const k =
      (this.startPoint.Y - this.endPoint.Y) /
      (this.startPoint.X - this.endPoint.Y);
    const b = this.startPoint.Y - this.startPoint.X * k;
    return Math.abs(k * point.X - point.Y + b) / Math.sqrt(Math.pow(k, 2) + 1);
  }
}
