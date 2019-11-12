import Point from "./Point";
import Size from "./Size";

export default interface Rect {
  origin: Point;
  size: Size;
}

/**
 * 位置
 */
export enum Position {
  /** 左上 */
  leftUp,
  /** 上 */
  up,
  /** 右上*/
  rightUp,
  /** 右 */
  right,
  /** 右下 */
  rightDown,
  /** 下 */
  down,
  /** 左下 */
  leftDown,
  /** 左 */
  left,
  /** 中心 */
  center
}

/**
 * 标准化指定的矩形区域（将负的矩形区域取正，并重新设置 origin 以使其处于左上角）
 * @param rect 指定要标准化的矩形区域
 */
export const standardization = (rect: Rect): Rect => {
  if (rect.size.width > 0) {
    if (rect.size.height > 0) {
      //  rect.origin.addSize(0, 0);
    } else {
      rect.origin.addSize(0, rect.size.height);
    }
  } else {
    if (rect.size.height > 0) {
      rect.origin.addSize(rect.size.width, 0);
    } else {
      rect.origin.addSize(rect.size.width, rect.size.height);
    }
  }
  rect.size.abs();
  return rect;
};
export const copyRect = (rect: Rect): Rect => {
  return { origin: rect.origin.copy(), size: rect.size.copy() };
};

export const getPoint = (rect: Rect, position: Position): Point => {
  // 九个位置，四种象限，共 36 种情况
  const rectTmp = copyRect(rect);
  // 标准化，反正尺寸信息对该函数的实现意义不大，这样做能避免对 36 种情况的枚举
  standardization(rectTmp);

  switch (position) {
    case Position.center:
      return rectTmp.origin
        .copy()
        .addSize(rectTmp.size.width / 2, rectTmp.size.height / 2);
    case Position.leftUp:
      return rectTmp.origin.copy();
    case Position.up:
      return rectTmp.origin.copy().addSize(rectTmp.size.width / 2, 0);
    case Position.rightUp:
      return rectTmp.origin.copy().addSize(rectTmp.size.width, 0);
    case Position.right:
      return rectTmp.origin
        .copy()
        .addSize(rectTmp.size.width - 1, rectTmp.size.height / 2);
    case Position.rightDown:
      return rectTmp.origin
        .copy()
        .addSize(rectTmp.size.width - 1, rectTmp.size.height - 1);
    case Position.down:
      return rectTmp.origin
        .copy()
        .addSize(rectTmp.size.width / 2, rectTmp.size.height - 1);
    case Position.leftDown:
      return rectTmp.origin.copy().addSize(0, rectTmp.size.height - 1);
    case Position.left:
      return rectTmp.origin.copy().addSize(0, rectTmp.size.height / 2);
  }
};

export const getPointPosition = (
  point: Point,
  imageRect: Rect,
  tolerance?: number
) => {
  tolerance = tolerance || 5;
  // 八方向判定
  const upLeftPoint = getPoint(imageRect, Position.leftUp);
  const upRightPoint = getPoint(imageRect, Position.rightUp);
  const rightDownPoint = getPoint(imageRect, Position.rightDown);
  const leftDownPoint = getPoint(imageRect, Position.leftDown);

  const toUp = point.measureDistance(upLeftPoint, upRightPoint) <= tolerance;
  const toLeft = point.measureDistance(upLeftPoint, leftDownPoint) <= tolerance;
  const toRight =
    point.measureDistance(upRightPoint, rightDownPoint) <= tolerance;
  const toDown =
    point.measureDistance(leftDownPoint, rightDownPoint) <= tolerance;

  if (toUp && toLeft) {
    return Position.leftUp;
  }
  if (toUp && toRight) {
    return Position.rightUp;
  }
  if (toDown && toLeft) {
    return Position.leftDown;
  }
  if (toDown && toRight) {
    return Position.rightDown;
  }
  if (toUp) {
    return Position.up;
  }
  if (toLeft) {
    return Position.left;
  }
  if (toRight) {
    return Position.right;
  }
  if (toDown) {
    return Position.down;
  }
};
