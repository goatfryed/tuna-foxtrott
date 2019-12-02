import {CellView} from "./Cell";
import {Player} from "../model";
import React from "react";
import {storiesOf} from "@storybook/react";

import "../app.scss";
import {action} from "@storybook/addon-actions";
import {Cell, ground, obstacle} from "../model/board";
import {bowerBase} from "../fixtures";

export function disabled() {
    const cell = new Cell(6,9, obstacle);

    return <CellView
        cell={cell}
        actionLabel={null}
    />
}

export function selected() {
    const cell = new Cell(6,9, ground);
    const player = new Player("Karli");
    cell.unit = player.addUnit(bowerBase);

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