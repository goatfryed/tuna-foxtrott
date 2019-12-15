import {CellView} from "./Cell";
import {IngamePlayer} from "../model";
import React from "react";

import "../app.scss";
import {action} from "@storybook/addon-actions";
import {Cell, createBoard, ground, OBSTACLE} from "../model/board";
import {bowerBase, exampleUserPlayer} from "../fixtures";
import {AdventureProvider} from "../state";
import {Adventure} from "../model/Adventure";

export function disabled() {
    const cell = new Cell(6,9, OBSTACLE);

    return <CellView cell={cell} />
}

export function selected() {
    const cell = new Cell(6,9, ground);
    const player = new IngamePlayer("Karli");
    cell.unit = player.addUnit(bowerBase);
    cell.unit.dealHealthDamage( 2);
    cell.unit.updateStamina(-3);

    return <CellView
        cell={cell}
        onClick={action("onClick")}
        onRightClick={action("rightClick")}
        style="isSelected"
    />
}

const dummyAdventure = (()=>{
    const adventure = new Adventure(exampleUserPlayer,createBoard(1,1));
    adventure.board.getCell(0,0).unit = exampleUserPlayer.addUnit(bowerBase);
    adventure.setup();

    return adventure;
})();

function decorator(story: any) {


    return <AdventureProvider adventure={dummyAdventure}><div
        style={{
            padding: "2rem"
        }}
    >{story()}
    </div></AdventureProvider>
}

export default {
    title: "Cell View",
    decorators: [
        decorator
    ],
}