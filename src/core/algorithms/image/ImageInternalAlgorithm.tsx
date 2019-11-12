import ImageDataEx from "../../models/ImageDataEx";
import { AlgorithmType } from "../Algorithm";
import ImageAlgorithm from "./ImageAlgorithm";

export default class ImageInternalAlgorithm extends ImageAlgorithm {
  readonly algorithmType: AlgorithmType = "_InternalImage";

  updateImageData(imageData: ImageDataEx) {
    if (this.image) {
      const ctx = this.getCtx();

      const rect = this.getWorkingImageRect();

      ctx.drawImage(
        this.getImage(),
        rect.origin.X,
        rect.origin.Y,
        rect.size.width,
        rect.size.height
      );

      return ImageDataEx.fromImageData(
        ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
        true
      );
    }
    return imageData;
  }
}
