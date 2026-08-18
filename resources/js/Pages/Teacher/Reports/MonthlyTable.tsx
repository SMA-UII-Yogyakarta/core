import { useLanguage } from "@/Contexts/LanguageContext";

interface StudentRecap {
    id: number;
    name: string;
    nis: string;
    masuk: number;
    izin: number;
    sakit: number;
    alpha: number;
}

interface RecapTableProps {
    students: StudentRecap[];
}

export default function MonthlyTable({ students }: RecapTableProps) {
    const { t } = useLanguage();

    const HEADERS = [
        { label: t("reports.headerNo"), align: "left" as const },
        { label: t("reports.headerName"), align: "left" as const, sticky: true },
        { label: t("reports.headerNis"), align: "left" as const },
        { label: t("reports.present"), align: "center" as const },
        { label: t("reports.sickPermission"), align: "center" as const },
        { label: t("reports.statusSick"), align: "center" as const },
        { label: t("reports.statusAbsent"), align: "center" as const },
    ];

    return (
        <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse font-inter min-w-[640px]">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            {HEADERS.map((h) => (
                                <th
                                    key={h.label}
                                    className={`px-4 py-3 text-${h.align} text-[12px] font-semibold text-text-muted uppercase tracking-wide ${
                                        h.sticky ? "max-xl:sticky max-xl:left-0 max-xl:z-10 max-xl:bg-background" : ""
                                    }`}
                                >
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-text-muted text-[13px] py-10">
                                    {t("reports.emptyMonthly")}
                                </td>
                            </tr>
                        ) : (
                            students.map((s, i) => (
                                <tr
                                    key={s.id}
                                    className="border-b border-border last:border-b-0 hover:bg-background transition-colors"
                                >
                                    <td className="px-4 py-3 text-[13px] text-text-muted">{i + 1}</td>
                                    <td className="px-4 py-3 text-[13px] font-bold text-text-primary max-xl:sticky max-xl:left-0 max-xl:bg-white max-xl:z-5">
                                        {s.name}
                                    </td>
                                    <td className="px-4 py-3 text-[13px] text-text-primary">{s.nis}</td>
                                    <td className="px-4 py-3 text-[13px] text-center text-green-600 font-semibold">
                                        {s.masuk}
                                    </td>
                                    <td
                                        className="px-4 py-3 text-[13px] text-center font-semibold"
                                        style={{ color: s.izin > 0 ? "#2E3391" : "#64748B" }}
                                    >
                                        {s.izin}
                                    </td>
                                    <td
                                        className="px-4 py-3 text-[13px] text-center font-semibold"
                                        style={{ color: s.sakit > 0 ? "#F59E0B" : "#64748B" }}
                                    >
                                        {s.sakit}
                                    </td>
                                    <td
                                        className="px-4 py-3 text-[13px] text-center font-semibold"
                                        style={{ color: s.alpha > 0 ? "#EF4444" : "#64748B" }}
                                    >
                                        {s.alpha}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden">
                {students.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-[13px]">
                        {t("reports.emptyMonthly")}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {students.map((s, i) => (
                            <div key={s.id} className="px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0 mb-2">
                                    <span className="text-[13px] text-text-muted shrink-0">{i + 1}</span>
                                    <div className="min-w-0">
                                        <p className="text-[14px] font-bold text-text-primary truncate">{s.name}</p>
                                        <p className="text-[12px] text-text-muted mt-0.5">NIS: {s.nis}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 ml-8">
                                    {[
                                        { label: t("reports.present"), value: s.masuk, color: "#10B981" },
                                        { label: t("reports.sickPermission"), value: s.izin, color: s.izin > 0 ? "#2E3391" : "#64748B" },
                                        { label: t("reports.statusSick"), value: s.sakit, color: s.sakit > 0 ? "#F59E0B" : "#64748B" },
                                        { label: t("reports.statusAbsent"), value: s.alpha, color: s.alpha > 0 ? "#EF4444" : "#64748B" },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="text-center">
                                            <p className="text-[16px] font-bold" style={{ color }}>
                                                {value}
                                            </p>
                                            <p className="text-[10px] text-text-muted uppercase">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
