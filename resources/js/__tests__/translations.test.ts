import { describe, expect, it } from "vitest";
import { translations } from "@/utils/translations";

const rawModules = import.meta.glob("../**/*.{ts,tsx}", {
    eager: true,
    import: "default",
    query: "?raw",
}) as Record<string, string>;

const KEY_ACCESSOR = /(?<![A-Za-z0-9_])t\(\s*["']([a-zA-Z0-9_.-]+)["']/g;

function collectUsedKeys(): Set<string> {
    const keys = new Set<string>();
    for (const source of Object.values(rawModules)) {
        let match = KEY_ACCESSOR.exec(source);
        while (match !== null) {
            keys.add(match[1]);
            match = KEY_ACCESSOR.exec(source);
        }
    }
    return keys;
}

describe("translations dictionary", () => {
    it("has identical key sets between id and en", () => {
        const idKeys = Object.keys(translations.id).sort();
        const enKeys = Object.keys(translations.en).sort();
        expect(idKeys).toEqual(enKeys);
    });

    it("contains every t(\"...\") key used in the codebase in both locales", () => {
        const used = [...collectUsedKeys()];
        if (used.length === 0) {
            return;
        }
        const missingId = used.filter((k) => !(k in translations.id));
        const missingEn = used.filter((k) => !(k in translations.en));

        expect(missingId, `Keys used but missing in translations.id: ${missingId.join(", ")}`).toEqual([]);
        expect(missingEn, `Keys used but missing in translations.en: ${missingEn.join(", ")}`).toEqual([]);
    });
});