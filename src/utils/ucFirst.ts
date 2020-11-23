import { l } from "../translation";

export const ucFirst = l({
    fallback: (s: string): string => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },
});
