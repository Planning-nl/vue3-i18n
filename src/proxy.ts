/**
 * Patch a localization object.
 * When the source object will change type later, typescript will warn about non-localized keys.
 */
import { LocaleItem, t } from "./Localizer";

const proxies = new WeakMap<AnyObject, AnyObject>();

export function createLocaleProxy<T extends AnyObject>(object: T): LocaleProxy<T> {
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
        if (res instanceof LocaleItem) {
            return t(res);
        } else if (typeof res === "object") {
            return createLocaleProxy(res);
        } else if (res === undefined && typeof key === "string") {
            return createLocaleProxy(new UnknownPath(key, target) as any);
        } else {
            return res;
        }
    },
    set: function (target: AnyObject, key: string | symbol, value: any) {
        throw new Error("Set is not allowed on locale proxies");
    },
    deleteProperty: function (target: AnyObject, key: string | symbol) {
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
        return "Unknown locale proxy path: " + this.getPath();
    }
}

/**
 * Keys can be ignored by setting the undefined value.
 */
export type LocaleProxy<T extends AnyObject> = {
    [P in keyof T]: T[P] extends LocaleItem<infer U> ? U : T[P] extends AnyObject ? LocaleProxy<T[P]> : T[P];
};

type AnyObject = Record<any, unknown>;
