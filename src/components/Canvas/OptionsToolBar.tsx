import { Card, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { inject, observer } from "mobx-react";
import React from "react";
import { CanvasElement, Line } from "../../models/CanvasElements";
import CanvasStore from "../../stores/CanvasStore";
import { Canvas, CanvasProps } from "./Canvas";
import { useDividerStyles, useWidthStyles } from "./Style";

const ColorPickerButtonGroup = observer<
  React.FC<{ enableFillColor: boolean; enableBorderColor: boolean }>
>(props => {
  return (
    <Grid container item spacing={1}>
      <Grid item>
        <IconButton style={{ backgroundColor: "#66ccff" }} />
      </Grid>
      <Grid item>
        <IconButton style={{ backgroundColor: "#66ccff" }} />
      </Grid>
    </Grid>
  );
});

const ElementArguments = observer<React.FC>(() => {
  return <ColorPickerButtonGroup enableFillColor enableBorderColor />;
});

const newElementHandlerWrapper = (
  setSelectedElement: (canvasElement: CanvasElement) => void
): React.ChangeEventHandler<{ name?: string; value: unknown }> => e => {
  switch (e.target.value) {
    case "line":
      setSelectedElement(new Line("line"));
      break;
    default:
      break;
  }
};
// : React.MouseEventHandler => e  {
//   switch (e.target.value) {
//     case "line":
//       setSelectedElement(new Line("line"));
//       break;
//     default:
//       break;
//   }
// };

type OptionsToolBarProps = CanvasProps & { canvas: Canvas };

const OptionsToolBar = inject(allStores => ({
  canvasStates: (allStores as { canvasStates: CanvasStore }).canvasStates
}))(
  observer<React.FC<OptionsToolBarProps>>(props => {
    // 可能的未定义参数确定化
    if (props.canvasStates === undefined) {
      throw new Error();
    }
    // 样式引用
    const widthClasses = useWidthStyles();
    const dividerClasses = useDividerStyles();
    return (
      <Card>
        <Grid
          container
          item
          direction="row"
          justify="flex-start"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <Typography variant="h5">Canvas</Typography>
          </Grid>

          <Grid item>
            <Divider
              orientation="vertical"
              classes={{ root: dividerClasses.Ysmall }}
            />
          </Grid>

          <Grid item>
            <FormControl>
              <InputLabel id="element-type-select-label">元素类型</InputLabel>
              <Select
                labelId="element-type-select-label"
                classes={{ root: widthClasses.minNormal }}
                // 当有元素选中时，元素类型确定不可更改
                readOnly={props.canvasStates.hasSelectedElement}
                // 如果当前有元素选中时，传入该元素的类型，否则传入当前元素的新类型名
                value={
                  props.canvasStates.selectedElement
                    ? props.canvasStates.selectedElement.typeName
                    : ""
                }
                // 当值发生改变的时候，新建元素
                onChange={
                  props.canvasStates.hasSelectedElement
                    ? undefined
                    : newElementHandlerWrapper((elem: CanvasElement) => {
                        if (props.canvasStates)
                          props.canvasStates.selectedElement = elem;
                      })
                }
              >
                <MenuItem value="line">直线</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <TextField
                label="开始点"
                classes={{ root: widthClasses.maxNormal }}
              />
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <TextField
                label="结束点"
                classes={{ root: widthClasses.maxNormal }}
              />
            </FormControl>
          </Grid>
          
        </Grid>
      </Card>
    );
  })
);

export default OptionsToolBar;
