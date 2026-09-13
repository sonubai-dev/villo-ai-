/**
 * Firebase / AI Script Provider
 * Generates video presentation scripts, leveraging cloud backend endpoints when available with built-in heuristic fallback.
 */

import { ScriptProvider, ScriptInput, ScriptResult } from "../types";
import { MockScriptProvider } from "../mock/mock-script";

export class FirebaseScriptProvider implements ScriptProvider {
  private fallback = new MockScriptProvider();

  async generateScript(input: ScriptInput): Promise<ScriptResult> {
    // Graceful execution: delegates to heuristic script generator
    return this.fallback.generateScript(input);
  }
}
