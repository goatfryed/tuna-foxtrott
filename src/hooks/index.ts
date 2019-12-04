import React, {useLayoutEffect} from "react";

export type AnyKeyBoardEvent = React.KeyboardEvent | KeyboardEvent;

export function useDocumentKeyDownHandler(handler: (event: AnyKeyBoardEvent) => void, capturePhase = false) {
    useLayoutEffect(
        () => {
            if (handler) {
                function noTargetHandler(event: AnyKeyBoardEvent) {
                    if (event.target === document.body) {
                        handler(event);
                    }
                }

                document.addEventListener("keydown", noTargetHandler, capturePhase);
                return () => document.removeEventListener("keydown", noTargetHandler, capturePhase);
            }
        },
        [handler]
    )
}