# Token Parser API Contract

_Reference specification for any Token Parser implementation._

---

## Base Properties

| Property | Value |
| --- | --- |
| Base URL | Implementation-defined (must expose the paths below) |
| Version | 1.0.0 |
| MIME types | `application/json` for requests and responses |
| Authentication | None |

All responses MUST include a UTF-8 encoded JSON body. Error payloads MUST use the canonical error schema defined below.

---

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/alive` | Health probe returning a fixed status payload. |
| `GET` | `/parse-date-token` | Resolves a date token to a UTC timestamp normalised to `yyyy-MM-dd HH:mm:ssZ`. |
| `GET` | `/parse-dynamic-string-token` | Generates one or more strings based on the supplied dynamic string token. |

---

## `/alive`

### Request

```
GET /alive
```

### Successful response

- Status: `200 OK`
- Body:

```json
{
  "Status": "ALIVE-AND-KICKING"
}
```

### Error responses

Not applicable. The endpoint MUST return `200` while the API process is reachable.

---

## `/parse-date-token`

### Request

```
GET /parse-date-token?token=<DATE_TOKEN>
```

| Query parameter | Required | Description |
| --- | --- | --- |
| `token` | Yes | Date token string. Case-sensitive. See grammar below. |

The server MUST validate the token prior to parsing. Invalid tokens MUST NOT produce partial output.

### Successful response

- Status: `200 OK`
- Body schema:

```json
{
  "ParsedToken": "YYYY-MM-DD HH:mm:ssZ"
}
```

`ParsedToken` MUST be a string formatted exactly as `yyyy-MM-dd HH:mm:ssZ` (UTC offset suffix `Z`, zero seconds fractions).

### Error response

- Status: `400 Bad Request`
- Body schema:

```json
{
  "Error": "Invalid string token format"
}
```

Additional descriptive context MAY be appended after the canonical message, but the leading phrase MUST remain identical.

### Grammar

All date tokens comply with the following rules:

```
DATE_TOKEN  := "[" ANCHOR ADJUSTMENT* "]"
ANCHOR      := "TODAY" | "TOMORROW" | "YESTERDAY" | RANGE
ADJUSTMENT  := SIGN NUMBER UNIT
SIGN        := "+" | "-"
NUMBER      := (non-zero digit) (digit)*
UNIT        := "YEAR" | "MONTH" | "DAY"
RANGE       := RANGE_POINT "<->" RANGE_POINT | RANGE_POINT
RANGE_POINT := ("START" | "END") "-" MONTH "-" YYYY
MONTH       := "JANUARY" | "FEBRUARY" | ... | "DECEMBER"
YYYY        := four digits (0001-9999)
```

Rules:

- Brackets `[]` are mandatory.
- Every adjustment requires an explicit sign.
- When `RANGE` is specified, implementations MUST interpret `START` as the first day of the named month and `END` as the last day of the named month, both normalised to midnight UTC before applying adjustments (if any).
- Unknown anchors, invalid month names, malformed numbers, or missing signs MUST trigger the `400` error above.

---

## `/parse-dynamic-string-token`

### Request

```
GET /parse-dynamic-string-token?token=<STRING_TOKEN>
```

| Query parameter | Required | Description |
| --- | --- | --- |
| `token` | Yes | Dynamic string token string. Case-sensitive. See grammar below. |

### Successful response

- Status: `200 OK`
- Body schema:

```json
{
  "ParsedToken": "<generated string>"
}
```

If multiple lines are requested the response MUST join lines using `\r\n` (carriage return + line feed).

### Error response

- Status: `400 Bad Request`
- Body schema identical to the date endpoint:

```json
{
  "Error": "Invalid string token format"
}
```

### Grammar

```
STRING_TOKEN := "[" TYPE_LIST "-" LENGTH (LINES)? "]"
TYPE_LIST    := TYPE ("-" TYPE)*
TYPE         := "ALPHA" | "NUMERIC" | "PUNCTUATION" | "SPECIAL"
LENGTH       := POSITIVE_INT | "ALL"
LINES        := "-LINES-" POSITIVE_INT
POSITIVE_INT := (non-zero digit) (digit)*
```

Rules:

- Brackets `[]` are mandatory.
- Type identifiers are case-sensitive and must be one of the four allowed values.
- When `LENGTH` equals `ALL`, the implementation MUST emit each character from the assembled pool exactly once per line (order may vary).
- When `LENGTH` is numeric, it MUST be a positive integer and defines the number of characters per line.
- `LINES-n` (if provided) MUST use a positive integer; omit the clause to default to one line.
- An empty or malformed token MUST trigger the `400` response above.

### Canonical character pools

| Type | Characters |
| --- | --- |
| `ALPHA` | Uppercase `A-Z` and lowercase `a-z`. |
| `NUMERIC` | Digits `0-9`. |
| `PUNCTUATION` | `.,!?;:` |
| `SPECIAL` | `!@#$%^&*()_+[]{}|;:,.<>?~\`\/` |

These pools define the contract. Implementations MUST use the exact characters to ensure consistent results across environments. When combining multiple types, the pool MUST be the union of the constituent sets (duplicates eliminated before generation).

Line breaks MUST use `\r\n`. Each line MUST respect the requested length or, when `ALL` is used, contain the entire pool exactly once.

---

## Error Handling

All validation failures MUST return:

- HTTP `400 Bad Request`
- Body `{ "Error": "Invalid string token format" }` (with optional additional context appended after the base message).

Unexpected server faults SHOULD return `500 Internal Server Error` with a body of the form:

```json
{
  "Error": "Internal server error"
}
```

---

## Versioning & Compatibility

- Any change to the token grammar, canonical character pool, or response structure constitutes a breaking change and MUST increment the contract version.
- Implementations MUST expose Swagger/OpenAPI documents compatible with this contract at:
  - `/swagger/v1/swagger.json`
  - `/swagger/v1/swagger.yaml`
  - `/swagger/v1/json` (interactive UI)
- Automated tests and third-party integrations SHOULD rely exclusively on this document for endpoint behaviour and error semantics.

---

Maintain this file as the single source of truth. All codebases, tests, and documentation MUST treat deviations as defects unless otherwise ratified by contract version changes.

