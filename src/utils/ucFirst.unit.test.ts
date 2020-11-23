import { i18n } from "./index";

describe("ucfirst", () => {
    test("alpha char", () => {
        expect(i18n.ucFirst("hallo")).toBe("Hallo");
    });

    test("non-alpha char", () => {
        expect(i18n.ucFirst("1")).toBe("1");
    });

    test("empty", () => {
        expect(i18n.ucFirst("")).toBe("");
    });
});
