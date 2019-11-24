/**
 * ControlPanelStore
 *
 * 控制面板的状态存储
 *
 * 缩写注释解释：
 * - RT: Real Time 实时
 */

import { action, observable } from "mobx";
/**
 * **元素名状态存储**
 *
 * 缩写注释解释：
 * - RT: Real Time 实时
 */
export class ElementLabelStore {
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
export default class ControlPanelStore {
  // 元素名存储
  @observable elementLabelStore: ElementLabelStore;
  // 元素类型名
  @observable elementTypeName: string = "";
  // 当前所选扩展面板标识
  @observable currentSelectedSubPanelId: string = "";

  constructor(
    elementLabelStore?: ElementLabelStore,
    elementTypeName?: string,
    currentSelectedSubPanelId?: string
  ) {
    this.elementLabelStore = elementLabelStore
      ? elementLabelStore
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
