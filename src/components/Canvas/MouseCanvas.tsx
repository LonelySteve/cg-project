import React, { useState } from 'react';
import { CanvasBase, DownloadFileNameType } from './CanvasBase';
import { Position, Size } from './Model';

type MouseCanvasProps = { draw: (imageData: ImageData, pos1: Position, pos2: Position) => void } & Size & DownloadFileNameType

const MouseCanvas: React.FC<MouseCanvasProps> = (props) => {
    const [startPosition, setStartPosition] = useState<Position | undefined>(undefined);
    const [endPosition, setEndPosition] = useState<Position | undefined>(undefined);

    return (
        <CanvasBase
            height={props.height}
            width={props.width}
            downloadFileName={props.downloadFileName}
            canvasRenderContext={(ctx) => {
                const currentImageData = ctx.getImageData(0, 0, props.width, props.height);
                if (endPosition !== undefined && startPosition !== undefined) {
                    console.log(`起始点：${startPosition}`);
                    console.log(`终止点：${endPosition}`);
                    props.draw(currentImageData, startPosition, endPosition);
                    ctx.putImageData(currentImageData, 0, 0);
                    console.log("绘制完成！");
                    setStartPosition(undefined);
                    setEndPosition(undefined);
                }
            }}
            onMouseDown={(e) => {
                // 右键是不被支持的
                if (e.button === 2) {
                    return;
                }
                if (startPosition === undefined) {
                    setStartPosition({ X: e.nativeEvent.offsetX, Y: e.nativeEvent.offsetY });
                    return;
                }
                if (endPosition === undefined) {
                    setEndPosition({ X: e.nativeEvent.offsetX, Y: e.nativeEvent.offsetY });
                }
            }}
        />
    );
}

export default MouseCanvas;