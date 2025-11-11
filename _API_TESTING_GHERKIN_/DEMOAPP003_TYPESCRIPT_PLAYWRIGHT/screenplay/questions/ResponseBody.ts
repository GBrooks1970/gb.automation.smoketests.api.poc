import type { Question } from "../core/types";
import type { Actor } from "../actors/Actor";
import { LAST_RESPONSE } from "screenplay/support/memory-keys";
import type { APIResponse } from "@playwright/test";

export class ResponseBody implements Question<Record<string, unknown>> {
  static json(): ResponseBody {
    return new ResponseBody();
  }

  async answeredBy(actor: Actor): Promise<Record<string, unknown>> {
    const response = actor.recall<APIResponse>(LAST_RESPONSE);
    if (!response) {
      throw new Error("No response available for body assertion");
    }
    return (await response.json()) as Record<string, unknown>;
  }
}
