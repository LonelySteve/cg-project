import { Container } from "@material-ui/core";
import React from "react";
import { NavBar } from "./components/NavBar";
import { JCanvas } from "./components/Canvas/JCanvas";

const App: React.FC = () => {
  return (
    <div>
      <NavBar />
      <Container>
        <JCanvas width={800} height={800}></JCanvas>
      </Container>
    </div>
  );
};

export default App;
