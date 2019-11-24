import { createStyles, Grid, makeStyles, Theme } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import clsx from "clsx";
import React from "react";
import { Point, Size } from "../../models/Base";
import CanvasToolBar from "./CanvasToolBar";

export type CanvasBaseState = { contextMenuMousePosition?: Point };
export type CustomDragEventHandlers = {
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseMove?: React.MouseEventHandler;
};
export type InnerCanvasProps = Size & {
  onContextMenu?: React.MouseEventHandler;
} & CustomDragEventHandlers;
export type DownloadFileNameType = { downloadFileName?: string };
export type CanvasBaseProps = Size &
  CustomDragEventHandlers & {
    canvasRenderContext?: (ctx: CanvasRenderingContext2D) => void;
  } & DownloadFileNameType;

/**
 * Canvas Props
 */
interface CanvasProps {}

const usePropsStyles = makeStyles<Theme, Size>({
  canvasSize: {
    minWidth: props => props.width,
    minHeight: props => props.height
  },
  contextSize: {
    minWidth: 200
  }
});

const useThemeStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    canvasShadow: {
      boxShadow: theme.shadows[3]
    }
  })
);

// 使用一个内联定义的画板，以绕过 样式Hook 不能使用的问题
const InnerCanvas = React.forwardRef<HTMLCanvasElement, InnerCanvasProps>(
  (props, ref) => {
    const classes = usePropsStyles(props);
    const themeClasses = useThemeStyles();
    return (
      <canvas
        ref={ref}
        className={clsx(classes.canvasSize, themeClasses.canvasShadow)}
        height={props.height}
        width={props.width}
        onContextMenu={props.onContextMenu}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onMouseUp={props.onMouseUp}
        onMouseDown={props.onMouseDown}
        onMouseMove={props.onMouseMove}
      />
    );
  }
);

export class CanvasBase<P = {}, S = {}> extends React.Component<
  CanvasBaseProps & P,
  CanvasBaseState & S
> {
  private canvas: HTMLCanvasElement = {} as HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  private ref: React.RefObject<HTMLCanvasElement>;

  constructor(props: CanvasBaseProps & P) {
    super(props);
    this.state = {} as CanvasBaseState & S;
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.canvas = this.ref.current as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    if (this.props.canvasRenderContext !== undefined) {
      this.props.canvasRenderContext(this.ctx);
    }
  }

  componentDidUpdate() {
    if (this.props.canvasRenderContext !== undefined) {
      this.props.canvasRenderContext(this.ctx);
    }
  }

  render() {
    const handleContextMenu: React.MouseEventHandler = e => {
      e.preventDefault();
      this.setState({
        contextMenuMousePosition: {
          X: e.clientX - 2,
          Y: e.clientY - 4
        }
      });
    };

    const handleMenuClose: React.MouseEventHandler = e => {
      this.setState({ contextMenuMousePosition: undefined });
    };

    const handleDownload: React.MouseEventHandler = e => {
      let link = document.createElement("a");
      link.download = "canvas.png";
      link.href = this.canvas
        .toDataURL("png")
        .replace("image/png", "image/octet-stream");
      link.click();
      handleMenuClose(e);
    };

    return (
      <Grid
        container
        item
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid item>
            <CanvasToolBar/>
        </Grid>
        <Grid item>
          <InnerCanvas
            ref={this.ref}
            height={this.props.height}
            width={this.props.width}
            onContextMenu={handleContextMenu}
            onMouseDown={this.props.onMouseDown}
            onMouseEnter={this.props.onMouseEnter}
            onMouseLeave={this.props.onMouseLeave}
            onMouseUp={this.props.onMouseUp}
            onMouseMove={this.props.onMouseMove}
          />
          <Menu
            keepMounted
            open={this.state.contextMenuMousePosition !== undefined}
            anchorReference="anchorPosition"
            onClose={handleMenuClose}
            anchorPosition={
              this.state.contextMenuMousePosition !== undefined
                ? {
                    top: this.state.contextMenuMousePosition.Y,
                    left: this.state.contextMenuMousePosition.X
                  }
                : undefined
            }
          >
            <MenuItem style={{ minWidth: 150 }}>导入</MenuItem>
            <MenuItem divider={true} onClick={handleDownload}>
              下载
            </MenuItem>
            <MenuItem
              onClick={e => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                handleMenuClose(e);
              }}
            >
              清空
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
    );
  }
}
