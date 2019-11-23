import { action, observable } from "mobx";

class PanelState {
  @observable newElementName: string = "";
  @observable currentSelectedSubPanelId: string = "subPanel0";
  @observable currentElementNameString: string = "";
  @observable currentElementZIndex: number = -1;
  @observable elementConflict: boolean = false;
  @observable elementTypeName: string = "";

  @action
  raiseElementNameConflict() {
    this.elementConflict = true;
  }

  @action
  cancelElementNameConflict() {
    this.elementConflict = false;
  }

  @action
  setCurrentElementTypeName(name: string) {
    this.elementTypeName = name;
  }
}

export default PanelState;
