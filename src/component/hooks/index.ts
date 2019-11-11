import React, {useLayoutEffect} from "react";

export type AnyKeyBoardEvent = React.KeyboardEvent | KeyboardEvent;

export function useDocumentKeyPressHandler(handler: (event: AnyKeyBoardEvent) => void) {
    useLayoutEffect(
        () => {
            if (handler) {
                function noTargetHandler(event: AnyKeyBoardEvent) {
                    if (event.target === document.body) {
                        handler(event);
                    }
                }

                document.addEventListener("keypress", noTargetHandler);
                return () => document.removeEventListener("keypress", noTargetHandler);
            }
        },
        [handler]
    )
}