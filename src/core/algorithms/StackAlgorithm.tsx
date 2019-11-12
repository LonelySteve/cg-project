import Point from "../models/Point";
import Algorithm from "./Algorithm";

export default abstract class StackAlgorithm extends Algorithm {
  public points: Point[] = [];

  addPoint(point: Point) {
    this.points.push(point);
    return this;
  }

  addPoints(points: Point[]) {
    this.points = this.points.concat(points);
    return this;
  }

  popPoint() {
    return this.points.pop();
  }

  clearPoints() {
    this.points = [];
  }

  reset() {
    this.points = [];
  }
}
