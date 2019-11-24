import { createStyles, Grid, IconButton, makeStyles, Theme } from "@material-ui/core";
import { inject, observer } from "mobx-react";
import React from "react";

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    controlPanel: {
      boxShadow: theme.shadows[3]
    }
  })
);

const ColorPickerButtonGroup = observer<
  React.FC<{ enableFillColor: boolean; enableBorderColor: boolean }>
>(props => {
  return (
    <Grid container item spacing={1}>
      <Grid item>
        <IconButton style={{ backgroundColor: "#66ccff" }} />
      </Grid>
      <Grid item>
        <IconButton style={{ backgroundColor: "#66ccff" }} />
      </Grid>
    </Grid>
  );
});

 

const ElementArguments = observer<React.FC>(() => {
  return <ColorPickerButtonGroup enableFillColor enableBorderColor />;
});

const OptionsPanel = inject(
  "canvasStates",
  "panelStates"
)(
  observer<React.FC>(props => {
    
    return null;
  })
);

export default OptionsPanel;