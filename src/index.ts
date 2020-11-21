import { number, numberHtml } from "./utils/number";
import { datetime, datetimeHtml } from "./utils/datetime";
import { escapeHtml } from "./utils/escapeHtml";

export { i18n, Translator } from "./translator";
export { l, Translations } from "./translation";
export { getLocales, locales, withLocales } from "./locales";
export { patch } from "./patch";
export { patchLocale } from "./patchLocale";
export { plural } from "./utils/plural";
export { number, numberParts, numberHtml } from "./utils/number";
export { datetime, datetimeParts, datetimeHtml, dateTimeFormats } from "./utils/datetime";
export { escapeHtml } from "./utils/escapeHtml";

export function useI18nUtils() {
    return {
        number,
        numberHtml,
        datetime,
        datetimeHtml,
        escapeHtml,
    };
}
