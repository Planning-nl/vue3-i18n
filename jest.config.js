module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["/node_modules/", "/cjs", "/esm", "/dist", "/types"],
};
