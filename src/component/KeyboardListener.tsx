import {DependencyList, useLayoutEffect} from "react";
import * as React from "react";

type KeyboardEventListener = (e: KeyboardEvent) => any;

export function useKeyPress<T extends GlobalEventHandlers>(
    listener: KeyboardEventListener | null,
    deps?: DependencyList,
    ref?: React.RefObject<T | null>
) {
    if (deps === undefined) {
        deps = [listener];
    }

    useLayoutEffect(
        () => {
            if (listener) {
                let source: GlobalEventHandlers;
                if (ref) {
                    if (ref.current) {
                        source = ref.current;
                    } else {
                        return;
                    }
                } else {
                    source = document;
                }
                source.addEventListener("keypress", listener);
                return () => document.removeEventListener("keypress", listener);
            }
        },
        deps
    )
}