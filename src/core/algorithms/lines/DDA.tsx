import Point from "../../models/Point";
import Size, { RoundModeType } from "../../models/Size";
import { AlgorithmType } from "../Algorithm";
import LineAlgorithm from "./LineAlgorithm";

export default class DDA extends LineAlgorithm {
  readonly algorithmType: AlgorithmType = "DDA";

  roundNumberModeType: RoundModeType = "ceil";

  setRoundNumberModeType(roundModeType: RoundModeType) {
    this.roundNumberModeType = roundModeType;
  }

  protected lineTwoPoints(startPoint: Point, endPoint: Point) {
    const drawPoints = new Array<Point>();

    const dp = Size.sub(endPoint.toSize(), startPoint.toSize());
    const dpAbs = Size.abs(dp);

    const steps: number =
      dpAbs.width > dpAbs.height ? dpAbs.width : dpAbs.height;

    const incrSize = new Size(dp.width / steps, dp.height / steps);

    let x = startPoint.X;
    let y = startPoint.Y;

    drawPoints.push(new Point(x, y).round(this.roundNumberModeType));

    for (let i = 0; i < steps; i++) {
      x += incrSize.width;
      y += incrSize.height;

      drawPoints.push(new Point(x, y).round(this.roundNumberModeType));
    }

    return drawPoints;
  }
}
