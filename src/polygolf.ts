import compile from "../../src/common/compile";
import { getObjectiveFunc } from "../../src/common/objective";
import languages from "../../src/languages/languages";

globalThis.compile = compile;
globalThis.getObjectiveFunc = getObjectiveFunc;
globalThis.languages = languages;

// Node.js polyfill
globalThis.Buffer = {
  from(s: string, encoding: string) {
    return new TextEncoder().encode(s);
  },
  byteLength(s: string, encoding: string) {
    // return new TextEncoder().encode(s).length;
    let length = s.length;
    for (let i = length - 1; i >= 0; i--) {
      const code = s.charCodeAt(i);
      if (code > 0x7f) {
        length += code > 0x7ff ? 2 : 1;
        if (code >= 0xdc00 && code <= 0xdfff) i--; // surrogate
      }
    }
    return length;
  },
};
