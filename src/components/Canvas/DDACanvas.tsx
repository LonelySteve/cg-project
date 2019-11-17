import React from 'react';
import MouseCanvas from './MouseCanvas';

type Size = { width: number, height: number };

const DDACanvas: React.FC<Size> = (props) => {

    return (
        <MouseCanvas
            {...props}
            onAnimationFrame={(imageData, pos1, pos2) => {
                for (let y = 0; y < props.height; y++) {
                    for (let x = 0; x < props.width; x++) {
                        for (let p = 0; p < 4; p++) {
                            imageData.data[y * props.width * 4 + x * 4 + p] = 255;
                        }
                    }
                }

                if (pos1 === undefined || pos2 === undefined) {
                    return null;
                }

                const dy = pos2.y - pos1.y;
                const dx = pos2.x - pos1.x;

                const m = dy / dx;

                let steps: number;

                if (Math.abs(dx) > Math.abs(dy)) {
                    steps = Math.abs(dx);
                } else {
                    steps = Math.abs(dy);
                }

                const x_incr = dx / steps;
                const y_incr = dy / steps;

                let x = pos1.x;
                let y = pos1.y;

                imageData.data[x * 4 + y * props.width * 4 + 0] = 0;
                imageData.data[x * 4 + y * props.width * 4 + 1] = 0;
                imageData.data[x * 4 + y * props.width * 4 + 2] = 0;
                imageData.data[x * 4 + y * props.width * 4 + 3] = 255;

                for (let i = 0; i < steps; i++) {
                    x += x_incr;
                    y += y_incr;

                    imageData.data[x * 4 + y * props.width * 4 + 0] = 0;
                    imageData.data[x * 4 + y * props.width * 4 + 1] = 0;
                    imageData.data[x * 4 + y * props.width * 4 + 2] = 0;
                    imageData.data[x * 4 + y * props.width * 4 + 3] = 255;
                }

                return imageData;
            }}
        />
    );
}

export default DDACanvas;