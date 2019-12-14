import React, { useEffect } from "react";
import Color from "../../core/models/Color";

export type CanvasSize = {
  width?: number;
  height?: number;
};

export type CanvasAreaProps = {
  defaultBgColor?: Color;
  onLoad?: () => void;
} & CanvasSize;

const handleContextMenu: React.MouseEventHandler<HTMLCanvasElement> = e => {
  e.preventDefault();
};

export const CanvasArea = React.forwardRef<HTMLCanvasElement, CanvasAreaProps>(
  (props, ref) => {
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
      props.onLoad && props.onLoad();
      // eslint-disable-next-line
    }, []);
    return (
      <canvas
        ref={ref}
        width={props.width}
        height={props.height}
        onContextMenu={handleContextMenu}
      />
    );
  }
);
