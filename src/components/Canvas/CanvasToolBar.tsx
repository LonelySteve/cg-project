import { Grid } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ClearIcon from "@material-ui/icons/Clear";
import CropIcon from "@material-ui/icons/Crop";
import FlipToBackIcon from "@material-ui/icons/FlipToBack";
import FlipToFrontIcon from "@material-ui/icons/FlipToFront";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import SaveIcon from "@material-ui/icons/Save";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { inject, observer } from "mobx-react";
import React from "react";
/**
 * 画板工具条
 *
 * 提供基础的画板功能，包括：
 *
 * - 画板级操作
 *   - 清空
 *   - 保存
 *   - 放大
 *   - 缩小
 * - 元素级操作
 *   - 新增
 *   - 移除
 *   - 旋转
 *   - 移动
 *   - 填充
 *   - 置于顶层
 *   - 置于底层
 * - 栅格化操作
 *   - 裁剪
 */
const CanvasToolBar = inject()(
  observer(props => {
    return (
      <Grid
        container
        item
        direction="row"
        justify="space-evenly"
        alignItems="center"
      >
        <Grid item>
          <ToggleButtonGroup size="medium">
            <ToggleButton>
              <ClearIcon />
            </ToggleButton>
            <ToggleButton>
              <SaveIcon />
            </ToggleButton>
            <ToggleButton disabled>
              <ZoomInIcon />
            </ToggleButton>
            <ToggleButton disabled>
              <ZoomOutIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid item>
          <ToggleButtonGroup size="medium">
            <ToggleButton>
              <AddCircleIcon />
            </ToggleButton>
            <ToggleButton>
              <RemoveCircleIcon />
            </ToggleButton>
            <ToggleButton>
              <RotateLeftIcon />
            </ToggleButton>
            <ToggleButton>
              <RotateRightIcon />
            </ToggleButton>
            <ToggleButton>
              <FlipToFrontIcon />
            </ToggleButton>
            <ToggleButton>
              <FlipToBackIcon />
            </ToggleButton>
            <ToggleButton>
              <OpenWithIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        
        <Grid item>
          <ToggleButtonGroup>
            <ToggleButton>
              <CropIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    );
  })
);
export default CanvasToolBar;
