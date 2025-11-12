const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const isWindows = process.platform === "win32";
const npxCommand = "npx";
const cucumberArgs = ["cucumber-js", "--config", "tooling/cucumber.cjs"];
const reportPath = path.resolve(".results/playwright_cucumber_report.json");
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: isWindows,
      ...options,
    });
    child.on("error", (error) => reject(error));
    child.on("close", (code) => resolve(code ?? 0));
  });
}

async function main() {
  try {
    const cucumberExit = await runCommand(npxCommand, cucumberArgs);
    await runCommand(process.execPath, ["tooling/cucumber-summary.cjs", reportPath, String(cucumberExit)]);
    process.exit(cucumberExit);
  } catch (error) {
    console.error("Failed to execute Playwright BDD suite:", error);
    process.exit(1);
  }
}

main();
