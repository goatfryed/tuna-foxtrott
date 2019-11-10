import {useAppStore} from "../state";
import {useObserver} from "mobx-react-lite";
import {ControlledCell} from "./Cell";
import React, {useLayoutEffect, useMemo, useRef} from "react";
import {AppStore} from "../model";

export function Board() {

    const appStore = useAppStore();

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
           onKeyPress={useDocumentWideKeyPressHandler(appStore)}
        >
                <div ref={board} className="board">
                {appStore.board.map((row, y) => <div key={y} className="row">
                    {row.map(cell => <ControlledCell key={cell.x} cell={cell}/>)}
                </div>)}
            </div>
        </div>
    )
}

type AnyKeyBoardEvent = React.KeyboardEvent | KeyboardEvent;

type StoreAwareKeyboardEventHandler = (appStore: AppStore, event: AnyKeyBoardEvent) => void;

function alertHandler(appStore: AppStore, event: AnyKeyBoardEvent) {
    if (event.key !== "s") {
        return;
    }
    if (appStore.activeUnit === null || appStore.activeUnit.player !== appStore.currentPlayer) {
        return;
    }
    alert("Hey, " + appStore.name);
}

const tapThroughSelectionHandler = (appStore: AppStore, event: AnyKeyBoardEvent) => {
    if (event.key === "d") {
        switchActiveUnit(appStore,+1);
    }
    if (event.key === "a") {
        switchActiveUnit(appStore,-1);
    }
};

const keyPressHandlers: StoreAwareKeyboardEventHandler[] = [
    alertHandler,
    tapThroughSelectionHandler
];

function switchActiveUnit(appState: AppStore, direction: number) {
    if (appState.currentPlayer !== null && appState.currentPlayer.units.length > 0) {
        const nextIndex = appState.activeUnit !== null ?
            //ensure 0 to length -1
            (appState.currentPlayer.units.indexOf(appState.activeUnit) + appState.currentPlayer.units.length + direction) % appState.currentPlayer.units.length
            : 0;
        appState.activeUnit = appState.currentPlayer.units[nextIndex];
    }
}

export function useDocumentWideKeyPressHandler(appStore: AppStore) {
    const handler = useKeyPressHandler(appStore);

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

export function useKeyPressHandler(appStore: AppStore) {
    return useMemo(
        () => {
            const boundHandlers = keyPressHandlers.map(
                f => ((event: AnyKeyBoardEvent) => {f.apply(null, [appStore, event])})
            );
            return (event: AnyKeyBoardEvent) => {
                for (const handler of boundHandlers) {
                    handler(event);
                    if (!event.bubbles) break;
                }
            }
        }
        ,[appStore, keyPressHandlers]
    )
}