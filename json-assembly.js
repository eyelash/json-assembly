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

require("fs").readFile(process.argv[2], "utf8", (err, data) => runJsonAssembly(JSON.parse(data)));
