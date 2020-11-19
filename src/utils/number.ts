import { getLocales } from "../locales";
import NumberFormatOptions = Intl.NumberFormatOptions;

export function number(v: number, options: NumberFormatOptions = {}): string {
    const formatter = Intl.NumberFormat(getLocales() as string[], options);
    return formatter.format(v);
}
