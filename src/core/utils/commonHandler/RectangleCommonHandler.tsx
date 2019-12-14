import { AlgorithmType } from "../../algorithms/Algorithm";
import PolygonAlgorithm from "../../algorithms/lines/PolygonAlgorithm";
import Point from "../../models/Point";
import CanvasCommonHandler from "./CanvasCommonHandler";

export default class RectangleCommonHandler extends CanvasCommonHandler {
  readonly operateType = "rectangle";
  readonly supportedAlgorithmTypes = ["DDA", "Bresenham"] as AlgorithmType[];

  protected firstPoint?: Point;
  protected secondPoint?: Point;

  protected mouseDownHandler = (event: MouseEvent) => {
    this.firstPoint = new Point(event.offsetX, event.offsetY);
  };
  protected mouseUpHandler = (event: MouseEvent) => {
    this.draw();
    this.firstPoint = this.secondPoint = undefined;
    const algorithm = this.getAlgorithm() as PolygonAlgorithm;
    algorithm.reset(); // 记得画完清空多边形算法，因为多边形算法会用到相同的算法对象
  };
  protected mouseMoveHandler = (event: MouseEvent) => {
    if (this.firstPoint === undefined) return;

    this.secondPoint = new Point(event.offsetX, event.offsetY);
    this.drawAnimateFrame();
  };

  protected drawAnimateFrame = () => {
    if (this.firstPoint === undefined) return;
    if (this.secondPoint === undefined) return;

    const algorithm = this.getAlgorithm() as PolygonAlgorithm;

    algorithm.reset();

    algorithm.addPoint(this.firstPoint.copy());
    algorithm.addPoint(
      this.firstPoint.copy().addSize(this.secondPoint.X - this.firstPoint.X, 0)
    );
    algorithm.addPoint(this.secondPoint.copy());
    algorithm.addPoint(
      this.firstPoint.copy().addSize(0, this.secondPoint.Y - this.firstPoint.Y)
    );

    this.drawOneFrame();
  };
}
