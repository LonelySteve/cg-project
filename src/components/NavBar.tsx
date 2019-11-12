import { AppBar, Button, makeStyles, Toolbar, Typography } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  }
}));
/**
 * 标题栏
 */
export const NavBar: React.FC = () => {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          CG-Project
        </Typography>
        <Button color="inherit" variant="text">
          使用说明
        </Button>
        <Button color="inherit" variant="text">
          关于
        </Button>
      </Toolbar>
    </AppBar>
  );
};
