import React from 'react';
import MouseCanvas from './MouseCanvas';

type Size = { width: number, height: number };

const DDACanvas: React.FC<Size> = (props) => {

    return (
        <MouseCanvas
            {...props}
            draw={(imageData, pos1, pos2) => {
                // for (let y = 0; y < props.height; y++) {
                //     for (let x = 0; x < props.width; x++) {
                //         for (let p = 0; p < 4; p++) {
                //             imageData.data[y * props.width * 4 + x * 4 + p] = 255;
                //         }
                //     }
                // }

                if (pos1 === undefined || pos2 === undefined) {
                    return null;
                }

                const dy = pos2.Y - pos1.Y;
                const dx = pos2.X - pos1.X;

                const m = dy / dx;

                let steps: number;

                if (Math.abs(dx) > Math.abs(dy)) {
                    steps = Math.abs(dx);
                } else {
                    steps = Math.abs(dy);
                }

                const x_incr = dx / steps;
                const y_incr = dy / steps;

                let x = pos1.X;
                let y = pos1.Y;

                const setPoint = (x: number, y: number, rgba: [number, number, number, number]) => {
                    x = Math.round(x);
                    y = Math.round(y);
                    imageData.data[x * 4 + y * props.width * 4 + 0] = rgba[0];
                    imageData.data[x * 4 + y * props.width * 4 + 1] = rgba[1];
                    imageData.data[x * 4 + y * props.width * 4 + 2] = rgba[2];
                    imageData.data[x * 4 + y * props.width * 4 + 3] = rgba[3];
                }

                setPoint(x, y, [0, 0, 0, 255]);

                for (let i = 0; i < steps; i++) {
                    x += x_incr;
                    y += y_incr;

                    setPoint(x, y, [0, 0, 0, 255]);
                }

                return imageData;
            }}
        />
    );
}

export default DDACanvas;