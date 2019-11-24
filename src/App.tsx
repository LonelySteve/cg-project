import { Grid } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { configure, observable } from "mobx";
import { Provider } from "mobx-react";
import React from "react";
import { Canvas } from "./components/Canvas/Canvas";
import MenuBar from "./components/MenuBar";
import OptionsPanel from "./components/OptionsPanel";
import "./iconfont.css";
import CanvasStore from "./stores/CanvasStore";
import ControlPanelStore from "./stores/ControlPanelStore";
import theme from "./Theme";
// Mobx 配置加载
configure({
  enforceActions: "strict"
});

const canvasStates = observable(new CanvasStore());
const controlPanelStates = observable(new ControlPanelStore());

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <MenuBar />
      <Grid container direction="row" justify="center" alignItems="flex-start">
        <Provider {...canvasStates}>
          <Grid item>
            <Canvas />
          </Grid>
          <Grid container item lg={6}>
            <Provider {...controlPanelStates}>
              <OptionsPanel />
            </Provider>
          </Grid>
        </Provider>
      </Grid>
    </ThemeProvider>
  );
};

export default App;
