import { IWorldOptions, setDefaultTimeout, setWorldConstructor, Before, After } from "@cucumber/cucumber";
import { Actor } from "../actors/Actor";
import { CallAnApi } from "../abilities/CallAnApi";
import { UseTokenParsers } from "../abilities/UseTokenParsers";

const DEFAULT_API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";
const DEFAULT_STEP_TIMEOUT_MS = Number(process.env.CUCUMBER_TIMEOUT ?? 30_000);

setDefaultTimeout(DEFAULT_STEP_TIMEOUT_MS);

export class CustomWorld {
  public readonly actor: Actor;
  private apiAbility?: CallAnApi;

  constructor(_: IWorldOptions) {
    this.actor = new Actor("Playwright API Tester");
    this.actor.whoCan(new UseTokenParsers());
  }

  get apiBaseUrl(): string {
    return process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
  }

  async enableApiAbility(): Promise<void> {
    this.apiAbility = await CallAnApi.create(this.apiBaseUrl);
    this.actor.whoCan(this.apiAbility);
  }

  async disposeApiAbility(): Promise<void> {
    if (this.apiAbility) {
      await this.apiAbility.dispose();
      this.apiAbility = undefined;
    }
  }
}

setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  await this.enableApiAbility();
});

After(async function (this: CustomWorld) {
  await this.disposeApiAbility();
});
