import { Button, ButtonGroup, Divider, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, makeStyles, MenuItem, Paper, Radio, RadioGroup, Select, SvgIcon } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import React from "react";
import { AlgorithmType } from "../../core/algorithms/Algorithm";
import ImageInternalAlgorithm from "../../core/algorithms/image/ImageInternalAlgorithm";
import Color from "../../core/models/Color";
import { RoundModeType } from "../../core/models/Size";
import CanvasCommonHandler, { OperateType } from "../../core/utils/commonHandler/CanvasCommonHandler";
import ImageCommonHandler from "../../core/utils/commonHandler/ImageCommonHandler";
import { ColorToggleButtonGroup } from "./ColorToggleButtonGroup";

const useStyles = makeStyles(theme => ({
  paper: {
    display: "flex",
    border: `1px solid ${theme.palette.divider}`,
    flexWrap: "wrap"
  },
  divider: {
    alignSelf: "stretch",
    height: "auto",
    margin: theme.spacing(1, 0.5)
  },
  gridItem: {
    margin: theme.spacing(0.5, 1)
  },
  formControl: {
    minWidth: "8rem"
  },
  button: {
    padding: "7px"
  },
  formLabel: {
    transform: "translate(-6.5px, 3.8px) scale(0.75)"
  }
}));

export type ColorType = "border" | "fill";

export type CanvasControllerProps = {
  // 公共处理器，必需，实现画布清空下载操作必要
  canvasCommonHandler: CanvasCommonHandler;
  // 各种状态量，由 JCanvas 从上一级传递
  operateType: OperateType;
  algorithmType: AlgorithmType;
  algorithmWorking: boolean;
  borderColor?: Color | null;
  fillColor?: Color | null;
  roundMode?: RoundModeType | null;
  // 各种回调函数，负责将 UI 动作传递给上层处理，由上层重传状态量刷新 UI
  onOperateChanged?: (value: OperateType) => void;
  onAlgorithmTypeChanged?: (value: AlgorithmType) => void;
  // 没有 algorithmWorking 状态量的回调，该状态量不属于此组件更改
  onBorderColorChanged?: (value: Color) => void; // 一旦触发更新，肯定会传一个确定的 Color 值，而不是 null
  onFillColorChanged?: (value: Color) => void; // 同上
  onRoundMode?: (value: RoundModeType) => void; // 同上
};

export const CanvasController: React.FC<CanvasControllerProps> = props => {
  const classes = useStyles();

  // Warning: 任何对该对象的修改都不应在本组件中进行，本组件仅仅只读取该对象的值！
  const algorithm = props.canvasCommonHandler.getAlgorithm();

  // 用于构成所有算法参数组件的组件变量
  let algorithmArgsComponents: JSX.Element[] = [];

  const operateToggleButtonGroup = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={props.operateType}
      onChange={(e, value) =>
        props.onOperateChanged &&
        value &&
        props.onOperateChanged(value as OperateType)
      }
    >
      {/* 多边形功能切换按钮 */}
      <ToggleButton key={0} value="polygon" disabled={props.algorithmWorking}>
        <SvgIcon color="inherit" viewBox="0 0 24 24" fill="transparent">
          <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z" />
        </SvgIcon>
      </ToggleButton>
      {/* 填充颜色切换按钮 */}
      <ToggleButton key={1} value="fill" disabled={props.algorithmWorking}>
        <SvgIcon color="inherit" viewBox="0 0 24 24" fill="transparent">
          <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z" />
          <path fillOpacity=".36" d="M0 20h24v4H0z" />
        </SvgIcon>
      </ToggleButton>
      {/* 图片加载按钮 */}
      <ToggleButton key={2} value="image" disabled={props.algorithmWorking}>
        <SvgIcon color="inherit" viewBox="0 0 24 24" fill="transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </SvgIcon>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const handleDownload = () => {
    let link = document.createElement("a");
    link.download = "canvas.png";
    link.href = props.canvasCommonHandler
      .getCanvasHTMLElement()
      .toDataURL("png")
      .replace("image/png", "image/octet-stream");
    link.click();
  };

  const handleClear = () => {
    props.canvasCommonHandler.clearCanvas();
  };

  const functionButtonGroup = (
    <>
      <ButtonGroup size="small">
        {/* 下载按钮 */}
        <Button
          variant="outlined"
          className={classes.button}
          onClick={handleDownload}
        >
          <SvgIcon color="inherit" viewBox="0 0 24 24" fill="transparent">
            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
          </SvgIcon>
        </Button>
        {/* 清空按钮 */}
        <Button
          variant="outlined"
          color="secondary"
          className={classes.button}
          onClick={handleClear}
          disabled={props.algorithmWorking}
        >
          <SvgIcon color="inherit" viewBox="0 0 24 24" fill="transparent">
            <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
          </SvgIcon>
        </Button>
      </ButtonGroup>
    </>
  );

  const algorithmSelect = (
    <>
      <FormControl>
        <InputLabel id="algorithm-select-label">算法</InputLabel>
        <Select
          labelId="algorithm-select-label"
          id="algorithm-select"
          className={classes.formControl}
          value={props.algorithmType}
          onChange={e =>
            props.onAlgorithmTypeChanged &&
            props.onAlgorithmTypeChanged(e.target.value as AlgorithmType)
          }
        >
          {props.canvasCommonHandler.supportedAlgorithmTypes.map((s, i) => (
            <MenuItem key={i} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );

  props.roundMode !== null &&
    algorithmArgsComponents.push(
      <FormControl component="fieldset">
        <FormLabel component="legend" className={classes.formLabel}>
          取整方式
        </FormLabel>
        <RadioGroup
          row
          name="roundMethod"
          value={props.roundMode}
          onChange={(e, v) =>
            props.onRoundMode && props.onRoundMode(v as RoundModeType)
          }
        >
          <FormControlLabel value="ceil" control={<Radio />} label="Ceil" />
          <FormControlLabel value="round" control={<Radio />} label="Round" />
          <FormControlLabel value="floor" control={<Radio />} label="Floor" />
        </RadioGroup>
      </FormControl>
    );

  (props.borderColor || props.fillColor) &&
    algorithmArgsComponents.push(
      <ColorToggleButtonGroup
        picker={props.canvasCommonHandler.picker}
        colors={{ border: props.borderColor, fill: props.fillColor }}
        onColorChanged={(ct: ColorType, color: Color) => {
          switch (ct) {
            case "border":
              props.onBorderColorChanged && props.onBorderColorChanged(color);
              break;
            case "fill":
              props.onFillColorChanged && props.onFillColorChanged(color);
              break;
            default:
              break;
          }
        }}
      />
    );

  props.canvasCommonHandler.operateType === "image" &&
    !props.algorithmWorking &&
    algorithmArgsComponents.push(
      <>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="raised-button-file"
          type="file"
          onChange={v => {
            if (props.canvasCommonHandler.operateType !== "image") {
              throw new Error("当前 commonHandler 无法处理图片！");
            }
            const commonHandler = props.canvasCommonHandler as ImageCommonHandler;
            if (v.target.files) {
              const file = v.target.files[0];
              createImageBitmap(file).then(v => {
                if (algorithm.algorithmType === "_InternalImage") {
                  (algorithm as ImageInternalAlgorithm).setCtx(
                    commonHandler.ctx
                  );
                }
                commonHandler.loadImage(v);
              });
            }
          }}
        />
        <label htmlFor="raised-button-file">
          <Button
            variant="outlined"
            component="span"
            className={classes.button}
          >
            加载图片
          </Button>
        </label>
      </>
    );

  props.canvasCommonHandler.operateType === "image" &&
    props.algorithmWorking &&
    algorithmArgsComponents.push(
      <ButtonGroup>
        {/* 完成按钮 */}
        <Button
          onClick={() =>
            (props.canvasCommonHandler as ImageCommonHandler).acceptImageRect()
          }
        >
          <SvgIcon>
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
          </SvgIcon>
        </Button>
        {/* 取消按钮 */}
        <Button
          onClick={() =>
            (props.canvasCommonHandler as ImageCommonHandler).abandon()
          }
        >
          <SvgIcon>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </SvgIcon>
        </Button>
      </ButtonGroup>
    );

  return (
    <Paper elevation={0} className={classes.paper}>
      <Grid container direction="row" justify="flex-start" alignItems="center">
        <Grid item className={classes.gridItem}>
          {operateToggleButtonGroup}
        </Grid>
        <Divider orientation="vertical" className={classes.divider} />
        <Grid item className={classes.gridItem}>
          {functionButtonGroup}
        </Grid>
        <Divider orientation="vertical" className={classes.divider} />
        {/* 算法选择下拉框 */}
        <Grid item className={classes.gridItem}>
          {algorithmSelect}
        </Grid>
        <Divider orientation="vertical" className={classes.divider} />
        {/* 算法参数组件 记住每个算法组件都是最外层不是 Grid 了，需要再次包装*/}
        {algorithmArgsComponents.reverse().map((element, i) => (
          <Grid item key={i} className={classes.gridItem}>
            {element}
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
