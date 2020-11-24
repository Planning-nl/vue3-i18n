import { translate } from "../translator";
import { l, t, TranslatableItem } from "../translation";
import { getLocales } from "../locales";
import { i18n } from "./i18n";

export type DateTimeFormatOptions = Intl.DateTimeFormatOptions & {
    dateStyle?: string;
    timeStyle?: string;
};

export const dateTimeFormats = translate<Record<string, TranslatableItem<DateTimeFormatOptions>>>({
    full: l({ fallback: { dateStyle: "full" } }),
    long: l({ fallback: { dateStyle: "long" } }),
    medium: l({ fallback: { dateStyle: "medium" } }),
    short: l({ fallback: { dateStyle: "short" } }),
});

export type Mode = "full" | "long" | "medium" | "short" | string;

function getDateTimeFormat(mode: Mode, extraOptions: DateTimeFormatOptions = {}) {
    let options = dateTimeFormats[mode] || {};
    if (extraOptions) {
        options = Object.assign({}, options, extraOptions);
    }

    return Intl.DateTimeFormat(getLocales() as string[], options);
}

export const datetimePartsItem = l({
    fallback: (date: Date, mode: Mode, extraOptions: DateTimeFormatOptions = {}): Intl.DateTimeFormatPart[] => {
        return getDateTimeFormat(mode, extraOptions).formatToParts(date);
    },
});

export function datetimeParts(
    date: Date,
    mode: Mode,
    extraOptions: DateTimeFormatOptions = {},
): Intl.DateTimeFormatPart[] {
    return t(datetimePartsItem)(date, mode, extraOptions);
}

export function datetime(date: Date, mode: Mode, extraOptions: DateTimeFormatOptions = {}): string {
    return t(datetimePartsItem)(date, mode, extraOptions)
        .map((item) => item.value)
        .join("");
}
