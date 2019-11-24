import { FormControl, FormHelperText, Grid, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import React from "react";
import { CanvasElement } from "../../../models/CanvasElements";
import CanvasStore from "../../../stores/CanvasStore";
import ControlPanelStore from "../../../stores/ControlPanelStore";
import { useSelectsStyles } from "../../ControlPanel/Style";
import { BasalAttributeFormControlProps } from "../BasalAttributeFormControl/BasalAttributeFormControl";

const elementNameInputChangedHandler = (
  elements: CanvasElement[],
  : ControlPanelStore,
  selectedElement?: CanvasElement
) => (event: React.ChangeEvent<{}>, value: any) => {
  // 名称值不需要前后空白
  value = value.trim();
  // input 的值发生改变有两种情况，一是当没有元素选中时，此时期望操作为新建元素，要求输入的元素名与已有的元素不能重复，否则置冲突标准位为 true
  // 二是当有元素选中时，此时期望操作为重命名元素，要求输入的元素名与已有的元素（除了自身）不能重复，否则置冲突标准位为 true

  panelState.elementLabelStore

  !!elements.find(elem => elem !== selectedElement && elem.label === value)
    ? panelState.raiseElementNameConflict()
    : panelState.cancelElementNameConflict();

  panelState.currentElementNameString = value;
};

const ElementName = inject(allStates => ({
  canvasState: (allStates as { labelStore: CanvasStore }).canvasState,
  panelState: (allStates as { controlPanelState: ControlPanelStore })
    .controlPanelState
}))(
  observer<BasalAttributeFormControlProps>(props => {
    const selectsStyles = useSelectsStyles();
    return (
      <Grid item>
        <FormControl>
          <Autocomplete
            freeSolo
            noOptionsText={false}
            renderInput={params => (
              <TextField
                {...params}
                classes={{ root: selectsStyles.root }}
                label={props.canvasState && props.canvasState.hasSelectedElement ? "当前选择的元素名" : "新元素名称"}
              />
            )}
            onInputChange={elementNameInputChangedHandler(
              props.canvasState.elements,
              props.panelState,
              props.canvasState.selectedElement
            )}
            classes={{
              input: selectsStyles.root
            }}
          />
          {props.panelState.elementConflict && (
            <FormHelperText>该名称与现有元素冲突</FormHelperText>
          )}
        </FormControl>
      </Grid>
    );
  })
);

export default ElementName;
