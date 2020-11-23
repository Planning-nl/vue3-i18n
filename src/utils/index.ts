import { useI18n } from "../translator";
import { plural, pluralAmount } from "./plural";
import { number, numberParts } from "./number";
import { ucFirst } from "./ucFirst";
import { datetime, datetimeParts } from "./datetime";

export const i18n = useI18n({
    plural,
    pluralAmount,
    number,
    numberParts,
    ucFirst,
    datetime,
    datetimeParts,
});
