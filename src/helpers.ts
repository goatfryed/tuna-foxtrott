export function make<T>(val: T) {
    return () => val;
}