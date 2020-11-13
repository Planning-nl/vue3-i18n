module.exports = require("@planning.nl/webpack-config")({
    entry: {
        "planning-i18n": "./src/index.ts",
    },
    externals: {
        "@vue/reactivity": { commonjs: "vue", commonjs2: "vue", amd: "vue", root: "Vue" },
    },
});
