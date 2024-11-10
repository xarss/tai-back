import { assertEquals } from "@std/assert";
import { askGPT } from "./services/gptS.js";

Deno.test("askGPT should return a string", async () => {
    const result = await askGPT("Hello, GPT!");
    assertEquals(typeof result, "string");
});