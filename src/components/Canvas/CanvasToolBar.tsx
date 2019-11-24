import { Card, Divider, Grid, IconButton } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import CropIcon from "@material-ui/icons/Crop";
import FlipToBackIcon from "@material-ui/icons/FlipToBack";
import FlipToFrontIcon from "@material-ui/icons/FlipToFront";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import SaveIcon from "@material-ui/icons/Save";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import { inject, observer } from "mobx-react";
import React from "react";
import CanvasStore from "../../stores/CanvasStore";
import { Canvas, CanvasProps } from "./Canvas";
import { useDividerStyles } from "./Style";

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
type CanvasToolBarProps = CanvasProps & { canvas: Canvas };

const CanvasToolBar = inject(allStores => ({
  canvasStates: (allStores as { canvasStates: CanvasStore }).canvasStates
}))(
  observer<React.FC<CanvasToolBarProps>>(props => {
    if (props.canvasStates === undefined) {
      throw new Error();
    }
    // 样式引用
    const dividerClasses = useDividerStyles();
    return (
      <Card>
        <Grid
          container
          item
          direction="column"
          justify="center"
          alignItems="center"
        >
          <IconButton>
            <ClearIcon onClick={props.canvas.handleClear} />
          </IconButton>
          <IconButton>
            <SaveIcon onClick={props.canvas.handleDownload} />
          </IconButton>
          <IconButton disabled>
            <ZoomInIcon />
          </IconButton>
          <IconButton disabled>
            <ZoomOutIcon />
          </IconButton>
          {/* 与元素操作有关的按钮，只有当元素选中后才显示 */}
          {props.canvasStates.hasSelectedElement && (
            <>
              <Divider classes={{ root: dividerClasses.Xsmall }} />
              <IconButton>
                <RotateLeftIcon />
              </IconButton>
              <IconButton>
                <RotateRightIcon />
              </IconButton>
              <IconButton>
                <FlipToFrontIcon />
              </IconButton>
              <IconButton>
                <FlipToBackIcon />
              </IconButton>
              <IconButton>
                <OpenWithIcon />
              </IconButton>
              <Divider classes={{ root: dividerClasses.Xsmall }} />
              <IconButton>
                <CropIcon />
              </IconButton>
            </>
          )}
        </Grid>
      </Card>
    );
  })
);
export default CanvasToolBar;
