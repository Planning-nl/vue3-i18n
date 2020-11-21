import { i18n } from "../translator";
import { l, TranslatableItem } from "../translation";
import { getLocales } from "../locales";
import { escapeHtml } from "./escapeHtml";

export const dateTimeFormats = i18n({
    full: l({ fallback: { datestyle: "full" } }),
    long: l({ fallback: { datestyle: "long" } }),
    medium: l({ fallback: { datestyle: "medium" } }),
    short: l({ fallback: { datestyle: "short" } }),
} as Record<string, TranslatableItem<Intl.DateTimeFormatOptions>>);

type Mode = "full" | "long" | "medium" | "short" | string;

export function getDateTimeFormat(mode: Mode, extraOptions: Intl.DateTimeFormatOptions = {}) {
    const baseOptions = dateTimeFormats[mode] || {};
    let options;
    if (extraOptions) {
        options = Object.assign({}, baseOptions, extraOptions);
    } else {
        options = baseOptions;
    }
    return Intl.DateTimeFormat(getLocales() as string[], options);
}

export function datetime(date: Date, mode: Mode, extraOptions: Intl.DateTimeFormatOptions = {}): string {
    return getDateTimeFormat(mode, extraOptions).format(date);
}

export function datetimeParts(
    date: Date,
    mode: "full" | "long" | "medium" | "short" | string,
    extraOptions: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormatPart[] {
    return getDateTimeFormat(mode, extraOptions).formatToParts(date);
}

export function datetimeHtml(date: Date, mode: Mode, extraOptions: Intl.DateTimeFormatOptions = {}): string {
    const parts = datetimeParts(date, mode, extraOptions);
    const partsHtml = parts
        .map((part) => `<span class="i18n-datetime-${part.type}">${escapeHtml(part.value)}</span>`)
        .join("");
    return `<span class="i18n-datetime">${partsHtml}</span>`;
}
