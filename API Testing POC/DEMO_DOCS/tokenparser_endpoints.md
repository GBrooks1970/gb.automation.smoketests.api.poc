# Token Parser API Endpoints

_Last updated: 2025-11-04_

The Token Parser API is exposed by both internal demo stacks:

- **DEMOAPP001_TYPESCRIPT_CYPRESS** (`http://localhost:3000`)
- **DEMOAPP002_CSHARP_PLAYWRIGHT** (`http://localhost:5228`)

Both services implement the same contract and Swagger definition. The endpoints convert specialised token strings into JSON responses that downstream automated tests can consume.

---

## 1. `GET /alive`

### Purpose
Lightweight health probe used by CI pipelines and batch scripts.

### Response
```json
{
  "Status": "ALIVE-AND-KICKING"
}
```

### Failure modes
None defined; the endpoint always returns `200` while the process is running.

---

## 2. `GET /parse-date-token`

### Purpose
Converts a relative or range-based date token into an ISO-like UTC timestamp (`yyyy-MM-dd HH:mm:ssZ`).

### Request
`GET /parse-date-token?token=<TOKEN>`

### Successful response
```json
{
  "ParsedToken": "2025-11-04 00:00:00Z"
}
```

### Error response
```json
{
  "Error": "Invalid string token format"
}
```

### Token anatomy

| Segment | Meaning | Required | Notes |
| ------- | ------- | -------- | ----- |
| `[ ... ]` | All date tokens must start and end with square brackets. | Yes | Failure to enclose the token causes an `Invalid string token format` error. |
| `ANCHOR` | Starting point for calculations. One of `TODAY`, `TOMORROW`, `YESTERDAY`. | Yes | Case-sensitive. |
| `ADJUSTMENTS` | Zero or more adjustments of the form `+/-<number><UNIT>`. | Optional | `<UNIT>` is `YEAR`, `MONTH`, or `DAY`. Sign is mandatory for each adjustment. |
| `RANGE` | Optional start/end markers of the form `START-<MONTH>-<YEAR>` or `END-<MONTH>-<YEAR>`. | Optional | When supplied, the parser selects either the start or end of the referenced calendar month/year. |

#### Simple examples

| Token | Description | Example output |
| ----- | ----------- | -------------- |
| `[TODAY]` | Midnight UTC for the current day. | `2025-11-04 00:00:00Z` |
| `[TODAY+1DAY]` | Adds one day to today. | `2025-11-05 00:00:00Z` |
| `[YESTERDAY-2MONTH+1DAY]` | Moves back two months from yesterday, then forward one day. | `2025-09-03 00:00:00Z` |

#### Range examples

| Token | Description | Example output |
| ----- | ----------- | -------------- |
| `[START-JANUARY-2026]` | First day of January 2026, midnight UTC. | `2026-01-01 00:00:00Z` |
| `[END-DECEMBER-2024]` | Final moment of December 2024 (implementation normalises to midnight). | `2024-12-31 00:00:00Z` |

> The TypeScript parser performs extensive validation (`TokenDateParser.parseDateStringToken`), while the C# implementation (`ParsedTokenParser.ParseToken`) mirrors the same rules. Invalid formats, unknown months, or missing signs throw a 400 error with `Invalid string token format`.

---

## 3. `GET /parse-dynamic-string-token`

### Purpose
Generates a random string (optionally multi-line) based on character set directives provided in the token.

### Request
`GET /parse-dynamic-string-token?token=<TOKEN>`

### Successful response
```json
{
  "ParsedToken": "ABcd1234"
}
```

### Error response
```json
{
  "Error": "Invalid string token format"
}
```

### Token anatomy

```
[<TYPE-LIST>-<LENGTH>[-LINES-<COUNT>]]
```

| Segment | Meaning | Required | Notes |
| ------- | ------- | -------- | ----- |
| `TYPE-LIST` | Hyphen-delimited list drawn from `ALPHA`, `NUMERIC`, `PUNCTUATION`, `SPECIAL`. | Yes | Order does not matter; duplicates are ignored. |
| `LENGTH` | Either a positive integer (`1-|`) or `ALL`. | Yes | When `ALL`, every character from the assembled pool is emitted once per line. |
| `LINES-<COUNT>` | Optional instruction to repeat the generated string across multiple lines. | No | Defaults to 1. When present, `<COUNT>` must be a positive integer. |

### Character pools

| Type | JavaScript implementation | C# implementation |
| ---- | ------------------------ | ----------------- |
| `ALPHA` | `A-Z`, `a-z` | `A-Z` |
| `NUMERIC` | `0-9` | `0-9` |
| `PUNCTUATION` | `.,!?;:` | `!@#$%^&*()` |
| `SPECIAL` | `!@#$%^&*()_+[]{}|;:,.<>?` | `~\`|\/?` |

> The two stacks currently diverge in the punctuation/special sets. Aligning them is recommended to guarantee identical outputs for shared tokens.

### Examples

| Token | Description | Output characteristics |
| ----- | ----------- | ---------------------- |
| `[ALPHA-NUMERIC-5]` | Builds a five-character alphanumeric string. | e.g. `fQ9cA` |
| `[PUNCTUATION-3]` | Three characters from the punctuation pool. | e.g. `!?;` (TS) |
| `[ALPHA-NUMERIC-PUNCTUATION-10-LINES-2]` | Ten characters per line, repeated over two lines separated by `\r\n`. | e.g. `"A1b2C3d4E5\r\nF6g7H8i9J0"` |
| `[SPECIAL-ALL]` | All available special characters, shuffled once. | TS and C# return different sets today. |

### Validation rules

- Tokens must match `SymbolsDS.DynamicStringRegex` in the TypeScript service (mirrored by the C# regex).
- Length and line counts below `1` trigger `Invalid string token format`.
- An empty character pool (typo in type names) also throws a 400.

---

## Shared behaviour & Testing

- Both services surface identical Swagger docs under `/swagger/v1/json` (UI), `/swagger/v1/swagger.json` (raw JSON), and `/swagger/v1/swagger.yaml` (YAML).
- Endpoints are covered by:
  - Cypress feature files (`cypress/integration/API/...`) for the TypeScript stack.
  - SpecFlow feature files (`TokenParserTests/Features/...`) for the C# stack.
- Batch scripts (`.batch/RUN_API_AND_TESTS.BAT`, `.batch/RUN_CS_API_AND_TESTS.BAT`, `.batch/RUN_ALL_API_AND_TESTS.BAT`) start the API, wait for readiness, and execute the corresponding tests. Results are written to `.results/`.

---

## Quick Reference

| Endpoint | Query params | 200 payload | 400 payload |
| -------- | ------------ | ----------- | ----------- |
| `/alive` | _none_ | `{ "Status": "ALIVE-AND-KICKING" }` | _n/a_ |
| `/parse-date-token` | `token` | `{ "ParsedToken": "<UTC timestamp>" }` | `{ "Error": "Invalid string token format" }` |
| `/parse-dynamic-string-token` | `token` | `{ "ParsedToken": "<generated string>" }` | `{ "Error": "Invalid string token format" }` |

Use the token anatomy tables above to craft valid requests and to build new automated checks across both demo applications.

