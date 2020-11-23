import { plural, pluralAmount } from "./plural";
import { number, numberParts } from "./number";
import { ucFirst } from "./ucFirst";
import { datetime, datetimeParts } from "./datetime";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useI18nUtils = () => ({
    plural,
    pluralAmount,
    number,
    numberParts,
    ucFirst,
    datetime,
    datetimeParts,
});
