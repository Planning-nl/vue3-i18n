import { datetime, l, number, plural, translate, ucFirst } from "../src";

const Benchmark = require("benchmark");

const suite = new Benchmark.Suite();

const t = translate({
    level0: l({ en: "hello", nl: "hallo" }),
    manyLocales: l({ en: "hello", nl: "hallo", fr: "bonjour", de: "hallo", it: "ciao" }),
    a: {
        b: l({ en: "hello", nl: "hallo" }),
        b2: {
            c: l({ en: "hello", nl: "hallo" }),
        },
    },
    banana: l({ en: plural("banana", "bananas") }),
});

const dt = new Date();

// add tests
suite
    .add("root level translations", function () {
        t.level0;
    })
    .add("root level, many locales translations", function () {
        t.manyLocales;
    })
    .add("level 2 translations", function () {
        t.a.b;
    })
    .add("level 3 translations", function () {
        t.a.b2.c;
    })
    .add("plural", function () {
        t.banana(2);
    })
    .add("number", function () {
        number(12000.123);
    })
    .add("datetime", function () {
        datetime(dt, "long");
    })
    .add("ucFirst", function () {
        ucFirst("test");
    })
    .on("cycle", function (event: any) {
        console.log(String(event.target));
    })
    .run();
