import ImageDataEx from "../models/ImageDataEx";

export type AlgorithmType =
  | "DDA"
  | "Bresenham"
  | "AreaFourNeighborContactSeedFill"
  | "AreaEightNeighborContactSeedFill"
  | "ScanLineSeedFill"
  | "_InternalImage";

export type WorkingChangedEventHandler = (value: boolean) => void;

export default abstract class Algorithm {
  /**
   * 用于标识当前的算法类型
   */
  readonly algorithmType?: AlgorithmType;
  /**
   * 用于指示当前算法是否处于工作状态
   */
  private _working: boolean = false;
  /**
   * 获取当前算法是否处于工作状态
   */
  public get working(): boolean {
    return this._working;
  }
  /**
   * startWork
   */
  public startWork() {
    this._working = true;
    this.onWorkingChanged && this.onWorkingChanged(this._working);
    return this;
  }
  /**
   * stopWork
   */
  public stopWork() {
    this._working = false;
    this.onWorkingChanged && this.onWorkingChanged(this._working);
    return this;
  }
  /**
   * 重置算法内部状态
   */
  abstract reset(): void;
  /**
   * 更新图像数据
   *
   * @param imageData 欲更新的图像数据
   */
  abstract updateImageData(imageData: ImageDataEx): ImageDataEx;

  /** 当 working 值发生改变时的回调函数 */
  public onWorkingChanged?: WorkingChangedEventHandler;

  setWorkingChangedHandler(handler: WorkingChangedEventHandler) {
    this.onWorkingChanged = handler;
    return this;
  }
}
