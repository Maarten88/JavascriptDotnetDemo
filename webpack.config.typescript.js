// an alternative to ts-node for bootstrapping webpack.config in typescript
const tsc = require("typescript");
const webpackConfig = require("fs").readFileSync("./webpack.config.ts", "utf8");
const options = {
    compilerOptions: {
        target: "es5",
        module: "commonjs",
        allowJs: false,
        checkJs: false
    }
};
console.log(tsc.transpileModule(webpackConfig, options).outputText);
module.exports = eval(tsc.transpileModule(webpackConfig, options).outputText);