import { ucfirst } from "./ucfirst";

describe("ucfirst", () => {
    test("alpha char", () => {
        expect(ucfirst("hallo")).toBe("Hallo");
    });

    test("non-alpha char", () => {
        expect(ucfirst("1")).toBe("1");
    });

    test("empty", () => {
        expect(ucfirst("")).toBe("");
    });
});
