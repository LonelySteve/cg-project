import React, { useState } from 'react';
import { CanvasBase, DownloadFileNameType, Position, Size } from './CanvasBase';

type MouseCanvasProps = { onAnimationFrame: (imageData: ImageData, pos1?: Position, pos2?: Position) => ImageData | null } & Size & DownloadFileNameType

const MouseCanvas: React.FC<MouseCanvasProps> = (props) => {
    const [isDraging, setIsDraging] = useState(false);
    const [startPosition, setStartPosition] = useState<Position | undefined>(undefined);
    const [endPosition, setEndPosition] = useState<Position | undefined>(undefined);

    let vaildImageData: ImageData | undefined = undefined;


    return (
        <CanvasBase
            height={props.height}
            width={props.width}
            downloadFileName={props.downloadFileName}
            canvasRenderContext={(ctx) => {
                if (vaildImageData === undefined) {
                    vaildImageData = ctx.getImageData(0, 0, props.width, props.height);
                }
                if (vaildImageData !== undefined) {
                    // 不能把有效的图像数据丢到动画帧里，这样会破坏现场
                    const copyVaildImageData = new ImageData(vaildImageData.data.slice(0), vaildImageData.width, vaildImageData.height);
                    const newFrame = props.onAnimationFrame(copyVaildImageData, startPosition, endPosition);

                    if (newFrame !== null) {
                        ctx.putImageData(newFrame, 0, 0);
                        if (!isDraging) {
                            vaildImageData = newFrame;
                            console.log("替换新的有效帧");
                        }
                    }
                }
            }}
            onMouseDown={(e) => {
                setIsDraging(true);
                setStartPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
            }}
            onMouseMove={(e) => {
                if (isDraging) {
                    setEndPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
                }
            }}
            onMouseUp={(e) => {
                setIsDraging(false);
            }}
            onMouseLeave={(e) => {
                setIsDraging(false);
            }}
        />
    );
}

export default MouseCanvas;