
export interface Runnable<T = void> {
    (): T,
}

export function assertNever(x:never, msg: string = "Unexpected object: " + x): never {
    throw new Error (msg);
}