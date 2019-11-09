import {DependencyList, useLayoutEffect} from "react";

type KeyboardEventListener = (e: KeyboardEvent) => any;

export function useKeyboardListener(listener: KeyboardEventListener | null, deps?: DependencyList) {
    if (deps === undefined) {
        deps = [listener];
    }

    useLayoutEffect(
        () => {
            if (listener) {
                document.addEventListener("keypress", listener);
                return () => document.removeEventListener("keypress", listener);
            }
        },
        deps
    )
}