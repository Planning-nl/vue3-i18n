import { l, t } from "../translation";
import { getLocales } from "../locales";

export const ucFirstItem = l({
    fallback: (s: string): string => {
        return s.charAt(0).toLocaleUpperCase(getLocales() as string[]) + s.slice(1);
    },
});

export function ucFirst(s: string): string {
    return t(ucFirstItem)(s);
}
