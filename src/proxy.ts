/**
 * Patch a localization object.
 * When the source object will change type later, typescript will warn about non-localized keys.
 */
import { LocaleItem, t } from "./Localizer";

/**
 * Keys can be ignored by setting the undefined value.
 */
export type LocaleProxy<T extends AnyObject> = {
    [P in keyof T]: T[P] extends LocaleItem<infer U> ? U : T[P] extends AnyObject ? LocaleProxy<T[P]> : T[P];
};

type AnyObject = Record<any, unknown>;

export function getResolver<T extends AnyObject>(object: T): LocaleProxy<T> {
    return new Proxy(object, localeProxyHandlers) as LocaleProxy<T>;
}

const localeProxyHandlers: any = {
    get: function (target: AnyObject, key: string | symbol) {
        const res = Reflect.get(target, key);
        if (typeof key === "string") {
            if (res === undefined) {
                return getUnknownPathProxy(target, key);
            } else {
                if (res instanceof LocaleItem) {
                    return t(res);
                } else if (typeof res === "object") {
                    return getResolver(res);
                } else {
                    return res;
                }
            }
        } else {
            return res;
        }
    },
    set: function () {
        throw new Error("Set is not allowed on locale proxies");
    },
    deleteProperty: function () {
        throw new Error("Delete is not allowed on locale proxies");
    },
};

export function getUnknownPathProxy(parent: AnyObject, key: string): UnknownPath {
    const path = (parent instanceof UnknownPath ? parent.__path + "." : "") + key;
    return new Proxy(new UnknownPath(path) as any, unknownPathProxyHandlers);
}

const unknownPathProxyHandlers: any = {
    get: function (target: AnyObject, key: string | symbol) {
        const res = Reflect.get(target, key);
        if (typeof key === "string" && res === undefined) {
            return getUnknownPathProxy(target, key);
        } else {
            return res;
        }
    },
};

class UnknownPath {
    constructor(public __path: string) {}

    toString(): string {
        return `[*.${this.__path}]`;
    }
}
