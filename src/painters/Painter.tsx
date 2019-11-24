import { action, observable } from "mobx";
import { Point } from "../models/Base";
import { CanvasElement, Line } from "../models/CanvasElements";
import ImageDataEx from "./ImageDataEx";

export abstract class PainterBase {
  private _canvasElement: CanvasElement;
  @observable enabledStatus: boolean = true;

  constructor(canvasElement: CanvasElement) {
    this._canvasElement = canvasElement;
  }

  @action
  public disable() {
    this.enabledStatus = false;
  }

  @action
  public enable() {
    this.enabledStatus = true;
  }

  public get canvasElement(): CanvasElement {
    return this._canvasElement;
  }

  drawTo(ctx: CanvasRenderingContext2D): ImageData {
    const imageData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
    if (!this.enabledStatus) {
      return imageData;
    }
    // 通过像素绘制方法重绘画布数据
    return this.drawByPixels(imageData as ImageDataEx);
  }

  protected abstract drawByPixels(imageData: ImageDataEx): ImageData;

  protected throwUnsupportError(algorithmName: string): never {
    throw new Error(
      `${this.canvasElement} is not supported to be drawn using a ${algorithmName} algorithm!`
    );
  }
}

class BuildInPainter extends PainterBase {
  protected drawByPixels(imageData: ImageDataEx): ImageData {
    // 啥也不做，对于内置实现的Drawer，它通过重写 drawTo 实现功能
    return imageData;
  }

  drawTo(ctx: CanvasRenderingContext2D): ImageData {
    if (this.enabledStatus) {
      this.drawLine(ctx) || // 画线
        // TODO 添加其他元素绘制支持
        this.throwUnsupportError("built-in");
    }

    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private drawLine(ctx: CanvasRenderingContext2D): boolean {
    if (this.canvasElement instanceof Line) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.canvasElement.borderColor.hex;
      ctx.moveTo(
        this.canvasElement.startPoint.X,
        this.canvasElement.startPoint.Y
      );
      ctx.lineTo(this.canvasElement.endPoint.X, this.canvasElement.endPoint.Y);
      ctx.stroke();
      return true;
    }
    return false;
  }
}

export abstract class CustomPainter extends PainterBase {
  /**4
   * 向指定的可绘制对象绘制内容
   *
   * @param data 指定要绘制的可绘制的对象，它可以是一个 Canvas 上下文对象，也可以是一个 ImageData 及其衍生类
   */
  drawTo(data: CanvasRenderingContext2D | ImageData): ImageData {
    if (data instanceof CanvasRenderingContext2D) {
      data = data.getImageData(0, 0, data.canvas.width, data.canvas.height);
    }
    // 通过像素绘制方法重绘画布数据
    return this.drawByPixels(data as ImageDataEx);
  }
}

class DDAPainter extends CustomPainter {
  protected drawByPixels(imageData: ImageDataEx): ImageData {
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
      return imageData;
    }
    return this.throwUnsupportError("dda");
  }
}
