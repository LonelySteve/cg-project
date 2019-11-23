 
import { PainterBase } from "../painters/Painter";
import { Color, Point, Rect } from "./Base";


export interface IHasBorderColor {
    borderColor: Color;
    borderPainter: PainterBase;
}

export interface IHasFillColor {
    fillColor: Color;
    fillPainter: PainterBase;
}

enum CanvasElementType {
    unknown,
    line
}

export abstract class CanvasElement {
    private _label: string;

    constructor(label: string) {
        this._label = label;
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

export class Line extends CanvasElement implements IHasBorderColor {
    borderColor: Color = Color.black;
    borderPainter: PainterBase;

    protected _startPoint: Point = { X: 0, Y: 0 };
    protected _endPoint: Point = { X: 0, Y: 0 };

    constructor(label: string, startPoint: Point, endPoint: Point, borderPainter: PainterBase, borderColor?: Color) {
        super(label);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        if (borderColor) {
            this.borderColor = borderColor;
        }
        this.borderPainter = borderPainter;
    }

    public get rect(): Rect {
        return {
            X: Math.min(this.startPoint.X, this.endPoint.X),
            Y: Math.min(this.startPoint.Y, this.endPoint.Y),
            width: Math.abs(this.startPoint.X - this.endPoint.X),
            height: Math.abs(this.startPoint.Y - this.endPoint.Y)
        }
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

    /**
     * 求指定点到本直线的距离
     * @param point 指定的点
     */
    public getDistanceToPoint(point: Point): number {
        const k = (this.startPoint.Y - this.endPoint.Y) / (this.startPoint.X - this.endPoint.Y);
        const b = this.startPoint.Y - this.startPoint.X * k;
        return Math.abs(k * point.X - point.Y + b) / Math.sqrt(Math.pow(k, 2) + 1);
    }
}