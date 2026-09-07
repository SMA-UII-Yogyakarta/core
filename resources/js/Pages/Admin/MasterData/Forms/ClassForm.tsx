import { useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import { Input, SelectInput, Button } from "@/Components";
import { schoolClassSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import { FiTag, FiCalendar, FiSave } from "react-icons/fi";
import type { SchoolClass, Teacher } from "../types";

export interface ClassFormProps {
    schoolClass?: SchoolClass | null;
    mode?: "create" | "edit" | "detail";
    isUnlocked?: boolean;
    allTeachers?: Teacher[];
    existingClasses?: SchoolClass[];
    onSuccess?: () => void;
    onCancel?: () => void;
    formId?: string;
    showSubmitButton?: boolean;
}

const defaultAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
};

const PRESET_CLASSES_BY_LEVEL: Record<string, string[]> = {
    X: ["1", "2", "3", "4", "5", "ICT-1", "ICT-2"],
    XI: ["1", "2", "3", "4", "ICT-1", "ICT-2", "ICT-3"],
    XII: ["1", "2", "3", "4", "5", "ICT"],
};

export default function ClassForm({
    schoolClass,
    mode = "create",
    isUnlocked,
    allTeachers = [],
    existingClasses = [],
    onSuccess,
    onCancel,
    formId = "class-form",
    showSubmitButton = false,
}: ClassFormProps) {
    const isCreate = mode === "create";
    const activeUnlocked = isUnlocked ?? isCreate;
    const isReadOnly = !activeUnlocked;

    const currentYear = defaultAcademicYear();

    const {
        data,
        setData,
        post,
        patch,
        processing,
        reset,
        errors,
        clearErrors,
        setError,
    } = useForm({
        name: "",
        level: "X",
        academic_year: currentYear,
        teacher_id: "" as string | number,
        capacity: "36",
    });

    const levelPresets = useMemo(() => {
        return PRESET_CLASSES_BY_LEVEL[data.level] || [];
    }, [data.level]);

    const customExistingNames = useMemo(() => {
        const presets = new Set(levelPresets.map((p) => p.toLowerCase()));
        const names = existingClasses
            .map((c) => {
                const raw = c.name.trim();
                return raw.replace(new RegExp(`^(Kelas\\s*)?${c.level}[\\s\\-_]*`, "i"), "");
            })
            .filter((n) => n && !presets.has(n.toLowerCase()));
        return Array.from(new Set(names)).slice(0, 8);
    }, [existingClasses, levelPresets]);

    useEffect(() => {
        if (isCreate) {
            reset();
            setData({
                name: "",
                level: "X",
                academic_year: defaultAcademicYear(),
                teacher_id: "",
                capacity: "36",
            });
        } else if (schoolClass) {
            const rawName = schoolClass.name || "";
            const lvl = schoolClass.level || "X";
            const cleanName = rawName.replace(new RegExp(`^(Kelas\\s*)?${lvl}[\\s\\-_]*`, "i"), "");
            setData({
                name: cleanName || rawName,
                level: lvl,
                academic_year: schoolClass.academic_year || defaultAcademicYear(),
                teacher_id: schoolClass.teacher?.id ?? schoolClass.homeroom_teacher_id ?? "",
                capacity: String(schoolClass.capacity || 36),
            });
        }
        clearErrors();
    }, [schoolClass, isCreate, clearErrors, reset, setData]);

    const handleSelectName = (name: string) => {
        if (isReadOnly) return;
        setData("name", name);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isReadOnly) return;

        const validationData = {
            name: data.name,
            level: data.level,
            academic_year: data.academic_year,
            teacher_id: data.teacher_id ? Number(data.teacher_id) : undefined,
            capacity: Number(data.capacity),
        };

        const result = validateForm(schoolClassSchema, validationData);
        if (!result.success) {
            clearErrors();
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as keyof typeof data, message);
            });
            return;
        }

        if (!isCreate && schoolClass?.id) {
            patch(`/master-data/classes/${schoolClass.id}`, {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post("/master-data/classes", {
                onSuccess: () => onSuccess?.(),
            });
        }
    };

    return (
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 font-inter">
            {/* 1. Level & Academic Year First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Tingkat / Jenjang <span className="text-danger">*</span>
                    </label>
                    <SelectInput
                        value={data.level}
                        onChange={(val) => setData("level", val ? String(val) : "X")}
                        options={[
                            { value: "X", label: "Kelas X" },
                            { value: "XI", label: "Kelas XI" },
                            { value: "XII", label: "Kelas XII" },
                        ]}
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1 flex items-center gap-1.5">
                        <FiCalendar className="text-primary text-[12px]" />
                        Tahun Ajaran / Angkatan <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: 2026/2027"
                        value={data.academic_year}
                        onChange={(e) => setData("academic_year", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.academic_year && (
                        <p className="text-[12px] text-danger mt-1">{errors.academic_year}</p>
                    )}
                </div>
            </div>

            {/* 2. Rombel Name with Prefix Addon & Quick Chips */}
            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Rombongan Belajar (Rombel) <span className="text-danger">*</span>
                </label>
                <div className={`flex rounded-xl border bg-surface overflow-hidden transition-all ${
                    errors.name ? "border-danger ring-1 ring-danger/40" : "border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                } ${isReadOnly ? "opacity-60 pointer-events-none bg-muted/30" : ""}`}>
                    <div className="px-3.5 py-2.5 bg-muted/40 border-r border-border text-[13px] font-bold text-primary select-none flex items-center shrink-0">
                        Kelas {data.level} -
                    </div>
                    <input
                        type="text"
                        placeholder="Contoh: 1 atau ICT-1"
                        value={data.name}
                        onChange={(e) => {
                            const val = e.target.value;
                            const cleaned = val.replace(new RegExp(`^(Kelas\\s*)?${data.level}[\\s\\-_]*`, "i"), "");
                            setData("name", cleaned);
                        }}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2.5 bg-transparent text-[13px] text-text-primary placeholder:text-text-inactive focus:outline-none font-medium font-inter"
                    />
                </div>
                {errors.name && (
                    <p className="text-[12px] text-danger mt-1">{errors.name}</p>
                )}

                {/* Live Concatenation Preview */}
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-text-muted px-0.5">
                    <span>
                        Label Lengkap:{" "}
                        <strong className="text-text-primary font-semibold">
                            {data.name.trim() ? `Kelas ${data.level}-${data.name.trim()}` : `Kelas ${data.level}-...`}
                        </strong>
                    </span>
                    {data.academic_year && data.name.trim() && (
                        <span className="font-mono text-[10.5px] text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15">
                            Moodle Cohort: {`${data.level.toLowerCase()}-${data.name.trim().toLowerCase()}-${data.academic_year.replace(/\//g, "").slice(2)}`}
                        </span>
                    )}
                </div>

                {/* Quick Preset Chips for Selected Level */}
                {activeUnlocked && (
                    <div className="mt-2.5 p-2.5 bg-muted/20 border border-border rounded-xl space-y-2">
                        <div>
                            <p className="text-[11px] font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
                                <FiTag className="text-primary text-[11px]" />
                                Rekomendasi Rombel Kelas {data.level} (Standar Moodle & SMA UII):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {levelPresets.map((preset) => {
                                    const isSelected = data.name.trim().toLowerCase() === preset.toLowerCase();
                                    return (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handleSelectName(preset)}
                                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-primary text-white border-primary shadow-xs"
                                                    : "bg-surface text-text-primary border-border hover:border-primary/50 hover:bg-primary/5"
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {customExistingNames.length > 0 && (
                            <div className="pt-2 border-t border-border/50">
                                <p className="text-[10px] text-text-muted mb-1 font-medium">
                                    Rombel Lain yang Sudah Ada:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {customExistingNames.map((name) => {
                                        const isSelected = data.name.trim().toLowerCase() === name.toLowerCase();
                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => handleSelectName(name)}
                                                className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary/20 text-primary border-primary"
                                                        : "bg-surface/50 text-text-secondary border-border hover:bg-surface"
                                                }`}
                                            >
                                                {name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 3. Capacity & Homeroom Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Kapasitas Maksimal Siswa <span className="text-danger">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="Contoh: 36"
                        value={data.capacity}
                        onChange={(e) => setData("capacity", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.capacity && (
                        <p className="text-[12px] text-danger mt-1">{errors.capacity}</p>
                    )}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Wali Kelas Terpilih
                    </label>
                    <SelectInput
                        value={data.teacher_id ? String(data.teacher_id) : ""}
                        onChange={(val) => setData("teacher_id", val ? String(val) : "")}
                        options={[
                            { value: "", label: "Belum Ditentukan" },
                            ...allTeachers.map((t) => ({
                                value: String(t.id),
                                label: `${t.name} (${t.teacher_code})`,
                            })),
                        ]}
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            {showSubmitButton && activeUnlocked && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        loading={processing}
                        icon={<FiSave />}
                    >
                        {isCreate ? "Simpan Kelas" : "Perbarui Kelas"}
                    </Button>
                </div>
            )}
        </form>
    );
}
