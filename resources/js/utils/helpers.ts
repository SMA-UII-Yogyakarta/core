export function cn(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(" ");
}

export async function copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;
    try {
        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Fall back to document.execCommand if clipboard API fails or is restricted
    }

    try {
        if (typeof document !== "undefined") {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand("copy");
            document.body.removeChild(textArea);
            return successful;
        }
    } catch {
        // Ignore fallback errors
    }

    return false;
}

export function getPaginationRange(page: number, perPage: number, total: number) {
    const from = total > 0 ? (page - 1) * perPage + 1 : 0;
    const to = Math.min(page * perPage, total);
    return { from, to, total };
}

export const INDONESIAN_MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
] as const;

export function formatIndonesianDate(
    dateInput: string | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions,
): string {
    if (!dateInput) return "-";
    try {
        let date: Date;
        if (typeof dateInput === "string") {
            const cleanStr = dateInput.split(" ")[0].split("T")[0];
            date = new Date(cleanStr + "T00:00:00");
            if (isNaN(date.getTime())) {
                date = new Date(dateInput);
            }
        } else {
            date = dateInput;
        }
        if (isNaN(date.getTime())) return String(dateInput);

        return date.toLocaleDateString(
            "id-ID",
            options ?? {
                day: "numeric",
                month: "long",
                year: "numeric",
            },
        );
    } catch {
        return String(dateInput);
    }
}
