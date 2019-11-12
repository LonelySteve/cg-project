import Point from "../../models/Point";
import LineAlgorithm from "./LineAlgorithm";

export default class Bresenham extends LineAlgorithm {
  readonly algorithmType = "Bresenham";

  protected lineTwoPoints(startPoint: Point, endPoint: Point) {
    const drawPoints = new Array<Point>();

    let x, y, dx, dy, s1, s2, p, temp, interchange, i: number;

    x = startPoint.X;
    y = startPoint.Y;

    dx = Math.abs(endPoint.X - startPoint.X);
    dy = Math.abs(endPoint.Y - startPoint.Y);

    if (endPoint.X > startPoint.X) {
      s1 = 1;
    } else {
      s1 = -1;
    }

    if (endPoint.Y > startPoint.Y) {
      s2 = 1;
    } else {
      s2 = -1;
    }

    if (dy > dx) {
      temp = dx;
      dx = dy;
      dy = temp;
      interchange = 1;
    } else interchange = 0;

    p = 2 * dy - dx;
    for (i = 1; i <= dx; i++) {
      drawPoints.push(new Point(x, y));
      if (p >= 0) {
        if (interchange === 0) y = y + s2;
        else x = x + s1;
        p = p - 2 * dx;
      }
      if (interchange === 0) x = x + s1;
      else y = y + s2;
      p = p + 2 * dy;
    }
    return drawPoints;
  }
}
