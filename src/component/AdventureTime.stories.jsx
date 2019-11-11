import {AdventureView} from "./AdventureTime";
import React from "react";
import {AppContextProvider} from "../state";
import {AppContext, Player} from "../model";
import {createThugTown} from "../adventure/ThugTown";
import {action} from "@storybook/addon-actions";
import {boolean, withKnobs} from "@storybook/addon-knobs";

const user = new Player("Karli");
const appContext = new AppContext(user);
const axel = user.addUnit({name: "axel"});
const bower = user.addUnit({name: "bower"});
const macel = user.addUnit({name: "macel"});

export default {
    title: "Adventuring",
    component: AdventureView,
    decorators: [
        withKnobs,
        Story => <AppContextProvider context={appContext}><Story /></AppContextProvider>,
    ],
    parameters: {
        enableShortcuts: false,
    }
}

export function thugTown() {
    const thugTownAdventure = createThugTown(user);
    user.units.forEach(u => thugTownAdventure.heroes.push(u));

    axel.cell = thugTownAdventure.board[0][0];
    bower.cell = thugTownAdventure.board[1][0];
    macel.cell = thugTownAdventure.board[2][0];

    return <AdventureView
        adventure={thugTownAdventure}
        onSurrender={action("onSurrender")}
        isIsometric={boolean("Isometric", false)}
    />
}