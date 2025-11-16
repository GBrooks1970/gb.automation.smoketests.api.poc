"""
FastAPI host for DEMOAPP004.

Endpoints implemented according to `tokenparser_api_contract.md`.
"""

from __future__ import annotations

import os

import yaml
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse, PlainTextResponse

from tokenparser.date_parser import DateTokenError, format_date_utc, parse_date_token
from tokenparser.dynamic_string_parser import (
    DynamicStringTokenError,
    generate_dynamic_string,
)

app = FastAPI(
    title="Token Parser API",
    version="1.0.0",
    description="Playwright+Python demo implementation of the Token Parser contract.",
)


@app.get("/alive")
async def alive():
    """Lightweight health probe."""
    return {"Status": "ALIVE-AND-KICKING"}


@app.get("/parse-date-token")
async def parse_date_token_endpoint(token: str = Query(..., min_length=1)):
    """
    Parse the supplied date token and return a UTC-normalised timestamp.
    """
    try:
        result = parse_date_token(token)
        return {"ParsedToken": format_date_utc(result)}
    except DateTokenError as exc:
        return JSONResponse(status_code=400, content={"Error": str(exc)})


@app.get("/parse-dynamic-string-token")
async def parse_dynamic_string_token_endpoint(token: str = Query(..., min_length=1)):
    """
    Generate one or more strings from the supplied dynamic string token.
    """
    try:
        parsed = generate_dynamic_string(token)
        return {"ParsedToken": parsed}
    except DynamicStringTokenError as exc:
        return JSONResponse(status_code=400, content={"Error": str(exc)})


def _openapi_json():
    """Helper to avoid recomputing the schema per request."""
    return app.openapi()


@app.get("/swagger/v1/json")
async def swagger_ui_json():
    """Serve the Swagger UI JSON for parity with other demos."""
    return JSONResponse(_openapi_json())


@app.get("/swagger/v1/swagger.json")
async def swagger_raw_json():
    return JSONResponse(_openapi_json())


@app.get("/swagger/v1/swagger.yaml")
async def swagger_raw_yaml():
    schema = yaml.safe_dump(_openapi_json())
    return PlainTextResponse(schema, media_type="application/x-yaml")


def run():
    """Entry point when invoking `python -m src.server`."""
    import uvicorn

    port = int(os.getenv("PORT", "3002"))
    uvicorn.run("src.server:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    run()
