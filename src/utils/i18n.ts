import { numberPartsItem } from "./number";
import { ucFirstItem } from "./ucFirst";
import { datetimePartsItem } from "./datetime";
import { translate } from "../translator";

export const i18n = translate({
    numberParts: numberPartsItem,
    datetimeParts: datetimePartsItem,
    ucFirst: ucFirstItem,
});
