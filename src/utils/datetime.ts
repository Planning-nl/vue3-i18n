import { i18n } from "../translator";
import { l, TranslatableItem } from "../translation";
import { getLocales } from "../locales";

export const dateTimeFormats = i18n({
    full: l({ fallback: { datestyle: "full" } }),
    long: l({ fallback: { datestyle: "long" } }),
    medium: l({ fallback: { datestyle: "medium" } }),
    short: l({ fallback: { datestyle: "short" } }),
} as Record<string, TranslatableItem<Intl.DateTimeFormatOptions>>);

export function getDateTimeFormat(
    mode: "full" | "long" | "medium" | "short" | string,
    extraOptions: Intl.DateTimeFormatOptions = {},
) {
    const baseOptions = dateTimeFormats[mode] || {};
    let options;
    if (extraOptions) {
        options = Object.assign({}, baseOptions, extraOptions);
    } else {
        options = baseOptions;
    }
    return Intl.DateTimeFormat(getLocales() as string[], options);
}

export function datetime(
    date: Date,
    mode: "full" | "long" | "medium" | "short" | string,
    extraOptions: Intl.DateTimeFormatOptions = {},
): string {
    return getDateTimeFormat(mode, extraOptions).format(date);
}

export function datetimeParts(
    date: Date,
    mode: "full" | "long" | "medium" | "short" | string,
    extraOptions: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormatPart[] {
    return getDateTimeFormat(mode, extraOptions).formatToParts(date);
}
