import {CellView} from "./Cell";
import {Cell, Player} from "../model";
import React from "react";
import {storiesOf} from "@storybook/react";

import "../app.scss";
import {action} from "@storybook/addon-actions";



export function disabled() {
    const cell = new Cell(6,9);

    return <CellView
        cell={cell}
        actionLabel={null}
    />
}

export function selected() {
    const cell = new Cell(6,9);
    const player = new Player("Karli");
    cell.unit = player.addUnit({name: "bower", baseHealth: 5});

    return <CellView
        cell={cell}
        onClick={action("onClick")}
        style="isSelected"
        actionLabel={null}
    />
}

function decorator(story: any) {
    return <div
        style={{
            padding: "2rem"
        }}
    >{story()}
    </div>
}

storiesOf("CellView", module)
    .addDecorator( decorator)
    .add("selected", selected)
    .add("disabled", disabled)
;