const fs = require("fs");
const path = require("path");

const [, , reportPathArg, exitCodeArg] = process.argv;
const reportPath = reportPathArg
  ? path.resolve(reportPathArg)
  : path.resolve(".results/playwright_cucumber_report.json");

const statusPriority = ["failed", "ambiguous", "undefined", "pending", "skipped", "passed"];

function evaluateScenario(scenario) {
  if (!Array.isArray(scenario.steps)) {
    return "undefined";
  }
  for (const status of statusPriority) {
    const hasStatus = scenario.steps.some(
      (step) => step?.result?.status?.toLowerCase() === status
    );
    if (hasStatus) {
      return status;
    }
  }
  return "undefined";
}

function aggregate(report) {
  const tally = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
    undefined: 0,
    ambiguous: 0,
  };

  for (const feature of report) {
    if (!Array.isArray(feature?.elements)) {
      continue;
    }
    for (const element of feature.elements) {
      if (element?.type !== "scenario") {
        continue;
      }
      const status = evaluateScenario(element);
      tally.total += 1;
      if (status === "passed") {
        tally.passed += 1;
      } else if (status === "failed") {
        tally.failed += 1;
      } else if (status === "skipped") {
        tally.skipped += 1;
      } else if (status === "pending") {
        tally.pending += 1;
      } else if (status === "ambiguous") {
        tally.ambiguous += 1;
      } else {
        tally.undefined += 1;
      }
    }
  }

  return tally;
}

function formatSummary(tally, exitCode) {
  const overallStatus =
    exitCode !== 0 || tally.failed > 0 || tally.ambiguous > 0 || tally.undefined > 0
      ? "FAILED"
      : "PASSED";

  const parts = [
    `Playwright Scenarios ${overallStatus}`,
    `total=${tally.total}`,
    `passed=${tally.passed}`,
    `failed=${tally.failed}`,
    `skipped=${tally.skipped}`,
  ];

  if (tally.pending > 0) {
    parts.push(`pending=${tally.pending}`);
  }
  if (tally.ambiguous > 0) {
    parts.push(`ambiguous=${tally.ambiguous}`);
  }
  if (tally.undefined > 0) {
    parts.push(`undefined=${tally.undefined}`);
  }

  return parts.join(" | ");
}

function main() {
  try {
    if (!fs.existsSync(reportPath)) {
      throw new Error(`report not found at ${reportPath}`);
    }
    const content = fs.readFileSync(reportPath, "utf8");
    const data = JSON.parse(content);
    const tally = aggregate(Array.isArray(data) ? data : []);
    const exitCode = Number(exitCodeArg ?? 0);
    console.log(formatSummary(tally, exitCode));
  } catch (error) {
    console.log(`Playwright Scenarios UNKNOWN | reason=${error.message}`);
  }
}

main();
