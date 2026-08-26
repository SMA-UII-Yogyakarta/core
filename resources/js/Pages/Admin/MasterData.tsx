import { router, useForm, usePage } from "@inertiajs/react";
import { useState, useMemo } from "react";
import {
    Input,
    SelectInput,
    StickyContainer,
    TabSwitcher,
    PageHeader,
    SearchBar,
    ActionButton,
    Button,
    StatusBadge,
    Table,
    Pagination,
    ImportModal,
    Drawer,
    FAB,
    Avatar,
    Checkbox,
    NativeSelect,
    ConfirmDialog,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import type { Column } from "@/Components/ui/Table";
import { studentSchema, teacherSchema, guardianSchema, schoolClassSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import { useScrollFabTrigger } from "@/hooks/useScrollFabTrigger";

// ─── Shared Types ───

interface SchoolClass {
    id: number;
    name: string;
    level: string;
    capacity: number;
    teacher: { id: number; name: string } | null;
    students_count: number;
}

interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    birth_date?: string;
    phone?: string | null;
    address?: string | null;
    enrollment_year?: number;
    guardian_id?: number | null;
    class: { id: number; name: string } | null;
    status: string;
    user?: { email?: string; username?: string } | null;
}

interface Teacher {
    id: number;
    teacher_code: string;
    name: string;
    user: { email?: string } | null;
    school_classes?: SchoolClass[];
}

interface Guardian {
    id: number;
    name: string;
    phone: string | null;
    address?: string | null;
    user: { email?: string } | null;
    students?: Student[];
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface SearchConfig {
    mode: "client" | "server";
    allData?: SchoolClass[];
}

interface ClassOption {
    id: number;
    name: string;
}

interface PageProps {
    students: PaginatedData<Student>;
    teachers?: PaginatedData<Teacher>;
    allTeachers?: Teacher[];
    schoolClasses?: PaginatedData<SchoolClass>;
    classOptions?: ClassOption[];
    allGuardians?: { id: number; name: string }[];
    guardians?: PaginatedData<Guardian>;
    searchConfig?: SearchConfig;
    activeTab?: string;
    filters: Record<string, string | undefined>;
}

const tabRoutes: Record<string, string> = {
    students: "/master-data?tab=students",
    teachers: "/master-data?tab=teachers",
    class: "/master-data?tab=class",
    guardians: "/master-data?tab=guardians",
};

const activeTabMap: Record<string, string> = {
    siswa: "students",
    guru: "teachers",
    classes: "class",
    wali: "guardians",
};

const tabs = [
    { key: "students", label: "Master Siswa" },
    { key: "teachers", label: "Master Guru" },
    { key: "class", label: "Master Kelas" },
    { key: "guardians", label: "Master Wali Murid" },
];

export default function MasterData({
    students,
    teachers,
    allTeachers,
    schoolClasses,
    classOptions = [],
    allGuardians = [],
    guardians,
    searchConfig,
    activeTab,
    filters,
}: PageProps) {
    const { triggerRef, showFab } = useScrollFabTrigger();
    const [currentTab, setCurrentTab] = useState(activeTabMap[activeTab ?? ""] ?? "students");
    const [prevActiveTab, setPrevActiveTab] = useState(activeTab);

    if (activeTab !== prevActiveTab) {
        setPrevActiveTab(activeTab);
        const matchedTab = activeTabMap[activeTab ?? ""];
        if (matchedTab) {
            setCurrentTab(matchedTab);
        }
    }

    const [search, setSearch] = useState(filters.search ?? "");
    const [classFilter, setClassFilter] = useState(filters.class_id ?? "");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopyInfo = (key: string, text: string) => {
        const performCopy = async () => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
            } catch {
                // Fallback to execCommand below
            }

            try {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.left = "-999999px";
                textarea.style.top = "-999999px";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const successful = document.execCommand("copy");
                textarea.remove();
                return successful;
            } catch (err) {
                console.error("Copy failed:", err);
                return false;
            }
        };

        performCopy().then((success) => {
            if (success) {
                setCopiedKey(key);
                setTimeout(() => setCopiedKey(null), 2000);
            }
        });
    };

    // Confirm Dialog State
    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        entity: string | null;
        ids: number | number[] | null;
        label: string;
    }>({ open: false, entity: null, ids: null, label: '' });

    // Class Drawer State
    const [classDrawer, setClassDrawer] = useState<{ open: boolean; mode: 'create' | 'edit' }>({ open: false, mode: 'create' });


    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importEntity, setImportEntity] = useState<"students" | "teachers" | "classes" | "guardians">("students");

    // Student create / edit / detail
    type StudentModalMode = "create" | "edit" | "detail" | null;
    const [studentModal, setStudentModal] = useState<StudentModalMode>(null);
    const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

    const allClasses = useMemo(() => searchConfig?.allData || [], [searchConfig?.allData]);

    const filteredClasses = useMemo(() => {
        if (searchConfig?.mode === "client") {
            const q = search.toLowerCase();
            return allClasses.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.teacher?.name?.toLowerCase().includes(q),
            );
        }
        return schoolClasses?.data || [];
    }, [allClasses, search, searchConfig?.mode, schoolClasses?.data]);

    // Class form (create + edit)
    const [editingClassId, setEditingClassId] = useState<number | null>(null);
    const {
        data: formData,
        setData: setFormData,
        post,
        patch,
        processing,
        reset,
        setError: setClassError,
        clearErrors: clearClassErrors,
        errors: classErrors,
    } = useForm({
        name: "",
        teacher_id: null as number | null,
        capacity: "",
        level: "X",
    });

    const studentFormHelper = useForm({
        nis: "",
        nisn: "",
        name: "",
        class_id: "" as string | number,
        birth_date: "",
        phone: "",
        address: "",
        enrollment_year: new Date().getFullYear(),
        guardian_id: "" as string | number,
        email: "",
        password: "",
        status: "Active",
    });
    const {
        data: studentForm,
        setData: setStudentForm,
        post: postStudent,
        patch: patchStudent,
        processing: studentProcessing,
        reset: resetStudent,
        errors: studentErrors,
        clearErrors: clearStudentErrors,
        transform: transformStudent,
    } = studentFormHelper;

    // Teacher form
    type TeacherModalMode = "create" | "edit" | "detail" | null;
    const [teacherModal, setTeacherModal] = useState<TeacherModalMode>(null);
    const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
    const teacherFormHelper = useForm({
        teacher_code: "",
        name: "",
        email: "",
        password: "",
    });
    const {
        data: teacherForm,
        setData: setTeacherForm,
        post: postTeacher,
        patch: patchTeacher,
        processing: teacherProcessing,
        reset: resetTeacher,
        errors: teacherErrors,
        clearErrors: clearTeacherErrors,
    } = teacherFormHelper;

    // Guardian form
    type GuardianModalMode = "create" | "edit" | "detail" | null;
    const [guardianModal, setGuardianModal] = useState<GuardianModalMode>(null);
    const [editingGuardianId, setEditingGuardianId] = useState<number | null>(null);
    const guardianFormHelper = useForm({
        name: "",
        phone: "",
        address: "",
        email: "",
        password: "",
    });
    const {
        data: guardianForm,
        setData: setGuardianForm,
        post: postGuardian,
        patch: patchGuardian,
        processing: guardianProcessing,
        reset: resetGuardian,
        errors: guardianErrors,
        clearErrors: clearGuardianErrors,
    } = guardianFormHelper;

    const { errors } = usePage().props as { errors: Record<string, string> };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;
        setDeleteConfirm({
            open: true,
            entity: 'students/bulk-destroy',
            ids: selectedIds,
            label: `${selectedIds.length} siswa yang terpilih`,
        });
    };

    const openCreateStudent = () => {
        resetStudent();
        clearStudentErrors();
        setEditingStudentId(null);
        setStudentForm({
            nis: "",
            nisn: "",
            name: "",
            class_id: classFilter || "",
            birth_date: "",
            phone: "",
            address: "",
            enrollment_year: new Date().getFullYear(),
            guardian_id: "",
            email: "",
            password: "",
            status: "Active",
        });
        setStudentModal("create");
    };

    const openDetailStudent = (s: Student) => {
        clearStudentErrors();
        setEditingStudentId(s.id);
        setStudentForm({
            nis: s.nis,
            nisn: s.nisn,
            name: s.name,
            class_id: s.class?.id ?? "",
            birth_date: s.birth_date ?? "",
            phone: s.phone ?? "",
            address: s.address ?? "",
            enrollment_year: s.enrollment_year ?? new Date().getFullYear(),
            guardian_id: s.guardian_id ?? "",
            email: s.user?.email ?? "",
            password: "",
            status: s.status === "Inactive" ? "Inactive" : "Active",
        });
        setStudentModal("detail");
    };

    const closeStudentModal = () => {
        setStudentModal(null);
        setEditingStudentId(null);
        resetStudent();
        clearStudentErrors();
    };

    const openCreateTeacher = () => {
        resetTeacher();
        clearTeacherErrors();
        setEditingTeacherId(null);
        setTeacherModal("create");
    };

    const openDetailTeacher = (t: Teacher) => {
        clearTeacherErrors();
        setEditingTeacherId(t.id);
        setTeacherForm({
            teacher_code: t.teacher_code,
            name: t.name,
            email: t.user?.email ?? "",
            password: "",
        });
        setTeacherModal("detail");
    };

    const closeTeacherModal = () => {
        setTeacherModal(null);
        setEditingTeacherId(null);
        resetTeacher();
        clearTeacherErrors();
    };

    const submitTeacher = () => {
        if (teacherModal === "detail") return;
        clearTeacherErrors();

        const valid = validateForm(teacherSchema, teacherForm);
        if (!valid.success) {
            (Object.keys(valid.errors) as (keyof typeof teacherForm)[]).forEach((key) => {
                const msg = valid.errors[key];
                if (msg) teacherFormHelper.setError(key, msg);
            });
            return;
        }

        const opts = {
            preserveScroll: true,
            onSuccess: () => closeTeacherModal(),
        };
        if (teacherModal === "create") {
            postTeacher("/master-data/teachers", opts);
        } else if (teacherModal === "edit" && editingTeacherId) {
            patchTeacher(`/master-data/teachers/${editingTeacherId}`, opts);
        }
    };

    const openCreateGuardian = () => {
        resetGuardian();
        clearGuardianErrors();
        setEditingGuardianId(null);
        setGuardianModal("create");
    };

    const openDetailGuardian = (g: Guardian) => {
        clearGuardianErrors();
        setEditingGuardianId(g.id);
        setGuardianForm({
            name: g.name,
            phone: g.phone ?? "",
            address: g.address ?? "",
            email: g.user?.email ?? "",
            password: "",
        });
        setGuardianModal("detail");
    };

    const closeGuardianModal = () => {
        setGuardianModal(null);
        setEditingGuardianId(null);
        resetGuardian();
        clearGuardianErrors();
    };

    const submitGuardian = () => {
        if (guardianModal === "detail") return;
        clearGuardianErrors();

        const valid = validateForm(guardianSchema, guardianForm);
        if (!valid.success) {
            (Object.keys(valid.errors) as (keyof typeof guardianForm)[]).forEach((key) => {
                const msg = valid.errors[key];
                if (msg) guardianFormHelper.setError(key, msg);
            });
            return;
        }

        const opts = {
            preserveScroll: true,
            onSuccess: () => closeGuardianModal(),
        };
        if (guardianModal === "create") {
            postGuardian("/master-data/guardians", opts);
        } else if (guardianModal === "edit" && editingGuardianId) {
            patchGuardian(`/master-data/guardians/${editingGuardianId}`, opts);
        }
    };

    const submitStudent = () => {
        if (studentModal === "detail") return;
        clearStudentErrors();

        const valid = validateForm(studentSchema, studentForm);
        if (!valid.success) {
            (Object.keys(valid.errors) as (keyof typeof studentForm)[]).forEach((key) => {
                const msg = valid.errors[key];
                if (msg) studentFormHelper.setError(key, msg);
            });
            return;
        }

        transformStudent((data) => ({
            ...data,
            class_id: data.class_id ? Number(data.class_id) : null,
            guardian_id: data.guardian_id ? Number(data.guardian_id) : null,
            enrollment_year: Number(data.enrollment_year),
            phone: data.phone || null,
            address: data.address || null,
            email: data.email || null,
            password: data.password || undefined,
        }));

        const opts = {
            preserveScroll: true,
            onSuccess: () => closeStudentModal(),
        };

        if (studentModal === "create") {
            postStudent("/master-data", opts);
            return;
        }
        if (studentModal === "edit" && editingStudentId) {
            patchStudent(`/master-data/students/${editingStudentId}`, opts);
        }
    };

    const handleCreateClass = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        clearClassErrors();
        const valid = validateForm(schoolClassSchema, formData);
        if (!valid.success) {
            (Object.keys(valid.errors) as (keyof typeof formData)[]).forEach((key) => {
                const msg = valid.errors[key];
                if (msg) setClassError(key, msg);
            });
            return;
        }

        if (editingClassId) {
            patch(`/master-data/classes/${editingClassId}`, {
                onSuccess: () => {
                    reset();
                    setEditingClassId(null);
                    setClassDrawer({ open: false, mode: 'create' });
                },
            });
            return;
        }
        post("/master-data/classes", {
            onSuccess: () => {
                reset();
                setClassDrawer({ open: false, mode: 'create' });
            },
        });
    };

    const openEditClass = (c: SchoolClass) => {
        setEditingClassId(c.id);
        setFormData({
            name: c.name,
            teacher_id: c.teacher?.id ?? null,
            capacity: String(c.capacity ?? ""),
            level: c.level || "X",
        });
        setClassDrawer({ open: true, mode: 'edit' });
    };

    const openCreateClass = () => {
        setEditingClassId(null);
        reset();
        clearClassErrors();
        setClassDrawer({ open: true, mode: 'create' });
    };

    const applyClassFilter = (classId: string) => {
        setClassFilter(classId);
        router.get(
            "/master-data",
            {
                search: search || undefined,
                class_id: classId || undefined,
            },
            { preserveState: true },
        );
    };

    const switchTab = (tab: string) => {
        setCurrentTab(tab);
        setSelectedIds([]);
        router.get(tabRoutes[tab] ?? "/master-data", {}, { preserveState: true });
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        if (searchConfig?.mode !== "client" || currentTab !== "class") {
            router.get(
                tabRoutes[currentTab] ?? "/master-data",
                { search: value || undefined },
                { preserveState: true },
            );
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(search);
    };

    const handleDelete = (entity: string, id: number) => {
        setDeleteConfirm({
            open: true,
            entity,
            ids: id,
            label: "data ini",
        });
    };
    
    const handleConfirmedDelete = () => {
        if (!deleteConfirm.entity || !deleteConfirm.ids) return;
        
        if (Array.isArray(deleteConfirm.ids)) {
            router.post(
                `/master-data/${deleteConfirm.entity}`,
                { ids: deleteConfirm.ids },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                        setDeleteConfirm({ open: false, entity: null, ids: null, label: '' });
                    },
                }
            );
        } else {
            router.delete(`/master-data/${deleteConfirm.entity}/${deleteConfirm.ids}`, {
                preserveState: true,
                onSuccess: () => setDeleteConfirm({ open: false, entity: null, ids: null, label: '' }),
            });
        }
    };

    // ─── Student Columns ───

    const allSelected = students?.data?.length > 0 && selectedIds.length === students.data.length;
    const someSelected = students?.data?.length > 0 && selectedIds.length > 0 && !allSelected;

    const studentColumns: Column<Student>[] = [
        {
            key: "select",
            header: (
                <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds(students.data.map((s) => s.id));
                        } else {
                            setSelectedIds([]);
                        }
                    }}
                />
            ),
            render: (s) => (
                <Checkbox
                    checked={selectedIds.includes(s.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, s.id]);
                        } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== s.id));
                        }
                    }}
                />
            ),
            className: "w-10",
        },
        {
            key: "identity",
            header: "Identitas Nomor",
            render: (s) => (
                <div>
                    <div className="font-semibold text-text-primary">{s.nis}</div>
                    <div className="text-[12px] font-medium text-text-inactive">NISN: {s.nisn}</div>
                </div>
            ),
        },
        {
            key: "name",
            header: "Nama Siswa",
            render: (s) => (
                <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={s.name} size="xs" variant="primary" />
                    <div className="font-semibold text-primary truncate whitespace-nowrap max-w-[220px] sm:max-w-[300px]" title={s.name}>
                        {s.name}
                    </div>
                </div>
            ),
            className: "whitespace-nowrap min-w-[200px]",
        },
        {
            key: "class",
            header: "Kelas",
            render: (s) => (
                s.class?.name ? (
                    <span className="flex items-center gap-1.5 font-medium text-text-secondary whitespace-nowrap">
                        <i className="fas fa-chalkboard-teacher text-[13px] text-primary/70" />
                        {s.class.name}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-warning-bg text-warning border border-warning/20 whitespace-nowrap">
                        <i className="fas fa-exclamation-circle text-[10px] text-warning" />
                        Belum Ada Kelas
                    </span>
                )
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "status",
            header: "Status",
            render: (s) => {
                const isActive = s.status === "Active" || s.status === "active";
                return (
                    <StatusBadge variant={isActive ? "active" : "inactive"} label={isActive ? "AKTIF" : "NON-AKTIF"} />
                );
            },
            className: "text-center whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Aksi",
            render: (s) => (
                <div className="flex gap-1.5 justify-center">
                    <ActionButton variant="detail" icon="fa-eye" label="Detail & Kelola" iconOnly onClick={() => openDetailStudent(s)} />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        iconOnly
                        onClick={() => handleDelete("students", s.id)}
                    />
                </div>
            ),
            className: "text-center whitespace-nowrap w-px",
        },
    ];

    // ─── Teacher Columns ───

    const teacherColumns: Column<Teacher>[] = [
        {
            key: "teacher_code",
            header: "Kode Guru",
            render: (t) => <p className="font-semibold text-text-primary">{t.teacher_code}</p>,
        },
        {
            key: "name",
            header: "Nama Guru",
            render: (t) => (
                <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={t.name} size="xs" variant="accent" />
                    <p className="font-semibold text-primary truncate whitespace-nowrap max-w-[220px] sm:max-w-[300px]" title={t.name}>{t.name}</p>
                </div>
            ),
            className: "whitespace-nowrap min-w-[200px]",
        },
        {
            key: "email",
            header: "Email",
            render: (t) => t.user?.email ?? "-",
        },
        {
            key: "classes",
            header: "Kelas Diampu",
            render: (t) => t.school_classes?.map((c) => c.name).join(", ") ?? "-",
        },
        {
            key: "actions",
            header: "Aksi",
            render: (t) => (
                <div className="flex gap-1.5 justify-center">
                    <ActionButton variant="detail" icon="fa-eye" label="Detail & Kelola" iconOnly onClick={() => openDetailTeacher(t)} />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        iconOnly
                        onClick={() => handleDelete("teachers", t.id)}
                    />
                </div>
            ),
            className: "text-center whitespace-nowrap w-px",
        },
    ];

    // ─── SchoolClass Columns ───

    const classColumns: Column<SchoolClass>[] = [
        {
            key: "name",
            header: "Nama Kelas",
            render: (c) => <span className="font-semibold text-primary">{c.name}</span>,
        },
        {
            key: "teacher",
            header: "Wali Kelas Terdaftar",
            render: (c) => c.teacher?.name ?? "—",
        },
        {
            key: "students_count",
            header: "Jumlah Siswa",
            render: (c) => {
                const count = c.students_count ?? 0;
                if (count === 0) {
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-danger-bg text-danger text-[12px] font-bold">
                            Kosong (0)
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-text-primary text-[12px] font-semibold">
                        {count}/{c.capacity}
                    </span>
                );
            },
            className: "text-center whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Aksi",
            render: (c) => (
                <div className="flex gap-1.5 justify-center">
                    <ActionButton variant="detail" icon="fa-eye" label="Detail & Kelola" iconOnly onClick={() => openEditClass(c)} />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        iconOnly
                        onClick={() => handleDelete("classes", c.id)}
                    />
                </div>
            ),
            className: "text-center whitespace-nowrap w-px",
        },
    ];

    // ─── Guardian Columns ───

    const guardianColumns: Column<Guardian>[] = [
        {
            key: "name",
            header: "Nama Wali",
            render: (w) => (
                <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={w.name} size="xs" variant="accent" />
                    <p className="font-semibold text-primary truncate whitespace-nowrap max-w-[220px] sm:max-w-[300px]" title={w.name}>{w.name}</p>
                </div>
            ),
            className: "whitespace-nowrap min-w-[200px]",
        },
        {
            key: "phone",
            header: "No. Telepon",
            render: (w) => w.phone ?? "-",
        },
        {
            key: "email",
            header: "Email",
            render: (w) => w.user?.email ?? "-",
        },
        {
            key: "students",
            header: "Anak",
            render: (w) => w.students?.map((s) => s.name).join(", ") ?? "-",
        },
        {
            key: "actions",
            header: "Aksi",
            render: (w) => (
                <div className="flex gap-1.5 justify-center">
                    <ActionButton variant="detail" icon="fa-eye" label="Detail & Kelola" iconOnly onClick={() => openDetailGuardian(w)} />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        iconOnly
                        onClick={() => handleDelete("guardians", w.id)}
                    />
                </div>
            ),
            className: "text-center whitespace-nowrap w-px",
        },
    ];

    // ─── Render ───

    return (
        <AppShell title="Manajemen Data Master">
            <div>
                <PageHeader
                    title="Manajemen Data Master"
                    description="Kelola entitas data utama institusi beserta akses kredensial SSO."
                />

                {/* Tabs */}
                <StickyContainer>
                    <TabSwitcher
                        tabs={tabs}
                        activeKey={currentTab}
                        onChange={(key: string) => switchTab(key as "students" | "teachers" | "classes" | "users")}
                    />
                </StickyContainer>

                {/* ── Siswa Tab ── */}
                {currentTab === "students" && students?.data && (
                    <div>
                        <Toolbar
                            triggerRef={triggerRef}
                            search={search}
                            setSearch={setSearch}
                            handleSearch={handleSearchSubmit}
                            placeholder="Cari nama, NIS, atau NISN..."
                            selectedCount={selectedIds.length}
                            onDeleteSelected={handleDeleteSelected}
                            classFilter={classFilter}
                            classOptions={classOptions}
                            onApplyClassFilter={applyClassFilter}
                            onImport={() => {
                                setImportEntity("students");
                                setImportModalOpen(true);
                            }}
                            onAdd={openCreateStudent}
                        />

                        <section className="mt-4">
                            <Table columns={studentColumns} data={students.data} keyExtractor={(s: Student) => s.id} />
                        </section>

                        {students.total > 0 && (
                            <div className="mt-3">
                                <Pagination
                                    currentPage={students.current_page}
                                    totalPages={students.last_page}
                                    totalItems={students.total}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/master-data",
                                            {
                                                page,
                                                search: search || undefined,
                                                class_id: classFilter || undefined,
                                                tab: "students",
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        )}

                        {/* Mobile FAB - only visible when toolbar action button has scrolled off-screen */}
                        <FAB
                            onClick={openCreateStudent}
                            label="Tambah Siswa"
                            dusk="fab-create-student"
                            className="lg:hidden"
                            show={showFab}
                        />
                    </div>
                )}

                {/* ── Guru Tab ── */}
                {currentTab === "teachers" && teachers?.data && (
                    <div>
                        <Toolbar
                            search={search}
                            setSearch={setSearch}
                            handleSearch={handleSearchSubmit}
                            placeholder="Cari nama atau kode guru..."
                            onImport={() => {
                                setImportEntity("teachers");
                                setImportModalOpen(true);
                            }}
                            onAdd={openCreateTeacher}
                        />
                        <section className="mt-4">
                            <Table columns={teacherColumns} data={teachers.data} keyExtractor={(t: Teacher) => t.id} />
                        </section>
                        {teachers.total > 0 && (
                            <div className="mt-3">
                                <Pagination
                                    currentPage={teachers.current_page}
                                    totalPages={teachers.last_page}
                                    totalItems={teachers.total}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/master-data",
                                            {
                                                page,
                                                tab: "teachers",
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── Kelas Tab ── */}
                {currentTab === "class" && schoolClasses?.data && (
                    <div className="flex flex-col gap-4 items-start">
                        <div className="w-full">
                            <section className="flex flex-col gap-4">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <SearchBar
                                            value={search}
                                            onChange={setSearch}
                                            onSearch={handleSearch}
                                            autoSearch={searchConfig?.mode !== "client"}
                                            debounceMs={300}
                                            placeholder="Cari nama kelas..."
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={openCreateClass}
                                        icon={<i className="fas fa-plus text-[12px]" />}
                                    >
                                        Buat Kelas Baru
                                    </Button>
                                </div>
                                <Table
                                    columns={classColumns}
                                    data={searchConfig?.mode === "client" ? filteredClasses : schoolClasses.data}
                                    keyExtractor={(c: SchoolClass) => c.id}
                                />
                                {searchConfig?.mode !== "client" && schoolClasses.total > 0 && (
                                    <Pagination
                                        currentPage={schoolClasses.current_page}
                                        totalPages={schoolClasses.last_page}
                                        totalItems={schoolClasses.total}
                                        onPageChange={(page) =>
                                            router.get(
                                                "/master-data",
                                                {
                                                    page,
                                                    tab: "class",
                                                },
                                                { preserveState: true },
                                            )
                                        }
                                    />
                                )}
                            </section>
                        </div>

                    </div>
                )}

                {/* ── Wali Tab ── */}
                {currentTab === "guardians" && guardians?.data && (
                    <div>
                        <Toolbar
                            search={search}
                            setSearch={setSearch}
                            handleSearch={handleSearchSubmit}
                            placeholder="Cari nama wali murid..."
                            onImport={() => {
                                setImportEntity("guardians");
                                setImportModalOpen(true);
                            }}
                            onAdd={openCreateGuardian}
                        />
                        <section className="mt-4">
                            <Table
                                columns={guardianColumns}
                                data={guardians.data}
                                keyExtractor={(g: Guardian) => g.id}
                            />
                        </section>
                        {guardians.total > 0 && (
                            <div className="mt-3">
                                <Pagination
                                    currentPage={guardians.current_page}
                                    totalPages={guardians.last_page}
                                    totalItems={guardians.total}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/master-data",
                                            {
                                                page,
                                                tab: "guardians",
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}
                <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} entity={importEntity} />

                <ConfirmDialog
                    open={deleteConfirm.open}
                    onClose={() => setDeleteConfirm({ open: false, entity: null, ids: null, label: '' })}
                    onConfirm={handleConfirmedDelete}
                    title="Hapus Data"
                    message={`Yakin hapus ${deleteConfirm.label}? Aksi ini tidak bisa dibatalkan.`}
                    confirmLabel="Ya, Hapus"
                    variant="danger"
                />

                <Drawer
                    open={classDrawer.open}
                    onClose={() => setClassDrawer({ open: false, mode: 'create' })}
                    title={classDrawer.mode === 'create' ? "Tambah Kelas" : "Kelola & Detail Kelas"}
                    width="md"
                    onSubmit={handleCreateClass}
                    submitLabel={classDrawer.mode === 'create' ? "Simpan" : "Perbarui"}
                    loading={processing}
                    headerActions={
                        classDrawer.mode === 'edit' && editingClassId ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const tch = (allTeachers || []).find((t) => t.id === formData.teacher_id)?.name || "Belum Ada Wali";
                                        handleCopyInfo(
                                            "class",
                                            `Kelas: ${formData.name} | Tingkat: ${formData.level} | Kapasitas: ${formData.capacity} | Wali Kelas: ${tch}`
                                        );
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
                                    title="Salin Informasi Kelas"
                                >
                                    <i className={copiedKey === "class" ? "fas fa-check text-success text-[10px]" : "far fa-copy text-[10px]"} />
                                    <span>{copiedKey === "class" ? "Tersalin!" : "Salin"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const id = editingClassId;
                                        setClassDrawer({ open: false, mode: 'create' });
                                        handleDelete("classes", id);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-danger bg-danger-bg border border-danger-light hover:bg-danger-light transition-colors cursor-pointer"
                                    title="Hapus Kelas Ini"
                                >
                                    <i className="fas fa-trash text-[10px]" />
                                    <span>Hapus</span>
                                </button>
                            </div>
                        ) : undefined
                    }
                >
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            <SelectInput
                                label="Tingkat"
                                options={[
                                    { value: "X", label: "X" },
                                    { value: "XI", label: "XI" },
                                    { value: "XII", label: "XII" },
                                ]}
                                value={formData.level}
                                onChange={(val) => setFormData("level", (val as string) ?? "X")}
                                className="col-span-1"
                                error={errors.level}
                            />
                            <Input
                                label="Nama / Kode Kelas"
                                type="text"
                                id="kode_kelas"
                                value={formData.name}
                                onChange={(e) => setFormData("name", e.target.value)}
                                description="Nama kelas harus unik."
                                className="col-span-2"
                                error={classErrors.name}
                            />
                        </div>
                        <SelectInput
                            label="Tugaskan Wali Kelas"
                            placeholder="-- Pilih Wali Kelas --"
                            description="Guru yang sudah menjadi Wali Kelas tidak akan muncul di sini."
                            options={(allTeachers || []).map((t) => ({
                                value: t.id,
                                label: t.name,
                            }))}
                            value={formData.teacher_id}
                            onChange={(val) =>
                                setFormData("teacher_id", typeof val === "number" ? val : null)
                            }
                            error={classErrors.teacher_id}
                        />
                        <Input
                            label="Kapasitas Maksimal"
                            type="number"
                            id="kapasitas"
                            min="0"
                            numeric
                            value={formData.capacity}
                            onChange={(e) => setFormData("capacity", e.target.value)}
                            error={classErrors.capacity}
                        />
                    </div>
                </Drawer>

                {/* Student Create / Edit / Detail Drawer */}
                <Drawer
                    open={studentModal !== null}
                    onClose={closeStudentModal}
                    title={
                        studentModal === "create"
                            ? "Tambah Data Siswa"
                            : studentModal === "edit"
                              ? "Edit Data Siswa"
                              : "Detail Data Siswa"
                    }
                    width="xl"
                    onSubmit={studentModal === "detail" ? undefined : submitStudent}
                    submitLabel={studentModal === "create" ? "Simpan" : "Perbarui"}
                    loading={studentProcessing}
                    headerActions={
                        studentModal === "detail" ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const cls = classOptions.find((c) => String(c.id) === String(studentForm.class_id))?.name || "Belum Masuk Kelas";
                                        handleCopyInfo(
                                            "student",
                                            `Siswa: ${studentForm.name} | NIS: ${studentForm.nis} | NISN: ${studentForm.nisn} | Kelas: ${cls} | Telepon: ${studentForm.phone || "-"}`
                                        );
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
                                    title="Salin Informasi Siswa"
                                >
                                    <i className={copiedKey === "student" ? "fas fa-check text-success text-[10px]" : "far fa-copy text-[10px]"} />
                                    <span>{copiedKey === "student" ? "Tersalin!" : "Salin"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStudentModal("edit")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                                    title="Unlock Edit Form"
                                >
                                    <i className="fas fa-lock-open text-[10px]" />
                                    <span>Edit</span>
                                </button>
                                {editingStudentId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const id = editingStudentId;
                                            closeStudentModal();
                                            handleDelete("students", id);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-danger bg-danger-bg border border-danger-light hover:bg-danger-light transition-colors cursor-pointer"
                                        title="Hapus Siswa Ini"
                                    >
                                        <i className="fas fa-trash text-[10px]" />
                                        <span>Hapus</span>
                                    </button>
                                )}
                            </div>
                        ) : studentModal === "edit" ? (
                            <button
                                type="button"
                                onClick={() => setStudentModal("detail")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
                                title="Mode Read-Only"
                            >
                                <i className="fas fa-lock text-[10px]" />
                                <span>Kunci Baca</span>
                            </button>
                        ) : undefined
                    }
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="NIS *"
                            value={studentForm.nis}
                            disabled={studentModal === "detail"}
                            onChange={(e) => setStudentForm("nis", e.target.value)}
                            error={studentErrors.nis}
                        />
                        <Input
                            label="NISN *"
                            value={studentForm.nisn}
                            disabled={studentModal === "detail"}
                            onChange={(e) => setStudentForm("nisn", e.target.value)}
                            error={studentErrors.nisn}
                        />
                        <Input
                            label="Nama Lengkap *"
                            value={studentForm.name}
                            disabled={studentModal === "detail"}
                            onChange={(e) => setStudentForm("name", e.target.value)}
                            error={studentErrors.name}
                            className="sm:col-span-2"
                        />
                        <SelectInput
                            label="Kelas (Opsional)"
                            value={studentForm.class_id}
                            disabled={studentModal === "detail"}
                            onChange={(val) => setStudentForm("class_id", val as string)}
                            options={[
                                { value: "", label: "— Belum Masuk Kelas —" },
                                ...classOptions.map((c) => ({ value: c.id, label: c.name }))
                            ]}
                            error={studentErrors.class_id}
                        />
                        <Input
                            label="Tanggal Lahir *"
                            type="date"
                            value={studentForm.birth_date}
                            disabled={studentModal === "detail"}
                            onChange={(e) => setStudentForm("birth_date", e.target.value)}
                            error={studentErrors.birth_date}
                        />
                        <Input
                            label="Tahun Masuk *"
                            type="number"
                            numeric
                            value={studentForm.enrollment_year}
                            disabled={studentModal === "detail"}
                            onChange={(e) => setStudentForm("enrollment_year", Number(e.target.value))}
                        />
                        <SelectInput
                            label="Status *"
                            value={studentForm.status}
                            disabled={studentModal === "detail" || studentModal === "create"}
                            onChange={(val) => setStudentForm("status", val as string)}
                            options={[
                                { value: "Active", label: "Aktif" },
                                { value: "Inactive", label: "Non-Aktif" },
                            ]}
                        />
                        <SelectInput
                            label="Wali Murid (Opsional)"
                            value={studentForm.guardian_id}
                            disabled={studentModal === "detail"}
                            onChange={(val) => setStudentForm("guardian_id", val as string)}
                            options={[
                                { value: "", label: "— Belum Ada Wali —" },
                                ...allGuardians.map((g) => ({ value: g.id, label: g.name })),
                            ]}
                        />
                        <Input
                            label="No. Telepon (Opsional)"
                            value={studentForm.phone}
                            disabled={studentModal === "detail"}
                            onChange={(e) => setStudentForm("phone", e.target.value)}
                        />
                        {studentModal === "create" && (
                            <>
                                <Input
                                    label="Email SSO (Opsional)"
                                    type="email"
                                    value={studentForm.email}
                                    onChange={(e) => setStudentForm("email", e.target.value)}
                                    error={studentErrors.email}
                                />
                                <Input
                                    label="Password Awal (Opsional)"
                                    type="password"
                                    value={studentForm.password}
                                    onChange={(e) => setStudentForm("password", e.target.value)}
                                    placeholder="Default: password"
                                />
                            </>
                        )}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-primary mb-1.5 font-inter">
                                Alamat <span className="text-[12px] text-text-inactive font-normal">(Opsional)</span>
                            </label>
                            <textarea
                                value={studentForm.address}
                                disabled={studentModal === "detail"}
                                onChange={(e) => setStudentForm("address", e.target.value)}
                                rows={2}
                                className="w-full border border-border rounded-lg px-4 py-2.5 text-[14px] disabled:bg-muted font-inter bg-surface placeholder:text-text-inactive focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                            />
                        </div>
                    </div>
                </Drawer>

                {/* Teacher Create / Edit / Detail Drawer */}
                <Drawer
                    open={teacherModal !== null}
                    onClose={closeTeacherModal}
                    title={
                        teacherModal === "create"
                            ? "Tambah Data Guru"
                            : teacherModal === "edit"
                              ? "Edit Data Guru"
                              : "Detail Data Guru"
                    }
                    width="md"
                    onSubmit={teacherModal === "detail" ? undefined : submitTeacher}
                    submitLabel={teacherModal === "create" ? "Simpan" : "Perbarui"}
                    loading={teacherProcessing}
                    headerActions={
                        teacherModal === "detail" ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopyInfo(
                                            "teacher",
                                            `Guru: ${teacherForm.name} | Kode: ${teacherForm.teacher_code} | Email: ${teacherForm.email || "-"}`
                                        )
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
                                    title="Salin Informasi Guru"
                                >
                                    <i className={copiedKey === "teacher" ? "fas fa-check text-success text-[10px]" : "far fa-copy text-[10px]"} />
                                    <span>{copiedKey === "teacher" ? "Tersalin!" : "Salin"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTeacherModal("edit")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                                    title="Unlock Edit Form"
                                >
                                    <i className="fas fa-lock-open text-[10px]" />
                                    <span>Edit</span>
                                </button>
                                {editingTeacherId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const id = editingTeacherId;
                                            closeTeacherModal();
                                            handleDelete("teachers", id);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-danger bg-danger-bg border border-danger-light hover:bg-danger-light transition-colors cursor-pointer"
                                        title="Hapus Guru Ini"
                                    >
                                        <i className="fas fa-trash text-[10px]" />
                                        <span>Hapus</span>
                                    </button>
                                )}
                            </div>
                        ) : teacherModal === "edit" ? (
                            <button
                                type="button"
                                onClick={() => setTeacherModal("detail")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
                                title="Mode Read-Only"
                            >
                                <i className="fas fa-lock text-[10px]" />
                                <span>Kunci Baca</span>
                            </button>
                        ) : undefined
                    }
                >
                    <div className="space-y-4">
                        <Input
                            label="Kode Guru *"
                            value={teacherForm.teacher_code}
                            disabled={teacherModal === "detail"}
                            onChange={(e) => setTeacherForm("teacher_code", e.target.value)}
                            error={teacherErrors.teacher_code}
                            placeholder="Contoh: TCH-016"
                        />
                        <Input
                            label="Nama Guru Lengkap & Gelar *"
                            value={teacherForm.name}
                            disabled={teacherModal === "detail"}
                            onChange={(e) => setTeacherForm("name", e.target.value)}
                            error={teacherErrors.name}
                            placeholder="Contoh: Dr. H. Slamet, M.Pd."
                        />
                        {teacherModal === "create" && (
                            <>
                                <Input
                                    label="Email SSO (Opsional)"
                                    type="email"
                                    value={teacherForm.email}
                                    onChange={(e) => setTeacherForm("email", e.target.value)}
                                    error={teacherErrors.email}
                                    placeholder="Contoh: slamet@smauii.sch.id"
                                />
                                <Input
                                    label="Password Awal (Opsional)"
                                    type="password"
                                    value={teacherForm.password}
                                    onChange={(e) => setTeacherForm("password", e.target.value)}
                                    placeholder="Default: password"
                                />
                            </>
                        )}
                    </div>
                </Drawer>

                {/* Guardian Create / Edit / Detail Drawer */}
                <Drawer
                    open={guardianModal !== null}
                    onClose={closeGuardianModal}
                    title={
                        guardianModal === "create"
                            ? "Tambah Wali Murid"
                            : guardianModal === "edit"
                              ? "Edit Wali Murid"
                              : "Detail Wali Murid"
                    }
                    width="md"
                    onSubmit={guardianModal === "detail" ? undefined : submitGuardian}
                    submitLabel={guardianModal === "create" ? "Simpan" : "Perbarui"}
                    loading={guardianProcessing}
                    headerActions={
                        guardianModal === "detail" ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopyInfo(
                                            "guardian",
                                            `Wali Murid: ${guardianForm.name} | No. Telepon: ${guardianForm.phone || "-"} | Email: ${guardianForm.email || "-"}`
                                        )
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
                                    title="Salin Informasi Wali"
                                >
                                    <i className={copiedKey === "guardian" ? "fas fa-check text-success text-[10px]" : "far fa-copy text-[10px]"} />
                                    <span>{copiedKey === "guardian" ? "Tersalin!" : "Salin"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGuardianModal("edit")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                                    title="Unlock Edit Form"
                                >
                                    <i className="fas fa-lock-open text-[10px]" />
                                    <span>Edit</span>
                                </button>
                                {editingGuardianId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const id = editingGuardianId;
                                            closeGuardianModal();
                                            handleDelete("guardians", id);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-danger bg-danger-bg border border-danger-light hover:bg-danger-light transition-colors cursor-pointer"
                                        title="Hapus Wali Ini"
                                    >
                                        <i className="fas fa-trash text-[10px]" />
                                        <span>Hapus</span>
                                    </button>
                                )}
                            </div>
                        ) : guardianModal === "edit" ? (
                            <button
                                type="button"
                                onClick={() => setGuardianModal("detail")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary bg-surface border border-border hover:bg-muted transition-colors cursor-pointer"
                                title="Mode Read-Only"
                            >
                                <i className="fas fa-lock text-[10px]" />
                                <span>Kunci Baca</span>
                            </button>
                        ) : undefined
                    }
                >
                    <div className="space-y-4">
                        <Input
                            label="Nama Wali Murid *"
                            value={guardianForm.name}
                            disabled={guardianModal === "detail"}
                            onChange={(e) => setGuardianForm("name", e.target.value)}
                            error={guardianErrors.name}
                            placeholder="Contoh: H. Agus Salim, S.E."
                        />
                        <Input
                            label="No. Telepon / WhatsApp (Opsional)"
                            value={guardianForm.phone}
                            disabled={guardianModal === "detail"}
                            onChange={(e) => setGuardianForm("phone", e.target.value)}
                            error={guardianErrors.phone}
                            placeholder="Contoh: 08123456789"
                        />
                        {guardianModal === "create" && (
                            <>
                                <Input
                                    label="Email SSO (Opsional)"
                                    type="email"
                                    value={guardianForm.email}
                                    onChange={(e) => setGuardianForm("email", e.target.value)}
                                    error={guardianErrors.email}
                                    placeholder="Contoh: agus@wali.smauii.sch.id"
                                />
                                <Input
                                    label="Password Awal (Opsional)"
                                    type="password"
                                    value={guardianForm.password}
                                    onChange={(e) => setGuardianForm("password", e.target.value)}
                                    placeholder="Default: password"
                                />
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5 font-inter">
                                Alamat Tinggal <span className="text-[12px] text-text-inactive font-normal">(Opsional)</span>
                            </label>
                            <textarea
                                value={guardianForm.address}
                                disabled={guardianModal === "detail"}
                                onChange={(e) => setGuardianForm("address", e.target.value)}
                                rows={3}
                                className="w-full border border-border rounded-lg px-4 py-2.5 text-[14px] disabled:bg-muted font-inter bg-surface placeholder:text-text-inactive focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                                placeholder="Contoh: Jl. Sorowajan Baru No. 12, Banguntapan, Bantul"
                            />
                        </div>
                    </div>
                </Drawer>
            </div>
        </AppShell>
    );
}

// ─── Toolbar ───

function Toolbar({
    triggerRef,
    search,
    setSearch,
    handleSearch,
    placeholder = "Cari...",
    selectedCount = 0,
    onDeleteSelected,
    onImport,
    onAdd,
    classFilter,
    classOptions,
    onApplyClassFilter,
}: {
    triggerRef?: React.Ref<HTMLDivElement>;
    search: string;
    setSearch: (v: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    placeholder?: string;
    selectedCount?: number;
    onDeleteSelected?: () => void;
    onImport?: () => void;
    onAdd?: () => void;
    classFilter?: string;
    classOptions?: ClassOption[];
    onApplyClassFilter?: (classId: string) => void;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex-1 w-full min-w-0">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onSearch={() => handleSearch(new Event("submit") as unknown as React.FormEvent)}
                    placeholder={placeholder}
                />
            </div>

            <div className="flex flex-row flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                {/* Filter Kelas */}
                {onApplyClassFilter && (
                    <div className="flex-1 sm:flex-initial min-w-[150px]">
                        <NativeSelect
                            value={classFilter || ""}
                            onChange={(e) => onApplyClassFilter(e.target.value)}
                        >
                            <option value="">Semua Kelas</option>
                            {(classOptions || []).map((c) => (
                                <option key={c.id} value={String(c.id)}>{c.name}</option>
                            ))}
                        </NativeSelect>
                    </div>
                )}

                {/* Bulk Delete Button */}
                {selectedCount > 0 && (
                    <Button
                        variant="danger"
                        onClick={onDeleteSelected}
                        icon={<i className="fas fa-trash-alt text-[12px]" />}
                        className="flex-1 sm:flex-none justify-center"
                    >
                        Hapus ({selectedCount})
                    </Button>
                )}

                {/* Import Excel */}
                {onImport && (
                    <Button
                        variant="secondary"
                        onClick={onImport}
                        icon={<i className="fas fa-file-import text-[12px]" />}
                        className="flex-1 sm:flex-none justify-center"
                    >
                        Import
                    </Button>
                )}

                {/* Tambah Data Baru */}
                {onAdd && (
                    <div ref={triggerRef}>
                        <Button
                            variant="primary"
                            onClick={onAdd}
                            icon={<i className="fas fa-plus text-[12px]" />}
                            className="inline-flex justify-center"
                        >
                            Tambah
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
