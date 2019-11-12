import React, { useEffect } from "react";
import Color from "../../core/models/Color";
import CanvasCommonHandler from "../../core/utils/commonHandler/CanvasCommonHandler";

export type CanvasSize = {
  width?: number;
  height?: number;
};

export type CanvasAreaProps = {
  defaultBgColor?: Color;
  commonHandler?: CanvasCommonHandler;
} & CanvasSize;

const handleContextMenu: React.MouseEventHandler<HTMLCanvasElement> = e => {
  e.preventDefault();
};

export const CanvasArea = React.forwardRef<HTMLCanvasElement, CanvasAreaProps>(
  (props, ref) => {
    if (props.commonHandler === undefined) {
      return <canvas ref={ref} width={props.width} height={props.height} />;
    }
    // 在组件挂载完成之后调用
    useEffect(() => {
      if (ref !== null) {
        const canvasElementRef = ref as React.RefObject<HTMLCanvasElement>;
        if (canvasElementRef.current) {
          const ctx = canvasElementRef.current.getContext("2d");
          if (ctx) {
            // 默认填充颜色为白色
            ctx.fillStyle = props.defaultBgColor
              ? props.defaultBgColor.cssStyle
              : Color.white.cssStyle;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          }
        }
      }
    // eslint-disable-next-line
    }, []);
    return (
      <canvas
        ref={ref}
        width={props.width}
        height={props.height}
        onMouseDown={props.commonHandler.mouseDownHandler}
        onContextMenu={handleContextMenu}
        onMouseEnter={props.commonHandler.mouseEnterHandler}
        onMouseLeave={props.commonHandler.mouseLeaveHandler}
        onMouseMove={props.commonHandler.mouseMoveHandler}
        onMouseOut={props.commonHandler.mouseOutHandler}
        onMouseOver={props.commonHandler.mouseOverHandler}
        onMouseUp={props.commonHandler.mouseUpHandler}
        onClick={props.commonHandler.clickHandler}
      />
    );
  }
);
