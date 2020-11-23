import { dateTimeFormats, datetime, datetimeParts } from "./datetime";
import { locales } from "../locales";
import { patch } from "../patch";
import { l } from "../translation";
import { patchLocale } from "../patchLocale";

describe("formatDate", () => {
    test("formats", () => {
        patch(dateTimeFormats, {
            long: l({
                "en-US": {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                    hour: "numeric",
                    minute: "numeric",
                },
                "ja-JP": {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                },
            }),
        });

        patchLocale(dateTimeFormats, "en", {
            custom: { weekday: "long" },
        });

        const d = new Date(2020, 10, 20, 12, 41, 10);

        locales.value = ["en-US"];
        expect(datetime(d, "unknown")).toBe("11/20/2020");
        expect(datetime(d, "custom")).toBe("Friday");
        expect(datetime(d, "long")).toBe("Fri, Nov 20, 2020, 12:41 PM");

        locales.value = ["ja-JP"];
        expect(datetime(d, "long")).toBe("2020年11月20日(金) 午後0:41");

        const long = dateTimeFormats._raw["long"].locales;
        delete long["en-US"];
        delete long["ja-JP"];

        locales.value = ["en-US"];
        expect(datetime(d, "long")).toBe("November 20, 2020");
    });

    test("parts", () => {
        const d = new Date(2020, 10, 20, 12, 41, 10);
        expect(datetimeParts(d, "long")).toEqual([
            { type: "month", value: "November" },
            { type: "literal", value: " " },
            { type: "day", value: "20" },
            { type: "literal", value: ", " },
            { type: "year", value: "2020" },
        ]);
    });
});
