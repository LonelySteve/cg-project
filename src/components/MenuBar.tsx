import { AppBar, Toolbar, Typography } from "@material-ui/core";
import React from "react";

const MenuBar: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h4" component='p'>CG-Project</Typography>
            </Toolbar>
        </AppBar >
    );
}

export default MenuBar;