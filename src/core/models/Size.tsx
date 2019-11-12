
export type RoundModeType = "ceil" | "round" | "floor" | "parseInt";

/**
 * 尺寸类
 *
 * - 提供了对尺寸进行相加、相减、自乘、自除、左移位，右移位，相等比较等功能
 * - 提供尺寸取整功能
 */
export default class Size {
  private _width: number = 0;
  private _height: number = 0;

  constructor(width?: number, height?: number) {
    this.width = width || 0;
    this.height = height || 0;
  }

  public get width(): number {
    return this._width;
  }

  public set width(v: number) {
    this._width = v;
  }

  public get height(): number {
    return this._height;
  }

  public set height(v: number) {
    this._height = v;
  }

  public static abs(size: Size) {
    return new Size(Math.abs(size._width), Math.abs(size._height));
  }

  public static add(size1: Size, size2: Size): Size {
    return new Size(size1._width + size2._width, size1._height + size2._height);
  }

  public static sub(size1: Size, size2: Size): Size {
    return new Size(size1._width - size2._width, size1._height - size2._height);
  }

  public equals(size: Size): boolean {
    return this._width === size._width && this._height === size._height;
  }

  public abs(): Size {
    this._width = Math.abs(this._width);
    this._height = Math.abs(this._height);
    return this;
  }

  public add(size: Size): Size {
    this._width += size._width;
    this._height += size._height;
    return this;
  }

  public addSize(width: number, height: number) {
    this._width += width;
    this._height += height;
    return this;
  }

  public sub(size: Size): Size {
    this._width -= size._width;
    this._height -= size._height;
    return this;
  }

  public multiply(multiple: number): Size {
    this._width *= multiple;
    this._height *= multiple;
    return this;
  }

  public divide(divisor: number): Size {
    this._width /= divisor;
    this._height /= divisor;
    return this;
  }

  public shiftLeft(bitNumber: number): Size {
    this._width = this._width << bitNumber;
    this._height = this._height << bitNumber;
    return this;
  }

  public shiftRight(bitNumber: number): Size {
    this._width = this._width >> bitNumber;
    this._height = this._height >> bitNumber;
    return this;
  }

  /**
   * copy
   */
  public copy() {
    return new Size(this._width, this._height);
  }

  /**
   * 对当前尺寸进行取整处理
   */
  public round(roundMode?: RoundModeType): Size {
    roundMode = roundMode || "parseInt";
    switch (roundMode) {
      case "ceil":
        this._width = Math.ceil(this._width);
        this._height = Math.ceil(this._height);
        break;
      case "round":
        this._width = Math.round(this._width);
        this._height = Math.round(this._height);
        break;
      case "floor":
        this._width = Math.floor(this._width);
        this._height = Math.floor(this._height);
        break;
      case "parseInt":
        this._width = parseInt(this._width.toString());
        this._height = parseInt(this._height.toString());
        break;
      default:
        break;
    }
    return this;
  }

  public toString = (): string => {
    return `Size: (${this._width}, ${this._height})`;
  };
}
