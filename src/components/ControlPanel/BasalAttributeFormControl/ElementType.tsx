import { FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import React from "react";
import { useSelectsStyles } from "../../ControlPanel/Style";
import { BasalAttributeFormControlProps } from "../BasalAttributeFormControl/BasalAttributeFormControl";
import PanelState from "../PanelState";

const elementTypeSelectChangedHandler = (panelState: PanelState) => (
  event: React.ChangeEvent<{}>,
  child: React.ReactNode
) => {

    panelState.elementTypeName = (e.target.value as string)
    ? (e.target.value as string)
    : "line";
};

const ElementType: React.FC<BasalAttributeFormControlProps> = props => {
  const selectsStyles = useSelectsStyles();
  return (
    <Grid item>
      <FormControl>
        <InputLabel id="canvas-element-type-label">元素类型</InputLabel>
        <Select
          id="canvas-element-type"
          labelId="canvas-element-type-label"
          value={props.panelState.elementTypeName}
          onChange={(e, v) => {
            props.panelState.elementTypeName = (e.target.value as string)
              ? (e.target.value as string)
              : "line";
          }}
          classes={{
            root: selectsStyles.root
          }}
        >
          <MenuItem value="line">线</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  );
};

export default ElementType;
