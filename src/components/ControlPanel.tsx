import { createStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid, IconButton, makeStyles, Theme, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { autorun } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { CanvasStateWrapper } from "./Canvas/CanvasState";
import { BasalAttributeFormControl } from "./ControlPanel/BasalAttributeFormControl/BasalAttributeFormControl";
import PanelState from "./ControlPanel/PanelState";

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    controlPanel: {
      boxShadow: theme.shadows[3]
    }
  })
);

const panelState = new PanelState();

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

const ControlPanel = observer<React.FC<CanvasStateWrapper>>(props => {
  const handleChange = (panel: string) => (
    event: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    panelState.currentSelectedSubPanelId = isExpanded ? panel : "";
  };

  return (
    <Grid
      container
      item
      direction="column"
      justify="flex-start"
      alignItems="stretch"
    >
      <Grid item>
        <ExpansionPanel
          expanded={panelState.currentSelectedSubPanelId === "subPanel0"}
          onChange={handleChange("subPanel0")}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>基本</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <BasalAttributeFormControl
              canvasState={props.stateInstance}
              panelState={panelState}
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
      <Grid item>
        <ExpansionPanel
          expanded={panelState.currentSelectedSubPanelId === "subPanel1"}
          onChange={handleChange("subPanel1")}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>元素属性</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ElementArguments />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    </Grid>
  );
});

export default ControlPanel;

autorun(() => {
  console.log({ ...panelState });
});
