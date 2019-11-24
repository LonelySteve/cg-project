import { Grid } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { autorun, observable } from "mobx";
import { Provider } from "mobx-react";
import React from "react";
import { Canvas } from "./components/Canvas/Canvas";
import MenuBar from "./components/MenuBar";
import "./iconfont.css";
import CanvasStore from "./stores/CanvasStore";
import theme from "./Theme";
// // Mobx 配置加载
// configure({
//   enforceActions: "strict"
// });

const canvasStates = observable(new CanvasStore());

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <MenuBar />
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <Provider canvasStates>
            <Canvas />
          </Provider>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

autorun(() => {
  console.log({ ...canvasStates });
});

export default App;
