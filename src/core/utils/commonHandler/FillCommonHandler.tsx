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

  clickHandler: React.MouseEventHandler<HTMLCanvasElement> = event => {
    if (this.picker.isEnable) {
      return;
    }
    const algorithm = this.getAlgorithm() as AreaFourNeighborContactSeedFill;
    algorithm
      .startWork()
      .setSeedPoint(
        new Point(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
      )
      .stopWork();
    this.draw();
  };
}
