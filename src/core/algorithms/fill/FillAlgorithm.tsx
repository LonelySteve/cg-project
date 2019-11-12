import Color from "../../models/Color";
import Point from "../../models/Point";
import { IHasBorderColor } from "../lines/LineAlgorithm";
import StackAlgorithm from "../StackAlgorithm";

export interface IHasFillColor {
  fillColor: Color;
}

export function instanceOfHasFillColor(object: any): object is IHasFillColor {
  return "fillColor" in object;
}

export default abstract class FillAlgorithm extends StackAlgorithm
  implements IHasBorderColor, IHasFillColor {
  seedPoint?: Point;
  borderColor: Color = Color.black;
  fillColor: Color = Color.black;

  setBorderColor(color: Color) {
    this.borderColor = color;
    return this;
  }

  setFillColor(color: Color) {
    this.fillColor = color;
    return this;
  }

  setSeedPoint(seedPoint: Point) {
    this.seedPoint = seedPoint;
    return this;
  }

  reset(): void {
    this.seedPoint = undefined;
    this.points = [];
  }
}
