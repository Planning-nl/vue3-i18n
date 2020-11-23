import { translate } from "../translator";
import { l, TranslatableItem } from "../translation";
import { getLocales } from "../locales";

type NewDateTimeFormatOptions = Intl.DateTimeFormatOptions & {
    dateStyle?: string;
    timeStyle?: string;
};

export const dateTimeFormats = translate<Record<string, TranslatableItem<NewDateTimeFormatOptions>>>({
    full: l({ fallback: { dateStyle: "full" } }),
    long: l({ fallback: { dateStyle: "long" } }),
    medium: l({ fallback: { dateStyle: "medium" } }),
    short: l({ fallback: { dateStyle: "short" } }),
});

type Mode = "full" | "long" | "medium" | "short" | string;

function getDateTimeFormat(mode: Mode, extraOptions: NewDateTimeFormatOptions = {}) {
    let options = dateTimeFormats[mode] || {};
    if (extraOptions) {
        options = Object.assign({}, options, extraOptions);
    }

    return Intl.DateTimeFormat(getLocales() as string[], options);
}

export const datetime = l({
    fallback: (date: Date, mode: Mode, extraOptions: NewDateTimeFormatOptions = {}): string => {
        return getDateTimeFormat(mode, extraOptions).format(date);
    },
});

export const datetimeParts = l({
    fallback: (
        date: Date,
        mode: "full" | "long" | "medium" | "short" | string,
        extraOptions: NewDateTimeFormatOptions = {},
    ): Intl.DateTimeFormatPart[] => {
        return getDateTimeFormat(mode, extraOptions).formatToParts(date);
    },
});
