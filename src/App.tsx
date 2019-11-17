import { Container, createMuiTheme } from '@material-ui/core';
import { createStyles, makeStyles, Theme, ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import DDACanvas from './components/Canvas/DDACanvas';
import MenuBar from './components/MenuBar';
import './iconfont.css';

const theme = createMuiTheme({

});


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1)
    },
    input: {
      display: 'none',
    },
    toolbar: {
      display: 'inline-block'
    },
    logo: {
      verticalAlign: 'center'
    }
  }),
);

function randomNum(minNum: number, maxNum: number) {
  switch (arguments.length) {
    case 1:
      return parseInt((Math.random() * minNum + 1).toString(), 10);
    case 2:
      return parseInt((Math.random() * (maxNum - minNum + 1) + minNum).toString(), 10);
    default:
      return 0;
  }
}

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <MenuBar />
      <Container  >
        <DDACanvas width={500} height={500} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
