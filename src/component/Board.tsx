import {useObserver} from "mobx-react-lite";
import {ControlledCell} from "./Cell";
import React, {useLayoutEffect, useMemo, useRef} from "react";
import {Adventure, AdventureAware} from "../model/Adventure";

export function Board({adventure}: AdventureAware) {

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

    return useObserver(
        () => <div ref={viewport} className="board-viewport"
           onKeyPress={useDocumentWideAdventureKeyPressHandler(adventure)}
        >
                <div ref={board} className="board">
                {adventure.board.map((row, y) => <div key={y} className="row">
                    {row.map(cell => <ControlledCell key={cell.x} cell={cell}/>)}
                </div>)}
            </div>
        </div>
    )
}

type AnyKeyBoardEvent = React.KeyboardEvent | KeyboardEvent;

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

function useDocumentWideAdventureKeyPressHandler(adventure: Adventure) {
    const handler = useAdventureKeyPressHandler(adventure);

    useLayoutEffect(
        () => {
            const noTargetHandler = (event: AnyKeyBoardEvent) => {
                if (event.target === document.body) {
                    handler(event);
                }
            };
            document.addEventListener("keypress", noTargetHandler);
            return () => document.removeEventListener("keypress", noTargetHandler);
        },
        [handler]
    );

    return handler;
}

function useAdventureKeyPressHandler(adventure: Adventure) {
    return useMemo(
        () => {
            const boundHandlers = keyPressHandlers.map(
                f => ((event: AnyKeyBoardEvent) => {f.apply(null, [adventure, event])})
            );
            return (event: AnyKeyBoardEvent) => {
                for (const handler of boundHandlers) {
                    handler(event);
                    if (!event.bubbles) break;
                }
            }
        }
        ,[adventure, keyPressHandlers]
    )
}