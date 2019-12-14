import Rect from "./Rect";
import Size, { RoundModeType } from "./Size";

/**
 * 点类
 *
 * - 提供了对点进行相加、相减、自乘、自除、相等、测距等功能
 * - 提供点取整功能
 */
export default class Point {
  public X: number = 0;
  public Y: number = 0;

  constructor(x?: number, y?: number) {
    this.X = x || 0;
    this.Y = y || 0;
  }

  public static get ORIGIN() {
    return new Point(0, 0);
  }

  public get up(): Point {
    return new Point(this.X, this.Y - 1);
  }

  public get down(): Point {
    return new Point(this.X, this.Y + 1);
  }

  public get left(): Point {
    return new Point(this.X - 1, this.Y);
  }

  public get right(): Point {
    return new Point(this.X + 1, this.Y);
  }

  public get leftUp(): Point {
    return new Point(this.X - 1, this.Y - 1);
  }

  public get leftDown(): Point {
    return new Point(this.X - 1, this.Y + 1);
  }

  public get rightUp(): Point {
    return new Point(this.X + 1, this.Y - 1);
  }

  public get rightDown(): Point {
    return new Point(this.X + 1, this.Y + 1);
  }

  public static copy(toPoint: Point, fromPoint: Point) {
    toPoint.X = fromPoint.X;
    toPoint.Y = fromPoint.Y;
    return toPoint;
  }

  public static add(point1: Point, offset: Size): Point {
    return new Point(point1.X + offset.width, point1.Y + offset.height);
  }

  public static sub(point1: Point, offset: Size): Point {
    return new Point(point1.X - offset.width, point1.Y - offset.height);
  }

  public static constraint(point: Point, areaRect: Rect) {
    const [x, y] = this._constraint(point, areaRect);
    return new Point(x, y);
  }

  private static _constraint(point: Point, areaRect: Rect): [number, number] {
    const newX = Math.max(
      Math.min(point.X, areaRect.origin.X + areaRect.size.width),
      areaRect.origin.X
    );
    const newY = Math.max(
      Math.min(point.Y, areaRect.origin.Y + areaRect.size.height),
      areaRect.origin.Y
    );
    return [newX, newY];
  }

  public equals(point: Point): boolean {
    return this.X === point.X && this.Y === point.Y;
  }

  public add(offset: Size): Point {
    this.X += offset.width;
    this.Y += offset.height;
    return this;
  }

  public addSize(width: number, height: number) {
    this.X += width;
    this.Y += height;
    return this;
  }

  public sub(offset: Size): Point {
    this.X -= offset.width;
    this.Y -= offset.height;
    return this;
  }

  public multiply(multiple: number): Point {
    this.X *= multiple;
    this.Y *= multiple;
    return this;
  }

  public divide(divisor: number): Point {
    this.X /= divisor;
    this.Y /= divisor;
    return this;
  }

  /**
   * 约束该点在指定矩形区域，如果未启用严格模式，并且当前点不在约束矩形区域，则将改变此点的值至最近似的合法值
   *
   * @param areaRect 约束矩形区域
   * @param strict 是否启用严格模式，在该模式下，如果当前点不满足当前约束矩形区域，则抛出异常，默认不启用
   */
  public constraint(areaRect: Rect, strict?: boolean) {
    const [x, y] = Point._constraint(this, areaRect);
    if (strict && x !== this.X && y !== this.Y) {
      throw new Error(
        `${this} 不满足指定约束矩形区域：Rect: (${areaRect.origin}, ${areaRect.size})`
      );
    }
    this.X = x;
    this.Y = y;
    return this;
  }

  /**
   * 判断当前点是否在指定矩形区域内
   *
   * @param rect 指定矩形区域
   */
  public inRect(rect: Rect): boolean {
    const [x, y] = Point._constraint(this, rect);
    return x === this.X && y === this.Y;
  }

  /**
   * 强制将当前点转换为尺寸
   *
   * 当前的点的 x 值对应与 宽
   * 当前的点的 y 值对应与 高
   *
   */
  public toSize(): Size {
    return new Size(this.X, this.Y);
  }

  /**
   * 对当前点进行取整处理
   */
  public round(roundMode?: RoundModeType): Point {
    roundMode = roundMode || "round";
    switch (roundMode) {
      case "ceil":
        this.X = Math.ceil(this.X);
        this.Y = Math.ceil(this.Y);
        break;
      case "round":
        this.X = Math.round(this.X);
        this.Y = Math.round(this.Y);
        break;
      case "floor":
        this.X = Math.floor(this.X);
        this.Y = Math.floor(this.Y);
        break;
      case "parseInt":
        this.X = parseInt(this.X.toString());
        this.Y = parseInt(this.Y.toString());
        break;
      default:
        break;
    }

    return this;
  }

  public copy() {
    return new Point(this.X, this.Y);
  }

  public copyTo(point: Point) {
    point.X = this.X;
    point.Y = this.Y;
    return point;
  }

  /**
   * 测量此点到指定点或指定直线的距离
   *
   * - 当第二个点缺省时，这时测量的是点到点的距离
   * - 当提供第二个点参数时，这时测量的是此点到参数指定的两个点组成的直线的距离
   *
   * @param point1 指定第一个点
   * @param point2 指定第二个点
   */
  public measureDistance(point1: Point, point2?: Point): number {
    if (point2 === undefined) {
      // 点到点的距离
      return Math.sqrt(
        Math.pow(this.X - point1.X, 2) + Math.pow(this.Y - point1.Y, 2)
      );
    }
    if (point1.equals(point2)) {
      throw new Error("不能通过两个相同的点确定一条直线！");
    }
    // 直线AX+BY+C=0的一般式方程是：
    // A = Y2 - Y1
    // B = X1 - X2
    // C = X2*Y1 - X1*Y2
    const a = point2.Y - point1.Y;
    const b = point1.X - point2.X;
    const c = point2.X * point1.Y - point1.X * point2.Y;
    return (
      Math.abs(a * this.X + b * this.Y + c) /
      Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
    );
  }

  public toString = (): string => {
    return `Point: (${this.X}, ${this.Y})`;
  };
}
