import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiSave } from "react-icons/fi";
import { Button, DrawerHeaderActions } from "@/Components";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AppShell from "@/Layouts/AppShell";
import MasterData from "../MasterData";
import ClassForm from "./Forms/ClassForm";
import GuardianForm from "./Forms/GuardianForm";
import MobileImportPage from "./Forms/MobileImportPage";
import StudentForm from "./Forms/StudentForm";
import TeacherForm from "./Forms/TeacherForm";
import type { ClassOption, Guardian, PaginatedData, SchoolClass, Student, Teacher } from "./types";

interface MobileFormPageProps {
    mode: "create" | "edit" | "detail" | "import";
    tab: "students" | "teachers" | "class" | "guardians";
    item?: Student | Teacher | SchoolClass | Guardian | null;
    students?: PaginatedData<Student>;
    teachers?: PaginatedData<Teacher>;
    schoolClasses?: PaginatedData<SchoolClass>;
    guardians?: PaginatedData<Guardian>;
    classOptions?: ClassOption[];
    allGuardians?: { id: number; name: string }[];
    allTeachers?: Teacher[];
}

export default function MobileFormPage(props: MobileFormPageProps) {
    const {
        mode,
        tab,
        item,
        students,
        teachers,
        schoolClasses,
        guardians,
        classOptions = [],
        allGuardians = [],
        allTeachers = [],
    } = props;

    const isDesktop = useMediaQuery("(min-width: 640px)");
    const isCreate = mode === "create";
    const [isUnlocked, setIsUnlocked] = useState(() => isCreate || mode === "edit");

    const handleToggleUnlock = () => {
        if (isCreate) return;
        setIsUnlocked((prev) => !prev);
    };

    const handleBack = () => {
        router.visit(`/master-data?tab=${tab}`);
    };

    if (mode === "import" && !isDesktop) {
        return <MobileImportPage tab={tab} />;
    }

    const formMode = mode === "import" ? "create" : mode;

    if (isDesktop) {
        const normalizedTab = ((tab as string) === "classes" ? "class" : tab) as
            | "students"
            | "teachers"
            | "class"
            | "guardians";

        return (
            <MasterData
                activeTab={normalizedTab}
                students={students}
                teachers={teachers}
                schoolClasses={schoolClasses}
                guardians={guardians}
                classOptions={classOptions}
                allGuardians={allGuardians}
                allTeachers={allTeachers}
                initialCreateTab={mode === "create" ? normalizedTab : null}
                initialEditItem={mode === "edit" || mode === "detail" ? item : null}
                initialEditMode={mode === "edit" || mode === "detail" ? mode : null}
            />
        );
    }

    const getPageTitle = () => {
        const entityLabel =
            tab === "students" ? "Siswa" : tab === "teachers" ? "Guru" : tab === "class" ? "Kelas" : "Wali Murid";

        if (isCreate) return `Tambah ${entityLabel} Baru`;
        if (isUnlocked) return `Edit Data ${entityLabel}`;
        return `Detail Data ${entityLabel}`;
    };

    // Construct Copy Fields for DrawerHeaderActions parity
    const getCopyFields = () => {
        if (!item) return [];
        if (tab === "students") {
            const s = item as Student;
            return [
                { label: "NIS", value: s.nis },
                { label: "NISN", value: s.nisn },
                { label: "Nama Lengkap", value: s.name },
                { label: "Kelas", value: s.class?.name || "Belum Masuk Kelas" },
                { label: "Tahun Masuk", value: s.enrollment_year },
                { label: "Tanggal Lahir", value: s.birth_date },
                { label: "No. HP/WA", value: s.phone },
                {
                    label: "Wali Murid",
                    value: allGuardians.find((g) => g.id === s.guardian_id)?.name || "Belum Ada",
                },
                { label: "Alamat", value: s.address },
                { label: "Email", value: s.user?.email || "-" },
                { label: "Status", value: s.status || "Active" },
            ];
        }
        if (tab === "teachers") {
            const t = item as Teacher;
            return [
                { label: "Kode Guru / NIP", value: t.teacher_code },
                { label: "Nama Lengkap", value: t.name },
                { label: "Email", value: t.user?.email || "-" },
            ];
        }
        if (tab === "class") {
            const c = item as SchoolClass;
            return [
                { label: "Nama Kelas", value: c.name },
                { label: "Tingkat", value: `Kelas ${c.level}` },
                { label: "Tahun Ajaran", value: c.academic_year || "-" },
                { label: "Kapasitas", value: `${c.capacity || 36} Siswa` },
                { label: "Wali Kelas", value: c.teacher?.name || "Belum Ditentukan" },
            ];
        }
        if (tab === "guardians") {
            const g = item as Guardian;
            return [
                { label: "Nama Lengkap", value: g.name },
                { label: "No. HP/WA", value: g.phone || "-" },
                { label: "Alamat", value: g.address || "-" },
                { label: "Email Akun", value: g.user?.email || "-" },
            ];
        }
        return [];
    };

    const handleDelete = () => {
        if (!item?.id) return;
        const entityName = (item as { name?: string } | null)?.name || "Data";
        if (confirm(`Apakah Anda yakin ingin menghapus data ${entityName}?`)) {
            if (tab === "students") {
                router.delete(`/master-data/students/${item.id}`, { onSuccess: handleBack });
            } else if (tab === "teachers") {
                router.delete(`/master-data/teachers/${item.id}`, { onSuccess: handleBack });
            } else if (tab === "class") {
                router.delete(`/master-data/classes/${item.id}`, { onSuccess: handleBack });
            } else if (tab === "guardians") {
                router.delete(`/master-data/guardians/${item.id}`, { onSuccess: handleBack });
            }
        }
    };

    const headerActions = (
        <DrawerHeaderActions
            variant="header"
            mode={formMode}
            isCreate={isCreate}
            isUnlocked={isUnlocked}
            onToggleUnlock={handleToggleUnlock}
            hideUnlock={mode === "edit"}
            onDelete={item?.id ? handleDelete : undefined}
            copyFields={getCopyFields()}
            entityTitle={`Data ${(item as { name?: string } | null)?.name || ""}`}
        />
    );

    const formId = "mobile-masterdata-form";

    return (
        <AppShell
            title={getPageTitle()}
            onBack={handleBack}
            headerActions={headerActions}
            showNotificationBell={false}
            showBottomNav={false}
        >
            <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-full font-inter max-w-xl mx-auto space-y-4 pb-24"
            >
                {tab === "students" && (
                    <StudentForm
                        formId={formId}
                        student={item as Student}
                        mode={formMode}
                        isUnlocked={isUnlocked}
                        classOptions={classOptions}
                        allGuardians={allGuardians}
                        onSuccess={handleBack}
                    />
                )}

                {tab === "teachers" && (
                    <TeacherForm
                        formId={formId}
                        teacher={item as Teacher}
                        mode={formMode}
                        isUnlocked={isUnlocked}
                        onSuccess={handleBack}
                    />
                )}

                {tab === "class" && (
                    <ClassForm
                        formId={formId}
                        schoolClass={item as SchoolClass}
                        mode={formMode}
                        isUnlocked={isUnlocked}
                        allTeachers={allTeachers}
                        existingClasses={schoolClasses?.data || []}
                        onSuccess={handleBack}
                    />
                )}

                {tab === "guardians" && (
                    <GuardianForm
                        formId={formId}
                        guardian={item as Guardian}
                        mode={formMode}
                        isUnlocked={isUnlocked}
                        onSuccess={handleBack}
                    />
                )}
            </motion.div>

            {/* Sticky Full-Width Mobile Submit Bar (Only when unlocked) */}
            {isUnlocked && (
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 sm:hidden">
                    <div className="max-w-xl mx-auto">
                        <Button
                            type="submit"
                            form={formId}
                            variant="primary"
                            size="lg"
                            className="w-full justify-center font-bold text-[14.5px] shadow-sm py-3"
                            icon={<FiSave className="text-[17px]" />}
                        >
                            {isCreate ? "Simpan Data" : "Perbarui Data"}
                        </Button>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
