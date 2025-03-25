# JSON Assembly

Have you ever wondered what an assembly language represented in JSON would look like? I bet you haven't. Here is what a program might look like:

```json
[
    ["mov", "isPrime", [[
        ["mov", "n", ["args", 0]],
        ["mov", "ret", [true]],
        ["mov", "i", [2]],
        ["mul", "iSquared", "i", "i"],
        ["lte", "cond", "iSquared", "n"],
        ["and", "cond", "cond", "ret"],
        ["while", "cond", [
            ["rem", "remainder", "n", "i"],
            ["eq", "hasFactor", "remainder", [0]],
            ["if", "hasFactor", [
                ["mov", "ret", [false]]
            ]],
            ["add", "i", "i", [1]],
            ["mul", "iSquared", "i", "i"],
            ["lte", "cond", "iSquared", "n"],
            ["and", "cond", "cond", "ret"]
        ]]
    ]]],
    ["mov", "n", [2]],
    ["mov", "count", [0]],
    ["lt", "cond", "count", [100]],
    ["while", "cond", [
        ["call", "p", "isPrime", ["n"]],
        ["if", "p", [
            ["log", "n", ["is prime"]],
            ["add", "count", "count", [1]]
        ]],
        ["add", "n", "n", [1]],
        ["lt", "cond", "count", [100]]
    ]]
]
```

This program prints the first 100 prime numbers but how do you run it? It turns out you can write a virtual machine for this JSON assembly language in less than 50 lines of JavaScript:

```js
function runJsonAssembly(program, memory) {
    if (!memory) memory = { args: [] };
    if (typeof program === "function") return program(...memory.args);
    const get = (x) => {
        if (typeof x === "string") return memory[x];
        else if (x.length === 1) return x[0];
        else if (x.length === 2) return memory[x[0]][x[1]];
    };
    const set = (x, value) => {
        if (typeof x === "string") memory[x] = value;
        else if (x.length === 2) memory[x[0]][x[1]] = value;
    };
    const instructions = {
        "mov": (dst, src)      => set(dst, get(src)),
        "add": (dst, lhs, rhs) => set(dst, get(lhs) + get(rhs)),
        "sub": (dst, lhs, rhs) => set(dst, get(lhs) - get(rhs)),
        "mul": (dst, lhs, rhs) => set(dst, get(lhs) * get(rhs)),
        "div": (dst, lhs, rhs) => set(dst, get(lhs) / get(rhs)),
        "rem": (dst, lhs, rhs) => set(dst, get(lhs) % get(rhs)),
        "eq":  (dst, lhs, rhs) => set(dst, get(lhs) === get(rhs)),
        "neq": (dst, lhs, rhs) => set(dst, get(lhs) !== get(rhs)),
        "lt":  (dst, lhs, rhs) => set(dst, get(lhs) < get(rhs)),
        "gt":  (dst, lhs, rhs) => set(dst, get(lhs) > get(rhs)),
        "lte": (dst, lhs, rhs) => set(dst, get(lhs) <= get(rhs)),
        "gte": (dst, lhs, rhs) => set(dst, get(lhs) >= get(rhs)),
        "or":  (dst, lhs, rhs) => set(dst, get(lhs) || get(rhs)),
        "and": (dst, lhs, rhs) => set(dst, get(lhs) && get(rhs)),
        "not": (dst, src)      => set(dst, !get(src)),
        "log": (...args)       => console.log(...args.map(get)),
        "while": (cond, body) => {
            while (get(cond)) runJsonAssembly(body, memory);
        },
        "if": (cond, thenBody, elseBody) => {
            if (get(cond)) runJsonAssembly(thenBody, memory);
            else if (elseBody) runJsonAssembly(elseBody, memory);
        },
        "call": (dst, func, args) => {
            args = args.map(get);
            set(dst, runJsonAssembly(get(func), { args }));
        },
    };
    for (const [instruction, ...args] of program) {
        instructions[instruction](...args);
    }
    return memory["ret"];
}
```
