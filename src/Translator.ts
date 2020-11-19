import { LocaleItem, t } from "./Localizer";

export type Translator<T extends Translations> = {
    readonly [P in keyof T]: T[P] extends LocaleItem<infer U> ? U : T[P] extends Translations ? Translator<T[P]> : T[P];
} & { readonly _raw: T };

export type TranslationKeys<T extends Translator<any>> = Exclude<keyof T, "_raw">;

export type Translations = { [key: string]: LocaleItem<any> | Translations };

export function i18n<T extends Translations>(object: T): Translator<T> {
    return new Proxy(object, translatorProxyHandlers);
}

const translatorProxyHandlers: ProxyHandler<any> = {
    get(target, key) {
        const res = Reflect.get(target, key);
        if (typeof key === "string") {
            if (key === "_raw") {
                return target;
            }
            if (typeof res === "object") {
                if (res instanceof LocaleItem) {
                    return t(res);
                } else {
                    return i18n(res);
                }
            } else {
                if (res === undefined) {
                    console.warn(`Key '${key}' not found!`);
                }
                return res;
            }
        } else {
            return res;
        }
    },
    set() {
        return false;
    },
    defineProperty() {
        return false;
    },
    deleteProperty() {
        return false;
    },
};
