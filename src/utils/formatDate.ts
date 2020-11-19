import { i18n } from "../Translator";
import { l, LocaleItem } from "../Localizer";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { getLocales } from "../locales";

export const dateTimeFormats = i18n({
    full: l({ fallback: { datestyle: "full" } }),
    long: l({ fallback: { datestyle: "long" } }),
    medium: l({ fallback: { datestyle: "medium" } }),
    short: l({ fallback: { datestyle: "short" } }),
} as Record<string, LocaleItem<DateTimeFormatOptions>>);

export function formatDate(date: Date, mode: "full" | "long" | "medium" | "short" | string): string {
    const options = dateTimeFormats[mode] || {};
    return new Intl.DateTimeFormat(getLocales() as string[], options).format(date);
}
