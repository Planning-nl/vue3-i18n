# Vue3-i18n
 
This is a lightweight and type safe i18n library for [Vue 3](https://github.com/vuejs/vue-next) applications.

This module:
* provides a way to define **translation objects**
* provides getting and setting the **active locales** 
* provides an ergonomic way to use these translations
* provides a way to change and extend translation objects

## Why Vue3-i18n?

* Simple, easy to understand
* Flexible enough to handle even complex i18n use cases
* Ergonomic syntax
* Locales and translations are reactive (@vue/reactivity)
* Small in size (300 lines of code)
* Fast (translates 3M items per second)
* Type safety
* Good support for IDE features such as *find usages* and *rename*

## Installation

`yarn install @planning/vue3-i18n`

`npm install --save @planning/vue3-i18n`

## Basic usage

```typescript
import { l, i18n, locale } from "@planning.nl/vue3-i18n";
export default defineComponent({
    setup() {
        return {
            locale,
            t: i18n({
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

> Notice that you shouldn't *spread* your i18n proxy in the setup (`{...i18n({..})`) 
> If it contains translatable items on the root level, those will only be translated once initially.

You could also define a shared set that can be imported and used throughout your app:

```typescript
import { l, i18n, locale } from "@planning.nl/vue3-i18n";

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

export const t = i18n(translations);

locales.value = ["nl-NL"];
console.log(`${t.hello} ${t.group.world}`); // "hallo wereld"

locales.value = ["fr"];
console.log(`${t.hello} ${t.group.world}`); // "👋 🌐"
```

## API

### Translations

You can define translations in a nested object. You then feed this translations object to the `i18n` function, which 
produces a translator object. `i18n` expects a nested object with entries that can either be translatable items or
other objects (for grouping).

Translatable items can be created using the `l` shortcut function. It accepts a plain object with translated values, 
keyed by locale.
 
Example:

```typescript
import { l, i18n } from "@planning.nl/vue3-i18n";

const translations = i18n({
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

### Localization

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
const hallo = withLocales(["nl", "en-US"], () => t.hello);
```

### Patching

The `patch` function allows you to conveniently add or modify locales to an existing translations object.

It iterates over both the translations object recursively, and merges the locales for the translatable items.

Using the patch function ensures that all translation items have been specified. If some keys have not been specified a 
typescript error will occur. This makes sure you didn't forget one. 

> Although patching is the advised method of changing a translations set, it's also possible to directly change the 
> translations object. Use the `_raw` property to obtain a reference to it.

There are two ways to ignore unspecified properties: 
1. By specifying the property value `undefined`, it will ignore it completely.
2. By overriding the type with any: `patch<any>(Base, obj)`.

Example:
```typescript
const t = i18n({
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

It's also possible to add or change a specific locale using `patchLocale`:

```typescript
patchLocale(t, "nl", { 
    multi: { 
        main: "Nederlands" 
    }
});
```

### String format patterns

Most i18n frameworks allow special patterns in translation strings as *placeholders* or *references* to other translations.
 
This library doesn't post-process strings at all, and it doesn't have any such patterns. Just use functions, as they 
provide flexibility as well as type safety. Example:

```typescript
import { l, i18n } from "@planning.nl/vue3-i18n";

const t = i18n({
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

A lot of (if not most) languages have a singular and plural form. This library support helper functions for those forms.

```typescript
const t = i18n({
    banana: l({
        en: plural("banana", "bananas"),
    }),
    cost: l({
        en: amount("free", "one euro", "{n} euros"),
    }),
});

console.log(t.bananas(10)); // 10 bananas
console.log(t.cost(1)); // one euro
console.log(t.cost(10.55)); // 10.55 euros
```

> You may prefer another method of pluralization, or you may need another plural rules for a specific locale. In that 
> case you can add your own pluralization functions.

### Number formatting

You can use the `number` function to format a number. This library relies on the `Intl.NumberFormat` browser 
functionality for locale-aware number formatting.
 
The `number` function accepts a number and additional [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) number format options. 

```typescript
console.log(number(10, { style: 'currency', currency: 'EUR' }));
```

### Date formatting

You can use the `formatDate` function to format a date. This library relies on the `Intl.DateTimeFormat` browser 
functionality.

You can customize date formats by patching the global formats object:

```typescript
patchLocale(dateTimeFormats, "en-US", {
    long: {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
    },        
    custom: { weekday: "long" },
});

locales.value = ["en-US"];
console.log(formatDate(new Date(), "long"));
console.log(formatDate(new Date(), "custom"));
```

### Lazy loading

If you really need this (although I wonder if anyone really does), you could fetch the data in json format and then 
run a `patch` or `patchLocale`. The reactivity would automatically update your application once the data is loaded.

## i18n for generic components

This lightweight module is perfect for providing i18n in generic component modules.

Define your translations in a seperate file and export it as part of your module. Then import the translations into your 
component(s) and use them where you need them. Add translations for the locales that you wish to ship with your module.

This enables applications using your component to `patch` the translation set with additional locales, or even to 
override the defaults that you have set.

Better still, `patch` enforces that *all messages* are translated. If you add a new message in an update, your users 
will receive a typescript error which forces them to provide translations for their own locales.

## Notes

> When you'd like to get the translatable keys of an object, you should use `TranslationKeys<typeof translations>`. You 
> can't just use `keyof typeof translations` because it would include the undesired `data` property.

## Browser support

Browser support for this module matches Vue3 browser support.

Most importantly it relies on `Proxy`, so that means all modern browsers are supported. IE11 is not supported.

## License
[Apache](https://opensource.org/licenses/Apache-2.0)
