import { Box, createStyles, makeStyles, Theme } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import clsx from 'clsx';
import { observable } from 'mobx';
import { observer } from "mobx-react";
import React from 'react';
import { Point, Size } from '../../models/Base';
import { IHasBorderColor, IHasFillColor } from '../../models/CanvasElements';
import { CanvasStateWrapper } from './CanvasState';

export type CustomDragEventHandlers = {
    onMouseEnter?: React.MouseEventHandler,
    onMouseLeave?: React.MouseEventHandler,
    onMouseUp?: React.MouseEventHandler,
    onMouseDown?: React.MouseEventHandler,
    onMouseMove?: React.MouseEventHandler
}
export type InnerCanvasProps = Size & { onContextMenu?: React.MouseEventHandler } & CustomDragEventHandlers
export type DownloadFileNameType = { downloadFileName?: string };
export type CanvasProps = CanvasStateWrapper;


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

@observer
export class Canvas extends React.Component<CanvasProps>{
    private canvas: HTMLCanvasElement = {} as HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
    private ref: React.RefObject<HTMLCanvasElement>;
    @observable
    private contextMenuMousePosition?: Point;

    constructor(props: CanvasProps) {
        super(props);
        this.ref = React.createRef();
    }

    componentDidMount() {
        this.canvas = this.ref.current as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    componentDidUpdate() {
        // 遍历元素队列以绘制所有元素到内部画布中
        for (const element of this.props.stateInstance.elements) {
            let elem = element as unknown;
            if (elem as IHasBorderColor) {
                (elem as IHasBorderColor).borderPainter.drawTo(this.ctx);
            }
            if (elem as IHasFillColor) {
                (elem as IHasFillColor).fillPainter.drawTo(this.ctx);
            }
        }
    }


    render() {
        const handleContextMenu: React.MouseEventHandler = (e) => {
            e.preventDefault();
            this.contextMenuMousePosition = {
                X: e.clientX - 2,
                Y: e.clientY - 4
            };
        }

        const handleMenuClose: React.MouseEventHandler = (e) => {
            this.contextMenuMousePosition = undefined;
        }

        const handleDownload: React.MouseEventHandler = (e) => {
            let link = document.createElement('a');
            link.download = this.props.stateInstance.downloadFileName;
            link.href = this.canvas.toDataURL("png").replace("image/png", "image/octet-stream");
            link.click();
            handleMenuClose(e);
        }

        return (
            <Box style={{ position: "relative" }}>
                <InnerCanvas
                    ref={this.ref}
                    height={this.props.stateInstance.size.height}
                    width={this.props.stateInstance.size.width}
                    onContextMenu={handleContextMenu}
                // onMouseDown={this.props.onMouseDown}
                // onMouseEnter={this.props.onMouseEnter}
                // onMouseLeave={this.props.onMouseLeave}
                // onMouseUp={this.props.onMouseUp}
                // onMouseMove={this.props.onMouseMove}
                />
                <Menu
                    keepMounted
                    open={this.contextMenuMousePosition !== undefined}
                    anchorReference="anchorPosition"
                    onClose={handleMenuClose}
                    anchorPosition={
                        this.contextMenuMousePosition !== undefined
                            ? { top: this.contextMenuMousePosition.Y, left: this.contextMenuMousePosition.X }
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