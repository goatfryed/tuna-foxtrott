import {CellView} from "./Cell";
import {Cell} from "../model";
import React from "react";
import {action} from "@storybook/addon-actions";
import {storiesOf} from "@storybook/react";

import "../app.scss";

const cell = new Cell(6,9);

export function empty() {
    return <CellView
        cell={cell}
    />
}

export function enemy() {
    return <CellView
        cell={cell}
        onClick={action("onClick")}
        type={3}
    />
}

function decorator(story) {
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