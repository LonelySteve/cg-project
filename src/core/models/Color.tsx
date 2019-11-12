import { ColorResult, RGBColor } from "react-color";

/**
 * 颜色类
 *
 * - 依赖 react-color，提供了对 ColorResult 和 RGBColor 单向转换支持
 * - 提供 hex 值和 cssStyle 值
 * - 提供反色值，以及反色黑白值
 * - 提供了对颜色相等及近似的判断方法
 */
export default class Color {
  protected _red: number = 0;
  protected _blue: number = 0;
  protected _green: number = 0;
  protected _alpha: number = 255;

  constructor(red: number, green: number, blue: number, alpha?: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    if (alpha !== undefined) {
      this.alpha = alpha;
    }
  }

  static get transparent(): Color {
    return new Color(0, 0, 0, 0);
  }

  static get white(): Color {
    return new Color(255, 255, 255);
  }

  static get black(): Color {
    return new Color(0, 0, 0);
  }

  /**
   * 计算该颜色的灰度值
   */
  public get gray(): number {
    return this.red * 0.299 + this.green * 0.587 + this.blue * 0.114;
  }
  /**
   * 获取反相色，但取最接近于白或黑的一段
   */
  public get reverseBlackOrWhite(): Color {
    return this.reverse.gray < 127.5 ? Color.black : Color.white;
  }
  /**
   * 获取反色
   */
  public get reverse(): Color {
    return new Color(255 - this.red, 255 - this.green, 255 - this.blue);
  }

  public get red(): number {
    return this._red;
  }

  public set red(v: number) {
    this._red = this.tryLegalizeChannelValue(v);
  }

  public get blue(): number {
    return this._blue;
  }

  public set blue(v: number) {
    this._blue = this.tryLegalizeChannelValue(v);
  }

  public get green(): number {
    return this._green;
  }

  public set green(v: number) {
    this._green = this.tryLegalizeChannelValue(v);
  }

  public get alpha(): number {
    return this._alpha;
  }

  public set alpha(v: number) {
    this._alpha = this.tryLegalizeChannelValue(v);
  }

  public get hex(): string {
    let hex = "#";
    hex += ("0" + this.red.toString(16)).slice(-2);
    hex += ("0" + this.green.toString(16)).slice(-2);
    hex += ("0" + this.blue.toString(16)).slice(-2);
    hex += ("0" + this.alpha.toString(16)).slice(-2);
    return hex;
  }

  public get cssStyle(): string {
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha /
      255})`;
  }

  public static fromColorResult(color: ColorResult): Color {
    return new Color(
      color.rgb.r,
      color.rgb.g,
      color.rgb.b,
      color.rgb.a !== undefined ? color.rgb.a * 255 : 255 // 这里必须严格判断 color.rgb.a ，因为其值也有可能为 0
    );
  }

  /**
   * 判断指定颜色是否与当前颜色相等
   * @param color 与判断的对方颜色
   */
  public equals(color: Color): boolean {
    return (
      this._red === color._red &&
      this._green === color._green &&
      this._blue === color._blue &&
      this._alpha === color._alpha
    );
  }

  /**
   * 判断指定颜色在灰度级别上是否与当前颜色近似
   *
   * @param color 欲判断的对方颜色
   * @param tolerance 容差值，0~255，非法值将取最近值
   */
  public like(color: Color, tolerance: number) {
    tolerance = Math.max(Math.min(tolerance, 255), 0);
    return Math.abs(this.gray - color.gray) <= tolerance;
  }

  /**
   * 将当前颜色与指定背景色混合，得到一个不透明的颜色
   *
   * @param backgroundColor 背景颜色，缺省为白色
   */
  public toRgb(backgroundColor?: Color): Color {
    // http://marcodiiga.github.io/rgba-to-rgb-conversion
    const alpha = this.alpha / 255;
    backgroundColor = backgroundColor || Color.white;
    return new Color(
      (1 - alpha) * backgroundColor.red + alpha * this.red,
      (1 - alpha) * backgroundColor.green + alpha * this.green,
      (1 - alpha) * backgroundColor.blue + alpha * this.blue
    );
  }

  public toRGBColor(): RGBColor {
    return {
      r: this.red,
      g: this.green,
      b: this.blue,
      a: this.alpha / 255
    };
  }

  public toString = (): string => {
    return `Color: ${this.cssStyle} ${this.hex}`;
  };

  /**
   * 尝试使指定的通道值合法化，过小或过大的值会取最近似的合法值
   *
   * @param v 值
   */
  protected tryLegalizeChannelValue(v: number) {
    return Math.round(Math.max(Math.min(v, 255), 0));
  }
}
