import { Grid } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { observable } from "mobx";
import { Provider } from "mobx-react";
import React from "react";
import { Canvas } from "./components/Canvas/Canvas";
import CanvasState from "./components/Canvas/CanvasState";
import ControlPanel from "./components/ControlPanel";
import MenuBar from "./components/MenuBar";
import "./iconfont.css";
import theme from "./Theme";

const state = observable(new CanvasState());

const App: React.FC = () => {
  return (
    <Provider {...state}>
      <ThemeProvider theme={theme}>
        <MenuBar />
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="flex-start"
        >
          <Grid item>
            {" "}
            <Canvas stateInstance={state} />
          </Grid>
          <Grid container item lg={6}>
            <ControlPanel stateInstance={state} />
          </Grid>
        </Grid>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
