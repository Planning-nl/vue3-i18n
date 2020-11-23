import { ucFirst } from "./ucFirst";

describe("ucfirst", () => {
    test("alpha char", () => {
        expect(ucFirst("hallo")).toBe("Hallo");
    });

    test("non-alpha char", () => {
        expect(ucFirst("1")).toBe("1");
    });

    test("empty", () => {
        expect(ucFirst("")).toBe("");
    });
});
