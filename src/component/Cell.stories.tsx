import {CellView} from "./Cell";
import {Player} from "../model";
import React from "react";

import "../app.scss";
import {action} from "@storybook/addon-actions";
import {Cell, createBoard, ground, obstacle} from "../model/board";
import {bowerBase} from "../fixtures";
import {AdventureProvider} from "../state";
import {Adventure} from "../model/Adventure";

export function disabled() {
    const cell = new Cell(6,9, obstacle);

    return <CellView cell={cell} />
}

export function selected() {
    const cell = new Cell(6,9, ground);
    const player = new Player("Karli");
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
    const adventure = new Adventure(createBoard(1,1));
    const karli = new Player("karli");
    adventure.players.push(karli);
    adventure.board.getCell(0,0).unit = karli.addUnit(bowerBase);
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