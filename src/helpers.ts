
export function make<T>(val: T) {
    return () => val;
}

export function assertUnreachable(x: never, msg?: string) {
    throw new Error(msg || "Didn't expect to get here");
}

export type Immutable<T> = {
    readonly [P in keyof T]: Immutable<T[P]>
}

export type NotNull<T, S extends keyof T> = T & {
    [P in S]: T[P] extends infer S|null|undefined ? S : T[P]
}