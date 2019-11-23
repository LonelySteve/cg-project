/**
 * ControlPanelStore
 *
 * 控制面板的状态存储
 *
 * 缩写注释解释：
 * - RT: Real Time 实时
 */

import { action, observable } from "mobx";
import { Point } from "../models/Base";
class LineArgumentStore {
  @observable startPoint: Point;
  @observable endPoint: Point;
  @observable borderColor: Color;
  @observable borderPainter: IBorderPainter;
  constructor(
    startPoint: Point,
    endPoint: Point,
    borderColor: Color,
    borderPainter: IBorderPainter
  ) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.borderColor = borderColor;
    this.borderPainter = borderPainter;
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
}

/**
 * **元素名状态存储**
 *
 * 缩写注释解释：
 * - RT: Real Time 实时
 */
class ElementLabelStore {
  @observable RT_ElementLabel: string = "";
  @observable newElementLabel: string = "";
  @observable ElementLabelConflict: boolean = false;

  constructor(RT_ElementLabel?: string, newElementLabel?: string) {
    this.RT_ElementLabel = RT_ElementLabel ? RT_ElementLabel : "";
    this.newElementLabel = newElementLabel ? newElementLabel : "";
  }
  /**
   * 设置实时在UI中显示的元素名，如果需要的话，还可以指定一个字符串数组以排查元素名的重复性
   * @param v 新元素名
   * @param exclusive 新元素名不能包含的字符串数组
   */
  @action
  public setRT_ElementLabel(name: string, exclusive?: string[]) {
    if (exclusive) {
      if (exclusive.findIndex(v => v === name) !== -1) {
        this.setElementLabelConflict(true);
      }
    }
    this.setElementLabelConflict(false);
    this.RT_ElementLabel = name;
  }

  /**
   * 设置一个新的元素名，如果需要的话，还可以指定一个字符串数组以排查元素名的重复性
   * @param v 新元素名
   * @param exclusive 新元素名不能包含的字符串数组
   */
  @action
  public setNewElementLabel(name: string, exclusive?: string[]) {
    if (exclusive) {
      if (exclusive.findIndex(v => v === name) !== -1) {
        this.setElementLabelConflict(true);
      }
    }
    this.setElementLabelConflict(false);
    this.newElementLabel = name;
  }

  @action
  public setElementLabelConflict(isConflict: boolean) {
    this.ElementLabelConflict = isConflict;
  }
}

/**
 * 控制面板存储
 *
 */
class ControlPanelStore {
  // 元素名存储
  @observable ElementLabelStore: ElementLabelStore;
  // 元素类型名
  @observable elementTypeName: string = "";
  // 当前所选扩展面板标识
  @observable currentSelectedSubPanelId: string = "";

  constructor(
    ElementLabelStore?: ElementLabelStore,
    elementTypeName?: string,
    currentSelectedSubPanelId?: string
  ) {
    this.ElementLabelStore = ElementLabelStore
      ? ElementLabelStore
      : new ElementLabelStore();
    this.elementTypeName = elementTypeName ? elementTypeName : "";
    this.currentSelectedSubPanelId = currentSelectedSubPanelId
      ? currentSelectedSubPanelId
      : "";
  }

  @action
  public setCurrentSelectSubPanelId(id: string) {
    this.currentSelectedSubPanelId = id;
  }
}

export default ControlPanelStore;
