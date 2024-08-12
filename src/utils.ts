// deno-lint-ignore-file ban-types no-explicit-any
// heretic left-side composition

export function composeOld(...fns: Function[]) {
    return (x: any) => fns.reduce((acc, fn) => fn(acc), x);
}

// Variadic compose function. This function is a left-side composition function. Takes any type which is a bit scary.
export function compose(...fns: Function[]) {
    return (...args: any[]) =>
        fns.reduce(
            (acc, fn, index) => index === 0 ? fn(...acc) : fn(acc),
            args,
        );
}
