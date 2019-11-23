import { computed, observable } from "mobx";
import { Color, Size } from "../models/Base";
import { CanvasElement } from "../models/CanvasElements";

export class CanvasStore {
  @observable selectedElement?: CanvasElement;
  @observable elements: Array<CanvasElement> = [];
  @observable selectedBorderColor: Color = Color.black;
  @observable selectedFillColor: Color = Color.transparent;
  @observable size: Size = { width: 500, height: 500 };
  @observable downloadFileName = "canvas.png";

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
}
