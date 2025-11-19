import assert from "node:assert";
import { TokenDateParser, TokenDynamicStringParser } from "../src";

(() => {
  const parsed = TokenDateParser.parseDateStringToken("[TODAY+1YEAR]");
  assert(parsed instanceof Date, "Expected a Date instance");
})();

(() => {
  const parsedRange = TokenDateParser.parseDateStringToken_DateRange("[START-MARCH-2025<->END-MARCH-2025]");
  assert(parsedRange.Start instanceof Date, "Range start should be Date");
  assert(parsedRange.End instanceof Date, "Range end should be Date");
})();

(() => {
  const result = TokenDynamicStringParser.parseAndGenerate("[ALPHA-5]");
  assert(typeof result === "string", "Expected string from dynamic parser");
})();
