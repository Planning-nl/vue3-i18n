/**
 * Patch a localization object.
 * When the source object will change type later, typescript will warn about non-localized keys.
 */
import { LocaleItem, t } from "./Localizer";

export type Translator<T extends AnyObject> = Readonly<
    {
        [P in keyof T]: T[P] extends LocaleItem<infer U> ? U : T[P] extends AnyObject ? Translator<T[P]> : T[P];
    }
> & { data: T };

export function getTranslator<T extends AnyObject>(object: T): Translator<T> {
    return new Proxy(object, translatorProxyHandlers);
}

const translatorProxyHandlers: ProxyHandler<any> = {
    get: function (target, key) {
        const res = Reflect.get(target, key);
        if (typeof key === "string") {
            if (key === "data") {
                return target;
            }
            if (typeof res === "object") {
                if (res instanceof LocaleItem) {
                    return t(res);
                } else {
                    return getTranslator(res);
                }
            } else if (res === undefined) {
                throw new Error(`Key '${key}' not found!`);
            } else {
                return res;
            }
        } else {
            return res;
        }
    },
};

export type AnyObject = Record<any, unknown>;
