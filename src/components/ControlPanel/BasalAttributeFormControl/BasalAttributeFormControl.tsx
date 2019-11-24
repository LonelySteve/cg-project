import { Button, ButtonGroup, Grid } from "@material-ui/core";
import { inject, observer } from "mobx-react";
import React from "react";
import CanvasStore from "../../../stores/CanvasStore";
import ControlPanelStore from "../../../stores/ControlPanelStore";
import { useSelectsStyles } from "../Style";
import ElementName from "./ElementName";

export type BasalAttributeFormControlProps = {
  canvasState?: CanvasStore;
  panelState?: ControlPanelStore;
};

export const BasalAttributeFormControl = inject(allStates => ({
  canvasState: (allStates as { canvasState: CanvasStore }).canvasState,
  panelState: (allStates as { controlPanelState: ControlPanelStore })
    .controlPanelState
}))(
  observer<React.FC<BasalAttributeFormControlProps>>(props => {
    const selectsStyles = useSelectsStyles();
    return (
      <Grid container item>
        <Grid
          container
          item
          direction="row"
          justify="flex-start"
          alignItems="flex-end"
          spacing={3}
        >
          {/* 元素名称 */}
          <ElementName />
          {/* 元素类型 */}

          <Grid item>
            <ButtonGroup>
              {// 判断当前是否选中了元素，如果没有，则应显示新增按钮，否则显示删除按钮
              props.canvasState && props.canvasState.hasSelectedElement ? (
                <>
                  <Button variant="outlined" color={"primary"}>
                    拷贝
                  </Button>
                  <Button variant="outlined" color={"secondary"}>
                    删除
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color={"primary"}
                  disabled={
                    props.panelState &&
                    props.panelState.elementLabelStore.ElementLabelConflict
                  }
                >
                  新增
                </Button>
              )}
            </ButtonGroup>
          </Grid>
        </Grid>
      </Grid>
    );
  })
);
