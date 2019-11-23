import { createStyles, makeStyles, Theme } from "@material-ui/core";

export const useSelectsStyles = makeStyles<Theme>((theme: Theme) => createStyles({
    root: {
        minWidth: "6rem"
    },
    medium: {
        minWidth: "5rem"
    }
}));

