import { Button, ButtonGroup, Grid } from "@material-ui/core";
import { observer } from "mobx-react";
import React from "react";
import { CanvasElement } from "../../../models/CanvasElements";
import CanvasState from "../../Canvas/CanvasState";
import PanelState from "../PanelState";
import { useSelectsStyles } from "../Style";
import ElementName from "./ElementName";
export type BasalAttributeFormControlProps = {
  canvasState: CanvasState;
  panelState: PanelState;
};

const elementNameInputChangedHandler = (
  elements: CanvasElement[],
  panelState: PanelState,
  selectedElement?: CanvasElement
) => (event: React.ChangeEvent<{}>, value: any) => {
  // 名称值不需要前后空白
  value = value.trim();
  // input 的值发生改变有两种情况，一是当没有元素选中时，此时期望操作为新建元素，要求输入的元素名与已有的元素不能重复，否则置冲突标准位为 true
  // 二是当有元素选中时，此时期望操作为重命名元素，要求输入的元素名与已有的元素（除了自身）不能重复，否则置冲突标准位为 true

  !!elements.find(elem => elem !== selectedElement && elem.label === value)
    ? panelState.raiseElementNameConflict()
    : panelState.cancelElementNameConflict();

  panelState.currentElementNameString = value;
};

export const BasalAttributeFormControl = observer<
  React.FC<BasalAttributeFormControlProps>
>(props => {
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
        <ElementName
          canvasState={props.canvasState}
          panelState={props.panelState}
        />
        {/* 元素类型 */}
       
        <Grid item>
          <ButtonGroup>
            {// 判断当前是否选中了元素，如果没有，则应显示新增按钮，否则显示删除按钮
            props.canvasState.selectedElement ? (
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
                disabled={props.panelState.elementConflict}
              >
                新增
              </Button>
            )}
          </ButtonGroup>
        </Grid>
      </Grid>
    </Grid>
  );
});
