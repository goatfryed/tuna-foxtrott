import {CellView, InteractiveCell} from "./Cell";
import {Cell, Player} from "../model";
import React from "react";
import {storiesOf} from "@storybook/react";

import "../app.scss";



export function empty() {
    const cell = new Cell(6,9);

    return <CellView
        cell={cell}
    />
}

export function enemy() {
    const cell = new Cell(6,9);
    const player = new Player("Karli");
    cell.unit = player.addUnit({name: "bower"});

    return <InteractiveCell
        cell={cell}
        primary={{run: () => {}, type: "SELECT"}}
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
    .add("empty", empty)
    .add("enemy", enemy)
;