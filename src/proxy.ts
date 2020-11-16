/**
 * Patch a localization object.
 * When the source object will change type later, typescript will warn about non-localized keys.
 */
import { LocaleItem, t } from "./Localizer";

const proxies = new WeakMap<AnyObject, AnyObject>();

export function getResolver<T extends AnyObject>(object: T): LocaleProxy<T> {
    const proxy = proxies.get(object);
    if (proxy) {
        return proxy as LocaleProxy<T>;
    } else {
        const newProxy = new Proxy(object, localeHandlers) as LocaleProxy<T>;
        proxies.set(object, newProxy);
        return newProxy;
    }
}

const localeHandlers: any = {
    get: function (target: AnyObject, key: string | symbol) {
        const res = Reflect.get(target, key);
        if (typeof key === "string") {
            if (res === undefined) {
                return getResolver(new UnknownPath(key, target) as any);
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

class UnknownPath {
    constructor(public key: string, private parent: AnyObject) {}

    getPath(): string {
        if (this.parent instanceof UnknownPath) {
            return this.parent.getPath() + "." + this.key;
        } else {
            return this.key;
        }
    }

    toString(): string {
        return `[*.${this.getPath()}]`;
    }
}

/**
 * Keys can be ignored by setting the undefined value.
 */
export type LocaleProxy<T extends AnyObject> = {
    [P in keyof T]: T[P] extends LocaleItem<infer U> ? U : T[P] extends AnyObject ? LocaleProxy<T[P]> : T[P];
};

type AnyObject = Record<any, unknown>;
