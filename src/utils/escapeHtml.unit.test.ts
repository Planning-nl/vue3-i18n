import { escapeHtml } from "./escapeHtml";

describe("escapeHtml", () => {
    test("simple", () => {
        expect(escapeHtml("<div>👋</div>")).toBe("&lt;div&gt;👋&lt;/div&gt;");
    });
});
