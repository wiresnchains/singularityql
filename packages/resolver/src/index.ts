import { addResolver, resolve } from "./resolver";

addResolver("add", (x, y) => {
    return {
        result: x + y
    };
});

addResolver("mul", (x, y) => {
    return {
        result: x * y
    };
});

(async () => {
    console.dir(await resolve("add(5, 5) { ~result as add_res } mul(add_res, 2) { result }", {}), { depth: null });
})();

export {
    addResolver,
    resolve
};
