import { computed, observable } from "mobx";
import { Size } from "../models/Base";
import { CanvasElement } from "../models/CanvasElements";

export default class CanvasStore {
  @observable selectedElement?: CanvasElement;
  @observable elements: Array<CanvasElement> = [];
  @observable size: Size = { width: 500, height: 500 };
  @observable downloadFileNameFormat = "canvas.png";

  @computed
  public get hasSelectedElement(): boolean {
    return this.selectedElement !== undefined;
  }

  @computed
  public get selectedElementLabel(): string {
    if (this.selectedElement) {
      return this.selectedElement.label;
    }
    return "null";
  }

  @computed
  public get downloadFileName(): string {
    return this.downloadFileName;
  }
}

