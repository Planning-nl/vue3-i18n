import { getLocale } from "./locale";
import NumberFormatOptions = Intl.NumberFormatOptions;

/**
 * Returns the localized form of a number, using Intl.NumberFormat.
 */
export function number(v: number, options: NumberFormatOptions = {}): string {
    const formatter = Intl.NumberFormat(getLocale(), options);
    return formatter.format(v);
}
