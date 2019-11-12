import { Box, FormLabel, makeStyles, SvgIcon } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import React, { useState } from "react";
import { ColorChangeHandler, SketchPicker } from "react-color";
import Color from "../../core/models/Color";
import Picker, { PickHandler } from "../../core/utils/Picker";

const useStyles = makeStyles(theme => ({
  popOver: {
    position: "absolute",
    top: "150px",
    zIndex: 233
  },
  cover: {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px"
  }
}));

export type ColorType = "border" | "fill";

export type ColorToggleButtonGroupProps = {
  picker: Picker;
  colors?: { [index in ColorType]: Color | undefined | null };
  labels?: { [index in ColorType]: string | undefined };
  onColorChanged?: (colorType: ColorType, color: Color) => void;
};

export const ColorToggleButtonGroup: React.FC<ColorToggleButtonGroupProps> = props => {
  const classes = useStyles();

  const labels =
    props.labels || ({} as { [index in ColorType]: string | undefined });
  const colors =
    props.colors || ({} as { [index in ColorType]: Color | undefined | null });

  // 维护 ColorPicker 的 ColorType
  const [colorPickerColorType, setColorPickerColorType] = useState<
    ColorType | undefined
  >();

  const colorPickHandler: PickHandler = event => {
    if (!event.detail) {
      return;
    }
    const pickerColorType = event.detail.pickColorType as ColorType;
    // pickerColorType 有可能为 undefined，出现这种情况说明有可能 picker 当前工作模式为取点
    if (pickerColorType) {
      props.onColorChanged &&
        props.onColorChanged(pickerColorType, event.detail.pickColor);
    }
  };

  // 重新绑定监听器
  document.removeEventListener("onPick", colorPickHandler);
  document.addEventListener("onPick", colorPickHandler);

  const handleChange: ColorChangeHandler = color => {
    const myColor = Color.fromColorResult(color);
    props.onColorChanged &&
      colorPickerColorType &&
      props.onColorChanged(colorPickerColorType, myColor);
  };

  const handleClick: React.MouseEventHandler = event => {
    const value = (event.currentTarget as HTMLButtonElement).value as ColorType;
    // 判断用户是否同时按下 shift
    if (event.shiftKey) {
      props.picker.colorType = value;
      props.picker.enable();
      return;
    }
    setColorPickerColorType(value);
  };

  const content = (color: Color, text: string) => (
    <>
      <SvgIcon
        color="inherit"
        viewBox="0 0 24 24"
        fill="transparent"
        style={{ color: color.toRgb().reverseBlackOrWhite.cssStyle }}
      >
        <path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z" />
      </SvgIcon>
      <FormLabel
        style={{
          color: color.toRgb().reverseBlackOrWhite.cssStyle,
          cursor: "pointer"
        }}
      >
        {text}
      </FormLabel>
    </>
  );

  return (
    <Box
      onContextMenu={e => {
        // 阻止默认的右键菜单行为
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ToggleButtonGroup exclusive size="small" value={props.picker.colorType}>
        {/* 填充颜色 */}
        {colors["fill"] !== null && (
          <ToggleButton
            key={1}
            value="fill"
            onClick={handleClick}
            style={{
              background: (colors["fill"] || Color.black).cssStyle
            }}
          >
            {content(
              colors["fill"] || Color.black,
              labels["fill"] || "填充颜色"
            )}
          </ToggleButton>
        )}
        {/* 边框颜色 */}
        {colors["border"] !== null && (
          <ToggleButton
            key={2}
            value="border"
            onClick={handleClick}
            style={{
              background: (colors["border"] || Color.black).cssStyle
            }}
          >
            {content(
              colors["border"] || Color.black,
              labels["border"] || "边框颜色"
            )}
          </ToggleButton>
        )}
      </ToggleButtonGroup>
      {/* 视状态不同显示或隐藏 ColorPicker */}
      {colorPickerColorType ? (
        <Box className={classes.popOver}>
          <Box
            className={classes.cover}
            onClick={() => setColorPickerColorType(undefined)}
          />
          <SketchPicker
            color={(colors[colorPickerColorType] || Color.black).toRGBColor()}
            onChange={handleChange}
          />
        </Box>
      ) : null}
    </Box>
  );
};
