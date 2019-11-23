
import { Point } from "../models/Base";
import { CanvasElement, Line } from "../models/CanvasElements";
import { ImageDataProxy } from "./ImageDataProxy";


export abstract class PainterBase {
    private _canvasElement: CanvasElement;

    public get canvasElement(): CanvasElement {
        return this._canvasElement;
    }


    constructor(canvasElement: CanvasElement) {
        this._canvasElement = canvasElement;
    }



    drawTo(ctx?: CanvasRenderingContext2D, dPoint?: Point): ImageData {
        if (ctx) {
            let imageData: ImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            imageData = this.drawByPixels(new ImageDataProxy(imageData));
            if (imageData) {
                if (dPoint) {
                    ctx.putImageData(imageData, dPoint.X, dPoint.Y);
                } else {
                    ctx.putImageData(imageData, 0, 0);
                }
            }
            return imageData;
        }

        const imageData = {
            data: new Uint8ClampedArray(this.canvasElement.rect.width * this.canvasElement.rect.height * 4),
            height: this.canvasElement.rect.height,
            width: this.canvasElement.rect.width
        } as ImageData;

        return this.drawByPixels(new ImageDataProxy(imageData));;
    }

    protected abstract drawByPixels(imageData: ImageDataProxy): ImageData;

    protected throwUnsupportError(algorithmName: string): never {
        throw new Error(`${this.canvasElement} is not supported to be drawn using a ${algorithmName} algorithm!`);
    }
}


class BuildInPainter extends PainterBase {

    protected drawByPixels(imageData: ImageDataProxy): ImageData {
        // 啥也不做，对于内置实现的Drawer，它通过重写 drawTo 实现功能
        return imageData.base;
    }

    drawTo(ctx: CanvasRenderingContext2D, dPoint?: Point): ImageData {
        this.drawLine(ctx, dPoint) || // 画线
            // TODO 添加其他元素绘制支持
            this.throwUnsupportError("built-in");

        return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    private drawLine(ctx: CanvasRenderingContext2D, dPoint?: Point): boolean {
        if (this.canvasElement instanceof Line) {
            dPoint = dPoint !== undefined ? dPoint : ({ X: 0, Y: 0 } as Point);
            ctx.save()
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.canvasElement.borderColor.hex;
            ctx.moveTo(this.canvasElement.startPoint.X + dPoint.X, this.canvasElement.startPoint.Y + dPoint.Y);
            ctx.lineTo(this.canvasElement.endPoint.X + dPoint.X, this.canvasElement.endPoint.Y + dPoint.Y);
            ctx.stroke();
            return true;
        }
        return false;
    }
}

class DDAPainter extends PainterBase {
    protected drawByPixels(imageData: ImageDataProxy): ImageData {
        if (this.canvasElement instanceof Line) {
            const drawPoints = new Array<Point>();

            const startPoint = this.canvasElement.startPoint;
            const endPoint = this.canvasElement.endPoint;

            const dy = endPoint.Y - startPoint.Y;
            const dx = endPoint.X - startPoint.X;

            const m = dy / dx;

            let steps: number;

            if (Math.abs(dx) > Math.abs(dy)) {
                steps = Math.abs(dx);
            } else {
                steps = Math.abs(dy);
            }

            const x_incr = dx / steps;
            const y_incr = dy / steps;

            let x = startPoint.X;
            let y = startPoint.Y;

            drawPoints.push({ X: x, Y: y });

            for (let i = 0; i < steps; i++) {
                x += x_incr;
                y += y_incr;

                drawPoints.push({ X: x, Y: y });
            }

            imageData.setPoints(drawPoints, this.canvasElement.borderColor);
            return imageData.base;
        }
        // TODO 添加其他元素绘制支持
        this.throwUnsupportError("dda");
    }
}