/**
 * Patch a localization object.
 * When the source object will change type later, typescript will warn about non-localized keys.
 */
import { LocaleItem, t } from "./Localizer";

export type LocaleProxy<T extends AnyObject> = Readonly<
    {
        [P in keyof T]: T[P] extends LocaleItem<infer U> ? U : T[P] extends AnyObject ? LocaleProxy<T[P]> : T[P];
    }
>;

type AnyObject = Record<any, unknown>;

export function resolve<T extends AnyObject>(object: T): LocaleProxy<T> {
    return new Proxy(object, localeProxyHandlers);
}

const localeProxyHandlers: ProxyHandler<any> = {
    get: function (target, key) {
        const res = Reflect.get(target, key);
        if (typeof key === "string") {
            if (typeof res === "object") {
                if (res instanceof LocaleItem) {
                    return t(res);
                } else {
                    return resolve(res);
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
