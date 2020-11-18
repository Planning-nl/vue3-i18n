import { AnyObject, Translator, getTranslator } from "./Translator";

export function useI18n<T extends AnyObject>(object: T): Translator<T> {
    return getTranslator(object);
}

export { getLocales, locales, withLocales } from "./locales";
export { l } from "./Localizer";
export { patch } from "./patch";
