import {useObserver} from "mobx-react-lite";
import {CellPresenter} from "./Cell";
import React, {useLayoutEffect, useMemo, useRef} from "react";
import {Adventure} from "../model/Adventure";
import {AnyKeyBoardEvent, useDocumentKeyPressHandler} from "../hooks";
import {useAdventure} from "../state";

export function Board({isIsometric = true}: {isIsometric?: boolean}) {

    const adventure = useAdventure();
    const viewport = useRef<HTMLDivElement>(null);
    const board = useRef<HTMLDivElement>(null);

    useLayoutEffect(
        () => {
            if (board.current !== null && viewport.current !== null) {
                const boundingClientRect = board.current.getBoundingClientRect();
                viewport.current.style.minHeight = String(boundingClientRect.height * 1.1) + "px";
            }
        }
    );

    const boardClass = "board" + (isIsometric ? " isometric" : "");

    return useObserver(
        () => <div ref={viewport} className="board-viewport"
           onKeyPress={useAdventureKeyPressHandler(adventure)}
        >
                <div ref={board} className={boardClass}>
                {adventure.board.map((row, y) => <div key={y} className="row">
                    {row.map(cell => <CellPresenter key={cell.x} cell={cell}/>)}
                </div>)}
            </div>
        </div>
    )
}

type StoreAwareKeyboardEventHandler = (adventure: Adventure, event: AnyKeyBoardEvent) => void;

function alertHandler(adventure: Adventure, event: AnyKeyBoardEvent) {
    if (event.key !== "s") {
        return;
    }
    if (adventure.activeUnit === null || adventure.activeUnit.player !== adventure.currentPlayer) {
        return;
    }
    alert("Hey, " + adventure.name);
}

const tapThroughSelectionHandler = (adventure: Adventure, event: AnyKeyBoardEvent) => {
    if (event.key === "d") {
        switchActiveUnit(adventure,+1);
    }
    if (event.key === "a") {
        switchActiveUnit(adventure,-1);
    }
};

const keyPressHandlers: StoreAwareKeyboardEventHandler[] = [
    alertHandler,
    tapThroughSelectionHandler
];

function switchActiveUnit(adventure: Adventure, direction: number) {
    if (adventure.heroes.length > 0) {
        const nextIndex = adventure.activeUnit !== null ?
            //ensure 0 to length -1
            (adventure.heroes.indexOf(adventure.activeUnit) + adventure.heroes.length + direction) % adventure.heroes.length
            : 0;
        adventure.activeUnit = adventure.heroes[nextIndex];
    }
}

function useAdventureKeyPressHandler(adventure: Adventure) {
    const handler = useMemo(
        () => {
            const boundHandlers = keyPressHandlers.map(
                f => ((event: AnyKeyBoardEvent) => {
                    f.apply(null, [adventure, event])
                })
            );
            return (event: AnyKeyBoardEvent) => {
                for (const handler of boundHandlers) {
                    handler(event);
                    if (!event.bubbles) break;
                }
            }
        }
        , [adventure, keyPressHandlers]
    );
    useDocumentKeyPressHandler(handler);
    return handler;
}

