import { AlgorithmType } from "../../algorithms/Algorithm";
import LineAlgorithm from "../../algorithms/lines/LineAlgorithm";
import Point from "../../models/Point";
import CanvasCommonHandler from "./CanvasCommonHandler";

/**
 * 多边形公用鼠标处理器
 *
 * 多边形的绘制交互逻辑如下：
 * - 单击确定起始点
 * - 移动反复绘制预览绘画
 * - 再次单击确定下一个点，绘制两点的直线
 * - 循环往复，直到用户右键或者点击起始点（存在误差判定机制），此时闭合路径，并以算法指定颜色填充，这时做出提交变更
 */
export class PolygonCommonHandler extends CanvasCommonHandler {
  readonly operateType = "polygon";
  readonly supportedAlgorithmTypes = ["DDA", "Bresenham"] as AlgorithmType[];

  protected mouseUpHandler = (event: MouseEvent) => {
    const lineAlgorithm = this.getAlgorithm() as LineAlgorithm;
    switch (event.button) {
      // 左键
      case 0:
        // 用户点击起始点闭合多边形的工作
        if (
          lineAlgorithm.points.length > 0 &&
          new Point(event.offsetX, event.offsetY).measureDistance(
            lineAlgorithm.points[0]
          ) < 5
        ) {
          lineAlgorithm.stopWork();
          this.draw();
          lineAlgorithm.reset();
          return;
        }
        lineAlgorithm.startWork();
        lineAlgorithm.addPoint(new Point(event.offsetX, event.offsetY));
        break;
      // 中键
      case 1:
        break;
      // 右键
      case 2:
        lineAlgorithm.stopWork();
        this.draw();
        lineAlgorithm.reset();
        break;
      default:
        break;
    }
  };

  protected mouseMoveHandler = (event: MouseEvent) => {
    this.drawAnimateFrame(new Point(event.offsetX, event.offsetY));
  };

  protected drawAnimateFrame = (currentPoint: Point) => {
    const lineAlgorithm = this.getAlgorithm() as LineAlgorithm;
    if (lineAlgorithm.working) {
      lineAlgorithm.addPoint(currentPoint);
      this.drawOneFrame();
      lineAlgorithm.popPoint();
    }
  };
}
