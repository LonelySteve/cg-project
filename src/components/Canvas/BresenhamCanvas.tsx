import React from 'react';
import MouseCanvas from './MouseCanvas';

type Size = { width: number, height: number };

const BresenhamCanvas: React.FC<Size> = (props) => {
    return (
        <MouseCanvas
            {...props}
            draw={(imageData, pos1, pos2) => {

                const setPoint = (x: number, y: number, rgba: [number, number, number, number]) => {
                    x = Math.round(x);
                    y = Math.round(y);
                    imageData.data[x * 4 + y * props.width * 4 + 0] = rgba[0];
                    imageData.data[x * 4 + y * props.width * 4 + 1] = rgba[1];
                    imageData.data[x * 4 + y * props.width * 4 + 2] = rgba[2];
                    imageData.data[x * 4 + y * props.width * 4 + 3] = rgba[3];
                }

                let x, y, dx, dy, s1, s2, p, temp, interchange, i: number;

                x = pos1.X;
                y = pos1.Y;

                dx = Math.abs(pos2.X - pos1.X);
                dy = Math.abs(pos2.Y - pos1.Y);

                if (pos2.X > pos1.X) {
                    s1 = 1;
                } else {
                    s1 = -1;
                }

                if (pos2.Y > pos1.Y) {
                    s2 = 1;
                } else {
                    s2 = -1;
                }

                if (dy > dx) {
                    temp = dx;
                    dx = dy;
                    dy = temp;
                    interchange = 1;
                }
                else
                    interchange = 0;

                p = 2 * dy - dx;
                for (i = 1; i <= dx; i++) {
                    setPoint(x, y, [0, 0, 0, 255]);
                    if (p >= 0) {
                        if (interchange === 0)
                            y = y + s2;
                        else
                            x = x + s1;
                        p = p - 2 * dx;
                    }
                    if (interchange === 0)
                        x = x + s1;
                    else
                        y = y + s2;
                    p = p + 2 * dy;
                }
            }}
        ></MouseCanvas>
    );
}

export default BresenhamCanvas;