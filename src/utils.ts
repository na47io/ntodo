// heretic left-side composition
// deno-lint-ignore ban-types
export function compose(...fns: Function[]) {
    // deno-lint-ignore no-explicit-any
    return (x: any) => fns.reduce((acc, fn) => fn(acc), x);
}
