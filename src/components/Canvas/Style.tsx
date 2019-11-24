import { createStyles, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

export const useDividerStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    Ysmall: {
      height: "20px"
    },
    Ynormal: {
      height: "40px"
    },
    Ybig: {
      height: "80px"
    },
    Xsmall: {
      width: "20px"
    },
    Xnormal: {
      width: "40px"
    },
    Xbig: {
      width: "80px"
    }
  })
);

export const useWidthStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    minSmall: {
      minWidth: "3rem"
    },
    minNormal: {
      minWidth: "5rem"
    },
    minBig: {
      minWidth: "8rem"
    },
    maxSmall: {
      maxWidth: "3rem"
    },
    maxNormal: {
      maxWidth: "5rem"
    },
    maxBig: {
      maxWidth: "8rem"
    }
  })
);
