import { AlgorithmType } from "../../algorithms/Algorithm";
import AreaFourNeighborContactSeedFill from "../../algorithms/fill/AreaFourNeighborContactSeedFill";
import Point from "../../models/Point";
import CanvasCommonHandler from "./CanvasCommonHandler";

export default class FillCommonHandler extends CanvasCommonHandler {
  readonly operateType = "fill";
  readonly supportedAlgorithmTypes = [
    "AreaFourNeighborContactSeedFill",
    "AreaEightNeighborContactSeedFill",
    "ScanLineSeedFill"
  ] as AlgorithmType[];

  protected mouseUpHandler = (event: MouseEvent) => {
    if (this.picker.isShow) {
      return;
    }
    const algorithm = this.getAlgorithm() as AreaFourNeighborContactSeedFill;
    algorithm
      .startWork()
      .setSeedPoint(new Point(event.offsetX, event.offsetY))
      .stopWork();
    this.draw();
  };
}
