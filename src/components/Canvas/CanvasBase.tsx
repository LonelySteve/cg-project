import { Box, createStyles, makeStyles, Theme } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import clsx from 'clsx';
import React from 'react';

export type Size = { width: number, height: number };
export type Position = { x: number, y: number };
export type CanvasBaseState = { contextMenuMousePosition?: Position };
export type CustomDragEventHandlers = {
    onMouseEnter?: React.MouseEventHandler,
    onMouseLeave?: React.MouseEventHandler,
    onMouseUp?: React.MouseEventHandler,
    onMouseDown?: React.MouseEventHandler,
    onMouseMove?: React.MouseEventHandler
}
export type InnerCanvasProps = Size & { onContextMenu?: React.MouseEventHandler } & CustomDragEventHandlers
export type DownloadFileNameType = { downloadFileName?: string };
export type CanvasBaseProps = Size & CustomDragEventHandlers & { canvasRenderContext?: (ctx: CanvasRenderingContext2D) => void } & DownloadFileNameType;

const usePropsStyles = makeStyles<Theme, Size>({
    canvasSize: {
        minWidth: props => props.width,
        minHeight: props => props.height
    },
    contextSize: {
        minWidth: 200
    }
});

const useThemeStyles = makeStyles<Theme>((theme: Theme) => createStyles({
    canvasShadow: {
        boxShadow: theme.shadows[3]
    }
}));
// 使用一个内联定义的画板，以绕过 样式Hook 不能使用的问题
const InnerCanvas = React.forwardRef<HTMLCanvasElement, InnerCanvasProps>((props, ref) => {
    const classes = usePropsStyles(props);
    const themeClasses = useThemeStyles();
    return <canvas ref={ref}
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
});


export class CanvasBase<P = {}, S = {}> extends React.Component<CanvasBaseProps & P, CanvasBaseState & S>{
    private canvas: HTMLCanvasElement = {} as HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
    private ref: React.RefObject<HTMLCanvasElement>;

    constructor(props: CanvasBaseProps & P) {
        super(props);
        this.state = {} as (CanvasBaseState & S);
        this.ref = React.createRef();
    }

    componentDidMount() {
        this.canvas = this.ref.current as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.firstDrawing(this.ctx);
        if (this.props.canvasRenderContext !== undefined) {
            this.props.canvasRenderContext(this.ctx);
        }
    }

    componentDidUpdate() {
        if (this.props.canvasRenderContext !== undefined) {
            this.props.canvasRenderContext(this.ctx);
        }
    }
    /**
     * 子类继承以实现初始绘制
     * 
     * @param canvasImageData 用来对画板图像数据进行操作的对象
     */
    protected firstDrawing(canvasImageData: CanvasImageData) {
        // 一个参考实现
        // let newImageData: ImageData = new ImageData(new Uint8ClampedArray(this.canvas.height * this.canvas.width * 4), this.canvas.width, this.canvas.height);

        // for (let y = 0; y < this.canvas.height; y++) {
        //     for (let x = 0; x < this.canvas.width; x++) {
        //         for (let p = 0; p < 4; p++) {
        //             newImageData.data[y * this.canvas.width * 4 + x * 4 + p] = Math.random() * 255;
        //         }
        //     }
        // }
        // canvasImageData.putImageData(newImageData, 0, 0);
    }

    /**
     * 清除指定矩形区域内的像素
     *     
     * @param x 指定矩形区域左上角 x 坐标，可省，默认为 0
     * @param y 指定矩形区域左上角 y 坐标，可省，默认为 0
     * @param width 指定矩形区域宽，可省，默认为 canvas 的宽
     * @param height 指定矩形区域高，可省，默认为 canvas 的高
     */
    protected clearRect(x?: number, y?: number, width?: number, height?: number) {
        this.ctx.clearRect(x || 0, y || 0, width || this.canvas.width, height || this.canvas.height);
    }


    render() {
        const handleContextMenu: React.MouseEventHandler = (e) => {
            e.preventDefault();
            this.setState({
                contextMenuMousePosition: {
                    x: e.clientX - 2,
                    y: e.clientY - 4
                }
            });
        }

        const handleMenuClose: React.MouseEventHandler = (e) => {
            this.setState({ contextMenuMousePosition: undefined });
        }

        const handleDownload: React.MouseEventHandler = (e) => {
            let link = document.createElement('a');
            link.download = "canvas.png";
            link.href = this.canvas.toDataURL("png").replace("image/png", "image/octet-stream");
            link.click();
            handleMenuClose(e);
        }

        return (
            <Box style={{ position: "relative" }}>
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
                            ? { top: this.state.contextMenuMousePosition.y, left: this.state.contextMenuMousePosition.x }
                            : undefined
                    }
                >
                    <MenuItem style={{ minWidth: 150 }}>导入</MenuItem>
                    <MenuItem divider={true} onClick={handleDownload}>下载</MenuItem>
                    <MenuItem onClick={(e) => { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); handleMenuClose(e); }}>清空</MenuItem>
                </Menu>
            </Box>
        );
    }
}
