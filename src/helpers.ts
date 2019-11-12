export function make<T>(val: T) {
    return () => val;
}

export function assertUnreachable(x: never, msg?: string) {
    throw new Error(msg || "Didn't expect to get here");
}