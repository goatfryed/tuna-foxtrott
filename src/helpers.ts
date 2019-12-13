import {useMemo} from "react";
import {observable} from "mobx";

export function make<T>(val: T) {
    return () => val;
}

export function assertUnreachable(x: never, msg?: string) {
    throw new Error(msg || "Didn't expect to get here");
}

export type Immutable<T> = {
    readonly [P in keyof T]: T[P] extends {} ? Immutable<T[P]> : T[P];
}

export type NotNull<T, S extends keyof T> = T & {
    [P in S]: Exclude<T[P], null|undefined>
}

export function useConst<T>(obj: T): T {
    return useMemo(() => obj, Object.values(obj));
}

export function definedValue<T>(val: T): val is Exclude<T, undefined|null> {
    return val !== null && val !== undefined;
}

export type Consumer<T> = (arg: T) => void;

export const shallowObservableArray = <T>(initial?: T[]) => observable.array(initial, {deep: false});