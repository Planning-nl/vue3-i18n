import { translate } from "../translator";
import { l } from "../translation";
import { plural, pluralAmount } from "./plural";
import { withLocales } from "../locales";

describe("plural", () => {
    test("simple", () => {
        const t = translate({
            banana: l({
                en: plural("banana", "bananas"),
            }),
        });

        expect(t.banana(1)).toBe("banana");
        expect(t.banana(2)).toBe("bananas");
    });

    test("amount", () => {
        const t = translate({
            bananas: l({
                nl: pluralAmount("geen bananen", "één banaan", "{n} bananen"),
                en: pluralAmount("no bananas", "one banana", "{n} bananas"),
            }),
        });

        expect(t.bananas(0)).toBe("no bananas");
        expect(t.bananas(1)).toBe("one banana");
        expect(t.bananas(10)).toBe("10 bananas");
        expect(t.bananas(10.55)).toBe("10.55 bananas");

        expect(withLocales(["nl-NL"], () => t.bananas(10.55))).toBe("10,55 bananen");
    });
});
