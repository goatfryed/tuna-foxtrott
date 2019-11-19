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
    if (adventure.activeUnit === null) {
        return;
    }
    alert("Hey, " + adventure.activeUnit.name);
}

function endTurnHandler(adventure: Adventure, event: AnyKeyBoardEvent) {
    if (event.key !== " ") {
        return;
    }
    adventure.endTurn();
}

const keyPressHandlers: StoreAwareKeyboardEventHandler[] = [
    alertHandler,
    endTurnHandler,
];

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

