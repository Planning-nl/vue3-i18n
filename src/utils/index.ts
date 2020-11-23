import { number, numberParts } from "./number";
import { ucFirst } from "./ucFirst";
import { datetime, datetimeParts } from "./datetime";
import { translate } from "../translator";

export const i18n = translate({
    number,
    numberParts,
    ucFirst,
    datetime,
    datetimeParts,
});
