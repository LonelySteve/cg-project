import { Grid, makeStyles, Paper } from "@material-ui/core";
import React, { useState } from "react";
import Algorithm, { AlgorithmType } from "../../core/algorithms/Algorithm";
import AreaEightNeighborContactSeedFill from "../../core/algorithms/fill/AreaEightNeighborContactSeedFill";
import AreaFourNeighborContactSeedFill from "../../core/algorithms/fill/AreaFourNeighborContactSeedFill";
import ScanLineSeedFill from "../../core/algorithms/fill/ScanLineSeedFill";
import ImageInternalAlgorithm from "../../core/algorithms/image/ImageInternalAlgorithm";
import Bresenham from "../../core/algorithms/lines/Bresenham";
import DDA from "../../core/algorithms/lines/DDA";
import { IHasBorderColor } from "../../core/algorithms/lines/LineAlgorithm";
import Color from "../../core/models/Color";
import { RoundModeType } from "../../core/models/Size";
import CanvasCommonHandler, { OperateType } from "../../core/utils/commonHandler/CanvasCommonHandler";
import FillCommonHandler from "../../core/utils/commonHandler/FillCommonHandler";
import ImageCommonHandler from "../../core/utils/commonHandler/ImageCommonHandler";
import { PolygonCommonHandler } from "../../core/utils/commonHandler/PolygonCommonHandler";
import { CanvasArea, CanvasSize } from "./CanvasArea";
import { CanvasController } from "./CanvasController";
import { ColorType } from "./ColorToggleButtonGroup";

const useStyles = makeStyles(theme => ({
  canvasController: {
    margin: theme.spacing(1.5, 0)
  }
}));

// ========================================================================
// 缓存区，整个应用每种 commonHandler，algorithm 在内存中只保存一个对象
// ========================================================================

const canvasCommonHandlerCache: {
  [index in OperateType]:
    | PolygonCommonHandler
    | FillCommonHandler
    | ImageCommonHandler
    | null;
} = {
  polygon: new PolygonCommonHandler(),
  fill: new FillCommonHandler(),
  image: new ImageCommonHandler()
};

export const algorithmCache: { [index in AlgorithmType]: any } = {
  DDA: new DDA(),
  Bresenham: new Bresenham(),
  AreaFourNeighborContactSeedFill: new AreaFourNeighborContactSeedFill(),
  AreaEightNeighborContactSeedFill: new AreaEightNeighborContactSeedFill(),
  ScanLineSeedFill: new ScanLineSeedFill(),
  _InternalImage: new ImageInternalAlgorithm()
};

// ========================================================================
// 安全获取缓存对象的方法
// ========================================================================

const getCommonHandlerInstance = (
  operate: OperateType,
  oldCommonHandlerInstance?: CanvasCommonHandler
): CanvasCommonHandler => {
  // 当旧的 commonHandler 与请求的操作一致，直接返回旧 commonHandler
  if (
    oldCommonHandlerInstance &&
    oldCommonHandlerInstance.operateType === operate
  ) {
    return oldCommonHandlerInstance;
  }

  const canvasCommonHandler: CanvasCommonHandler | null =
    canvasCommonHandlerCache[operate];

  if (canvasCommonHandler === undefined) {
    throw new Error(`${operate} 操作不存在啊！`);
  }

  if (canvasCommonHandler === null) {
    throw new Error(
      `"嗯，我想这个愚蠢的开发者应该勤奋一点，把 ${operate} 操作所需要的公用处理器功能加上！`
    );
  }

  if (canvasCommonHandler.operateType === undefined) {
    throw new Error(
      "愚蠢的开发者，您貌似忘了给传入的公用处理器添加类型信息哦！"
    );
  }

  // 判断一下新的 commonHandler 是否有支持的算法
  if (canvasCommonHandler.supportedAlgorithmTypes[0] === undefined) {
    throw new Error(`我想，${operate} 操作没有你想要的算法！`);
  }
  // 如果 commonHandler 没有绑定算法，就给它绑一个
  try {
    canvasCommonHandler.getAlgorithm();
  } catch (error) {
    const firstSupportedAlgorithm = getAlgorithm(
      canvasCommonHandler.supportedAlgorithmTypes[0]
    ); // 默认情况下取第一个支持的算法
    canvasCommonHandler.setAlgorithm(firstSupportedAlgorithm);
  }

  if (oldCommonHandlerInstance === undefined) {
    return canvasCommonHandler;
  }
  // 共享 commonHandler 间的数据
  canvasCommonHandler.setCanvasRef(oldCommonHandlerInstance.getCanvasRef());
  canvasCommonHandler.imageData = oldCommonHandlerInstance.imageData;

  // 对旧的处理器的资源进行管理

  // 关闭旧处理器的 Picker
  oldCommonHandlerInstance.picker.disable();

  return canvasCommonHandler;
};

const getAlgorithm = (
  algorithmType: AlgorithmType,
  oldAlgorithm?: Algorithm
) => {
  const algorithm = algorithmCache[algorithmType] as Algorithm;
  if (algorithm.algorithmType === undefined) {
    throw new Error(
      "愚蠢的开发者，您貌似忘了给传入的公用处理器的算法添加类型信息哦！"
    );
  }
  if (oldAlgorithm === undefined) {
    return algorithm;
  }
  // 共享 algorithm 间的数据
  algorithm.onWorkingChanged = oldAlgorithm.onWorkingChanged;
  return algorithm;
};

export type JCanvasProps = CanvasSize & { operate?: OperateType };

export const JCanvas: React.FC<JCanvasProps> = props => {
  const classes = useStyles();
  const canvasRef = React.createRef<HTMLCanvasElement>();

  const operate: OperateType = props.operate || "polygon";

  // ============================================================================
  // 状态声明
  // ============================================================================

  const [operateType, setOperateType] = useState<OperateType>(operate);

  const [commonHandler, setCommonHandler] = useState<CanvasCommonHandler>(
    getCommonHandlerInstance(operateType)
  );

  const algorithm = commonHandler.getAlgorithm();

  const [algorithmWorking, setAlgorithmWorking] = useState<boolean>(
    algorithm.working
  );

  if (algorithm.algorithmType === undefined) {
    throw new Error("当前算法未指定其类型！");
  }

  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>(
    algorithm.algorithmType
  );

  // 可能为空的各种状态量
  const [borderColor, setBorderColor] = useState<Color | undefined | null>(
    ((algorithm as unknown) as IHasBorderColor).borderColor || null
  );
  const [fillColor, setFillColor] = useState<Color | undefined | null>(
    (algorithm as any).fillColor || null
  );

  const [pickerColorType, setPickerColorType] = useState<
    ColorType | undefined | null
  >();

  const [roundMode, setRoundMode] = useState<RoundModeType | undefined | null>(
    (algorithm as DDA).roundNumberModeType
  );

  // 给 commonHandler 绑定 canvas 应用
  commonHandler.setCanvasRef(canvasRef);
  // 不要忘了给这个算法加上回调，保证每次第一次使用新操作时，algorithmWorking 状态正确指示
  algorithm.setWorkingChangedHandler(setAlgorithmWorking);

  const updateUI = (algorithm: Algorithm) => {
    const a = algorithm as any;
    switch (a.algorithmType) {
      case "DDA":
        setBorderColor(a.borderColor);
        setFillColor(null);
        setRoundMode(a.roundNumberModeType);
        break;
      case "Bresenham":
        setBorderColor(a.borderColor);
        setFillColor(null);
        setRoundMode(null);
        break;
      case "AreaFourNeighborContactSeedFill":
      case "AreaEightNeighborContactSeedFill":
      case "ScanLineSeedFill":
        setBorderColor(a.borderColor);
        setFillColor(a.fillColor);
        setRoundMode(null);
        setPickerColorType(undefined);
        break;
      case "_InternalImage":
        setBorderColor(null);
        setFillColor(null);
        setRoundMode(null);
        setPickerColorType(null);
        break;
      default:
        break;
    }
    algorithm.algorithmType && setAlgorithmType(algorithm.algorithmType);
  };
  return (
    <Grid container direction="column" justify="flex-start" alignItems="center">
      <Grid item className={classes.canvasController}>
        <CanvasController
          canvasCommonHandler={commonHandler}
          operateType={operateType}
          algorithmType={algorithmType}
          algorithmWorking={algorithmWorking}
          borderColor={borderColor}
          fillColor={fillColor}
          roundMode={roundMode}
          pickerColorType={pickerColorType}
          onOperateChanged={value => {
            const newCommonHandler = getCommonHandlerInstance(
              value,
              commonHandler
            );
            const newAlgorithm = newCommonHandler.getAlgorithm();
            algorithm.setWorkingChangedHandler(setAlgorithmWorking);
            updateUI(newAlgorithm);
            setCommonHandler(newCommonHandler);
            setOperateType(value as OperateType);
          }}
          onAlgorithmTypeChanged={value => {
            const newAlgorithmType = value as AlgorithmType;
            const newAlgorithm = getAlgorithm(newAlgorithmType, algorithm);
            commonHandler.setAlgorithm(newAlgorithm);
            updateUI(newAlgorithm);
          }}
          onBorderColorChanged={value => {
            (algorithm as any).borderColor = value;
            setBorderColor(value);
          }}
          onFillColorChanged={value => {
            (algorithm as any).fillColor = value;
            setFillColor(value);
          }}
          onRoundMode={value => {
            (algorithm as any).roundNumberModeType = value;
            setRoundMode(value);
          }}
          onPickerColorType={value => {
            commonHandler.picker.colorType = pickerColorType || undefined;
            if (value) {
              commonHandler.picker.enable();
            } else {
              commonHandler.picker.disable();
            }
            setPickerColorType(value);
          }}
        />
      </Grid>

      <Grid item>
        <Paper>
          <CanvasArea
            ref={canvasRef}
            {...(props as CanvasSize)}
            commonHandler={commonHandler}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};
