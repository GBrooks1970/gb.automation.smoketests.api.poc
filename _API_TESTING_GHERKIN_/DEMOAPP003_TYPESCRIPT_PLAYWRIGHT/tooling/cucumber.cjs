module.exports = {
  default: {
    requireModule: ["ts-node/register"],
    require: [
      "features/step_definitions/world.ts",
      "features/step_definitions/**/*.ts"
    ],
    paths: ["features/**/*.feature"],
    format: [
      "progress-bar",
      "@cucumber/pretty-formatter",
      "json:.results/playwright_cucumber_report.json"
    ],
    formatOptions: {
      snippetInterface: "async-await"
    },
    parallel: Number(process.env.CUCUMBER_PARALLEL ?? 1)
  }
};
