import { TranslatableItem, t, Translations } from "./translation";

export type Translator<T extends Translations> = {
    readonly [P in keyof T]: T[P] extends TranslatableItem<infer U>
        ? U
        : T[P] extends Translations
        ? Translator<T[P]>
        : T[P];
} & { readonly _raw: T };

export type TranslationKeys<T extends Translator<any>> = Exclude<keyof T, "_raw">;

export function translate<T extends Translations>(object: T): Translator<T> {
    return new Proxy(object, translatorProxyHandlers) as Translator<T>;
}

const VUE_INTERNAL_PREFIX = "__";

const translatorProxyHandlers: ProxyHandler<Translations> = {
    get(target, key) {
        const res = Reflect.get(target, key);
        if (typeof key === "string") {
            if (key === "_raw") {
                return target;
            }
            if (typeof res === "object") {
                if (res instanceof TranslatableItem) {
                    return t(res);
                } else {
                    return translate(res);
                }
            } else {
                if (res === undefined && !key.startsWith(VUE_INTERNAL_PREFIX)) {
                    console.warn(`Translation key '${key}' not found!`);
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
