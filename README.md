# Vue3-i18n
 
This is a lightweight and type safe i18n library for [Vue 3](https://github.com/vuejs/vue-next) applications.

This module:
* provides a way to define **translation objects**
* provides getting and setting the **active locales**
* provides a **translation function** that returns the correct translation based on the active locale 
* provides an ergonomic way to use these translations in templates

It does so in just *200 lines* of code.

## Why Vue3-i18n?

* Simple, easy to understand
* Flexible enough to handle even complex i18n use cases
* Ergonomic syntax
* Locales and translations are reactive (@vue/reactivity)
* Tiny in size
* Fast (translates 3M items per second)
* Type safety (when using typescript)
* Good support for IDE features such as *find usages* and *rename*

## Installation

`yarn install @planning/vue3-i18n`

`npm install --save @planning/vue3-i18n`

## Basic usage

```typescript
import { l, useI18n, locale } from "@planning.nl/vue3-i18n";

export default defineComponent({
    setup() {
        return {
            locale,
            t: useI18n({
                hello: l({
                    en: "hello",
                    nl: "hallo",
                    fallback: "👋",
                })
            })
        }
    }
})
```

```html
<template>
    <p v-text="t.hello"></p>
</template>
```

You could also define a shared set that can be imported and used throughout your app:

```typescript
import { l, useI18n, locale } from "@planning.nl/vue3-i18n";

const translations = {
    hello: l({
        en: "hello",
        nl: "hallo",
        fallback: "👋",
    }),
    group: {
        world: l({
            en: "world",
            nl: "wereld",
            fallback: "🌐"
        })
    }
};

export const t = useI18n(translations);

locales.value = ["nl-NL"];
console.log(`${t.hello} ${t.group.world}`); // "hallo wereld"

locales.value = ["fr"];
console.log(`${t.hello} ${t.group.world}`); // "👋 🌐"
```

## Features

### useI18n

You can define translations in a nested object. Keys can either be objects (for grouping) or translatable items,
which can be created using the `l` shortcut function. It accepts a plain object with translated values, keyed by locale. 
Example:

```typescript
import { l, useI18n } from "@planning.nl/vue3-i18n";

const translations = useI18n({
    hello: l({
        en: "hello",
        "en-US": "hi",
        nl: "hallo",
        fallback: "👋",
    }),
    main: {
        sub: l({ nl: "sub" })
    }
})
```

A locale key is a string. It can contain a multiple parts, separated by `-` symbols. The first group represents the 
language, the second group the region. After that, groups represent more and more specific sub regions/variants of the
language.

The special key `fallback` provides the fallback value when no other locale matches. 

### Locales
Locales can be set using the exported `locales` ref. It accepts an array of strings or the default value `undefined` 
(in which case it uses `navigator.languages` instead).

The first locale is the primary one. Only if no translation can be found for it, the next locale in the list will be
tried (and so on).

The `getLocales()` function returns the array of currently active locales.

#### Translation rules

When fetching a translation, one of the keys will be selected for which to return
the value. The following rules apply:

1. The longest (most parts) key is used that matches the current locale. 
2. If no such key can be found at all, the next locale is checked. 
3. If no locale can be matched, the `fallback` key is used.
4. If `fallback` is not specified, the first specified key is used.

### Overriding the locale

The function `withLocales` can be used to fetch a translation for a specific locale. It accepts a list of locales, and 
a callback that produces a value. Example:

```typescript
const hallo = withLocales(["nl"], () => t.hello);
```

### Patching

The `patch` function allows you to add or modify locales to an existing translations object.

It iterates over both the translations object recursively, and merges the locales for the translatable items.

Using the patch function ensures that all translation items have been specified. If some keys have not been specified a 
typescript error will occur. This makes sure you didn't forget one. 

> This is especially handy when you patch the translations of a 3rd party component which may be updated with new 
> translations. See 'i18n for generic components'.

There are two ways to ignore unspecified properties: 
1. By specifying the property value `undefined`, it will ignore it completely.
2. By overriding the type with any: `patch<any>(Base, obj)`.

Example:
```typescript
const t = useI18n({
    multi: {
        main: l({
            "de-DE-BY": "Bayern",
            "de-DE": "Deutsch",
        }),
    },
});

locales.value = ["de-DE-NW"];
console.log(t.main); // Deutsch

patch(t, {
    multi: {
        main: l({
            "de-DE-NW": "Nordrhein Westfalen",
        }),
    },
});

locales.value = ["de-DE-NW"];
console.log(t.main); // Nordrhein Westfalen
```

## i18n for generic components

This lightweight module is perfect for providing i18n in generic components.

Just define your translations in a seperate file and export it. Then import the translations into your component(s) and 
use them where you need them. Add translations for the locales that you wish to ship with your module.

That's all you need to do.

This enables applications using your component to `patch` the translation set with additional locales, or even to 
override the defaults that you have set.

Better still, `patch` enforces that all messages are translated. So if you add a new message in an update, your users 
will receive a typescript error which forces them to provide translations for their own locales.

## Tips & tricks

This module doesn't (need to) ship with extra goodies such as string format patterns, pluralization, number and dates.

We don't need to because it's easy to implement it by yourself. The following examples might give you some ideas. 

### String format patterns

Most i18n frameworks allow special patterns in translation strings as *placeholders* or *references* to other translations.
 
This library doesn't post-process strings at all, and it doesn't have any such patterns. Just use functions, as they 
provide flexibility as well as type safety. Example:

```typescript
import { l, useI18n } from "@planning.nl/vue3-i18n";

const t = useI18n({
    dear: l({ en: "dear", nl: "beste" }),
    greetings: l({
        en: (name: string) => `Hello ${t.dear} ${name}`,
        nl: (name: string) => `Hallo ${t.dear} ${name}`,
    }),
});

locales.value = ["nl-NL"];
console.log(t.greetings("Evan")); // "Hallo beste Evan";

locales.value = ["en"];
console.log(t.greetings("Evan")); // "Hello dear Evan";
```

### Pluralization

What method of pluralization you need may depend on your application and used languages.

But as an example, you could define a factory that produces a count-to-string function:

```typescript
import { l, useI18n, locale } from "@planning.nl/vue3-i18n";

const t = useI18n({
    bananas: l({
        en: plural("no bananas", "one banana", "{n} bananas"),
        nl: plural("geen bananen", "één banaan", "{n} bananen"),
    }),
});

export function plural(none: string, one: string, multiple: string): (count: number) => string {
    return (count: number): string => {
        if (count === 0) {
            return none;
        } else if (count === 1) {
            return one;
        } else {
            return multiple.replace("{n}", "" + count);
        }
    };
}

console.log(t.bananas(10)); // 10 bananas
```

Some languages, such as Russian, have complex pluralization rules. This could be easily solved by creating a specific
`pluralRussian` factory that accepts different options but produces a function with the same signature. 

### Number formatting

Modern browsers can already format numbers based on a locale, so no need to include it in this library. 

You may want to add your own helper function though. We simply must 'feed' it with our current locales:

```typescript
import { getLocales } from "@planning.nl/vue3-i18n";

export function number(v: number, options: NumberFormatOptions = {}): string {
    const formatter = Intl.NumberFormat(getLocales(), options);
    return formatter.format(v);
}
```

### Date formatting
Browser support locale date formatting using `DateTimeFormat`. So same as above.

If you need [https://kazupon.github.io/vue-i18n/guide/datetime.html](custom definition formats), this could be a good
approach:

```typescript
import { l, t, getLocales } from "@planning.nl/vue3-i18n";

const dateTimeFormats = {
    short: l({
        "en-US": {year: "numeric", month: "short", day: "numeric"},
        fallback: {datestyle: "short"}
    }),
    long: l({
        "en-US": {
            year: "numeric", month: "short", day: "numeric",
            weekday: "short", hour: "numeric", minute: "numeric"
        },
        "ja-JP": {
            year: "numeric", month: "short", day: "numeric",
            weekday: "short", hour: "numeric", minute: "numeric", hour12: true
        },
        fallback: {datestyle: "long"}
    })
}

export function formatDate(date: Date, mode: keyof typeof dateTimeFormats): string {
    const options = t(dateTimeFormats[mode]);
    return (new Intl.DateTimeFormat(getLocales(), options)).format(date);
};

console.log(formatDate(new Date(), "short"));
```

### Lazy loading

If you really need this (although I wonder if anyone really does..), you could fetch the data in json format and then 
run a `patch<any>`. The reactivity would automatically update your application once the data is loaded.

## Browser support

Browser support for this module matches Vue3 browser support.

Most importantly it relies on `Proxy`, so that means all modern browsers are supported but IE11 is not.

## License
[Apache](https://opensource.org/licenses/Apache-2.0)
