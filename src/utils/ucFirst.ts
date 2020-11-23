import { l } from "../translation";
import { getLocales } from "../locales";

export const ucFirst = l({
    fallback: (s: string): string => {
        return s.charAt(0).toLocaleUpperCase(getLocales() as string[]) + s.slice(1);
    },
});
