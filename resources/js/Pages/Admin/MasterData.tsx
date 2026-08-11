import { router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    Button,
    Card,
    Input,
    SelectInput,
    PageHeader,
    SearchBar,
    ActionButton,
    StatusBadge,
    Table,
    Pagination,
    ImportModal,
    Modal,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import type { Column } from "@/Components/ui/Table";

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
    students: "/master-data",
    teachers: "/master-data/teachers",
    class: "/master-data/classes",
    guardians: "/master-data/guardians",
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
    const [currentTab, setCurrentTab] = useState(
        activeTabMap[activeTab ?? ""] ?? "students",
    );
    const [search, setSearch] = useState(filters.search ?? "");
    const [classFilter, setClassFilter] = useState(filters.class_id ?? "");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showClassFilter, setShowClassFilter] = useState(false);

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importEntity, setImportEntity] = useState<"students" | "teachers">(
        "students",
    );

    // Student create / edit / detail
    type StudentModalMode = "create" | "edit" | "detail" | null;
    const [studentModal, setStudentModal] = useState<StudentModalMode>(null);
    const [editingStudentId, setEditingStudentId] = useState<number | null>(
        null,
    );

    const [allClasses] = useState<SchoolClass[]>(
        () => searchConfig?.allData || [],
    );
    const [filteredClasses, setFilteredClasses] = useState<SchoolClass[]>(
        () => searchConfig?.allData || schoolClasses?.data || [],
    );

    // Class form (create + edit)
    const [editingClassId, setEditingClassId] = useState<number | null>(null);
    const {
        data: formData,
        setData: setFormData,
        post,
        patch,
        processing,
        reset,
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

    const { errors } = usePage().props as { errors: Record<string, string> };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;
        if (
            !confirm(
                `Hapus ${selectedIds.length} siswa yang terpilih? Tindakan ini tidak dapat dibatalkan.`,
            )
        ) {
            return;
        }
        router.post(
            "/master-data/students/bulk-destroy",
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
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

    const openEditStudent = (s: Student) => {
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
        setStudentModal("edit");
    };

    const openDetailStudent = (s: Student) => {
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

    const submitStudent = () => {
        if (studentModal === "detail") return;

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

    const handleCreateClass = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClassId) {
            patch(`/master-data/classes/${editingClassId}`, {
                onSuccess: () => {
                    reset();
                    setEditingClassId(null);
                },
            });
            return;
        }
        post("/master-data/classes", {
            onSuccess: () => {
                reset();
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
    };

    const cancelEditClass = () => {
        setEditingClassId(null);
        reset();
    };

    const applyClassFilter = (classId: string) => {
        setClassFilter(classId);
        setShowClassFilter(false);
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
        router.get(
            tabRoutes[tab] ?? "/master-data",
            {},
            { preserveState: true },
        );
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        if (searchConfig?.mode === "client" && currentTab === "class") {
            const filtered = allClasses.filter(
                (c) =>
                    c.name.toLowerCase().includes(value.toLowerCase()) ||
                    c.teacher?.name
                        ?.toLowerCase()
                        .includes(value.toLowerCase()),
            );
            setFilteredClasses(filtered);
        } else {
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
        if (!confirm("Hapus data ini?")) return;
        router.delete(`/master-data/${entity}/${id}`, {
            preserveState: true,
        });
    };

    // ─── Student Columns ───

    const allSelected = students?.data?.length > 0 && selectedIds.length === students.data.length;

    const studentColumns: Column<Student>[] = [
        {
            key: "select",
            header: (
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds(students.data.map((s) => s.id));
                        } else {
                            setSelectedIds([]);
                        }
                    }}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
            ),
            render: (s) => (
                <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, s.id]);
                        } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== s.id));
                        }
                    }}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
            ),
            className: "w-8",
        },
        {
            key: "identity",
            header: "Identitas Nomor",
            render: (s) => (
                <div>
                    <div className="font-semibold text-text-primary">
                        {s.nis}
                    </div>
                    <div className="text-[12px] font-medium text-text-inactive">
                        NISN: {s.nisn}
                    </div>
                </div>
            ),
        },
        {
            key: "name",
            header: "Nama Siswa",
            render: (s) => (
                <div>
                    <div className="font-semibold text-primary">{s.name}</div>
                </div>
            ),
        },
        {
            key: "class",
            header: "Kelas",
            render: (s) => (
                <span className="flex items-center gap-1.5 font-medium text-text-secondary">
                    <i className="fas fa-chalkboard-teacher text-[13px] text-text-inactive" />
                    {s.class?.name ?? "-"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (s) => {
                const isActive = s.status === "Active" || s.status === "active";
                return (
                    <StatusBadge
                        variant={isActive ? "active" : "inactive"}
                        label={isActive ? "AKTIF" : "NON-AKTIF"}
                    />
                );
            },
        },
        {
            key: "actions",
            header: "Aksi",
            render: (s) => (
                <div className="flex gap-2">
                    <ActionButton
                        variant="detail"
                        icon="fa-eye"
                        label="Detail"
                        onClick={() => openDetailStudent(s)}
                    />
                    <ActionButton
                        variant="edit"
                        icon="fa-edit"
                        label="Edit"
                        onClick={() => openEditStudent(s)}
                    />
                </div>
            ),
        },
    ];

    // ─── Teacher Columns ───

    const teacherColumns: Column<Teacher>[] = [
        {
            key: "teacher_code",
            header: "Kode Guru",
            render: (t) => (
                <p className="font-semibold text-text-primary">
                    {t.teacher_code}
                </p>
            ),
        },
        {
            key: "name",
            header: "Nama Guru",
            render: (t) => (
                <p className="font-semibold text-primary">{t.name}</p>
            ),
        },
        {
            key: "email",
            header: "Email",
            render: (t) => t.user?.email ?? "-",
        },
        {
            key: "classes",
            header: "Kelas Diampu",
            render: (t) =>
                t.school_classes?.map((c) => c.name).join(", ") ?? "-",
        },
        {
            key: "actions",
            header: "Aksi",
            render: (t) => (
                <div className="flex gap-2">
                    <ActionButton
                        variant="detail"
                        icon="fa-eye"
                        label="Detail"
                    />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        onClick={() => handleDelete("teachers", t.id)}
                    />
                </div>
            ),
        },
    ];

    // ─── SchoolClass Columns ───

    const classColumns: Column<SchoolClass>[] = [
        {
            key: "name",
            header: "Nama Kelas",
            render: (c) => (
                <span className="font-semibold text-primary">{c.name}</span>
            ),
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
        },
        {
            key: "actions",
            header: "Aksi",
            render: (c) => (
                <div className="flex gap-2">
                    <ActionButton
                        variant="edit"
                        icon="fa-edit"
                        label="Edit"
                        onClick={() => openEditClass(c)}
                    />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        onClick={() => handleDelete("classes", c.id)}
                    />
                </div>
            ),
        },
    ];

    // ─── Guardian Columns ───

    const guardianColumns: Column<Guardian>[] = [
        { key: "name", header: "Nama Wali" },
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
                <div className="flex gap-2">
                    <ActionButton
                        variant="detail"
                        icon="fa-eye"
                        label="Detail"
                    />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        onClick={() => handleDelete("guardians", w.id)}
                    />
                </div>
            ),
        },
    ];

    // ─── Render ───

    return (
        <AppShell title="Manajemen Data Master">
            <div>
                <div className="mb-6">
                    <h1 className="text-[24px] font-bold text-text-primary font-inter leading-tight">
                        Manajemen Data Master
                    </h1>
                    <p className="text-[14px] text-text-secondary font-inter mt-1">
                        Kelola entitas data utama institusi beserta akses kredensial SSO.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-border mb-6 select-none">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => switchTab(t.key)}
                            className={`pb-3 text-[14px] font-semibold transition-colors border-b-2 -mb-px inline-flex items-center cursor-pointer ${
                                currentTab === t.key
                                    ? "text-primary border-primary font-bold"
                                    : "text-text-inactive border-transparent hover:text-text-primary"
                            }`}
                            type="button"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Siswa Tab ── */}
                {currentTab === "students" && students?.data && (
                    <div>
                        <Toolbar
                            search={search}
                            setSearch={setSearch}
                            handleSearch={handleSearchSubmit}
                            placeholder="Cari nama, NIS, atau NISN..."
                            selectedCount={selectedIds.length}
                            onDeleteSelected={handleDeleteSelected}
                            classFilter={classFilter}
                            classOptions={classOptions}
                            showClassFilter={showClassFilter}
                            onToggleClassFilter={() =>
                                setShowClassFilter((v) => !v)
                            }
                            onApplyClassFilter={applyClassFilter}
                            onImport={() => {
                                setImportEntity("students");
                                setImportModalOpen(true);
                            }}
                            onAdd={openCreateStudent}
                        />

                        {/* Mobile card list (Figma) */}
                        <div className="lg:hidden flex flex-col gap-3 mb-4">
                            {students.data.length === 0 ? (
                                <p className="text-center text-text-inactive text-[13px] py-10">
                                    Belum ada data siswa.
                                </p>
                            ) : (
                                students.data.map((s) => {
                                    const isActive =
                                        s.status === "Active" ||
                                        s.status === "active";
                                    return (
                                        <article
                                            key={s.id}
                                            className="bg-surface border border-border rounded-xl p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-[15px] font-bold text-primary font-inter">
                                                        {s.name}
                                                    </h3>
                                                    <p className="text-[12px] text-text-muted mt-0.5">
                                                        NISN: {s.nisn}
                                                        {s.class?.name
                                                            ? ` · ${s.class.name}`
                                                            : ""}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="text-text-inactive hover:text-text-primary p-1"
                                                    aria-label="Aksi"
                                                    onClick={() =>
                                                        openEditStudent(s)
                                                    }
                                                >
                                                    <i className="fas fa-ellipsis-v" />
                                                </button>
                                            </div>
                                            <div className="mt-3 space-y-1.5 text-[12px] text-text-secondary">
                                                <p className="flex items-center gap-2">
                                                    <i className="fas fa-id-badge text-text-inactive w-4" />
                                                    @{s.user?.username ?? s.nis}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <i className="fas fa-envelope text-text-inactive w-4" />
                                                    {s.user?.email ?? "—"}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <StatusBadge
                                                    variant={
                                                        isActive
                                                            ? "active"
                                                            : "inactive"
                                                    }
                                                    label={
                                                        isActive
                                                            ? "AKTIF"
                                                            : "NON-AKTIF"
                                                    }
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="text-[12px] font-semibold text-primary"
                                                        onClick={() =>
                                                            openDetailStudent(s)
                                                        }
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-[12px] font-semibold text-warning"
                                                        onClick={() =>
                                                            openEditStudent(s)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden lg:block bg-surface border border-border rounded-lg p-4 lg:p-6">
                            <Table
                                columns={studentColumns}
                                data={students.data}
                                keyExtractor={(s: Student) => s.id}
                            />
                        </div>

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
                                                class_id:
                                                    classFilter || undefined,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        )}

                        {/* Mobile FAB */}
                        <button
                            type="button"
                            onClick={openCreateStudent}
                            className="lg:hidden fixed bottom-20 right-5 z-20 w-14 h-14 rounded-full bg-accent text-primary shadow-lg flex items-center justify-center text-xl font-bold"
                            aria-label="Tambah siswa"
                        >
                            <i className="fas fa-plus" />
                        </button>
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
                            onAdd={() => alert("Tambah data guru baru")}
                        />
                        <div className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                            <Table
                                columns={teacherColumns}
                                data={teachers.data}
                                keyExtractor={(t: Teacher) => t.id}
                            />
                            {teachers.total > 0 && (
                                <Pagination
                                    currentPage={teachers.current_page}
                                    totalPages={teachers.last_page}
                                    totalItems={teachers.total}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/master-data/teachers",
                                            {
                                                page,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* ── Kelas Tab ── */}
                {currentTab === "class" && schoolClasses?.data && (
                    <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-3">
                            <Card className="p-4 lg:p-6">
                                <PageHeader>
                                    <SearchBar
                                        value={search}
                                        onChange={setSearch}
                                        onSearch={handleSearch}
                                        autoSearch={
                                            searchConfig?.mode !== "client"
                                        }
                                        debounceMs={300}
                                    />
                                </PageHeader>
                                <Table
                                    columns={classColumns}
                                    data={
                                        searchConfig?.mode === "client"
                                            ? filteredClasses
                                            : schoolClasses.data
                                    }
                                    keyExtractor={(c: SchoolClass) => c.id}
                                />
                                {searchConfig?.mode !== "client" &&
                                    schoolClasses.total > 0 && (
                                        <Pagination
                                            currentPage={
                                                schoolClasses.current_page
                                            }
                                            totalPages={schoolClasses.last_page}
                                            totalItems={schoolClasses.total}
                                            onPageChange={(page) =>
                                                router.get(
                                                    "/master-data/classes",
                                                    {
                                                        page,
                                                    },
                                                    { preserveState: true },
                                                )
                                            }
                                        />
                                    )}
                            </Card>
                        </div>
                        <Card className="col-span-2 border-2 border-dashed border-border p-4 h-[480px] flex flex-col">
                            <div className="text-primary py-2 text-lg font-semibold flex items-center justify-between">
                                <span>
                                    {editingClassId
                                        ? "Edit Kelas"
                                        : "Buat Kelas Baru"}
                                </span>
                                {editingClassId && (
                                    <button
                                        type="button"
                                        onClick={cancelEditClass}
                                        className="text-[12px] font-semibold text-text-muted hover:text-text-primary"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleCreateClass} className="flex flex-col gap-2 flex-1">
                                <div className="grid grid-cols-3 gap-2 py-2">
                                    <SelectInput
                                        label="Tingkat"
                                        options={[
                                            { value: "X", label: "X" },
                                            { value: "XI", label: "XI" },
                                            { value: "XII", label: "XII" },
                                        ]}
                                        value={formData.level}
                                        onChange={(val) =>
                                            setFormData("level", (val as string) ?? "X")
                                        }
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
                                        error={errors.name}
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
                                        setFormData(
                                            "teacher_id",
                                            typeof val === "number" ? val : null,
                                        )
                                    }
                                    className="py-2"
                                    error={errors.teacher_id}
                                />
                                <Input
                                    label="Kapasitas Maksimal"
                                    type="number"
                                    id="kapasitas"
                                    min="0"
                                    numeric
                                    value={formData.capacity}
                                    onChange={(e) => setFormData("capacity", e.target.value)}
                                    className="py-2"
                                    error={errors.capacity}
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-10 mt-auto rounded-lg bg-success hover:bg-success/90 text-white text-[13px] font-bold transition-colors disabled:opacity-60 cursor-pointer"
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : editingClassId
                                          ? "✓ Simpan Perubahan"
                                          : "✓ Simpan Kelas Baru"}
                                </button>
                            </form>
                        </Card>
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
                            onAdd={() => alert("Tambah data wali murid baru")}
                        />
                        <div className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                            <Table
                                columns={guardianColumns}
                                data={guardians.data}
                                keyExtractor={(w: Guardian) => w.id}
                            />
                            {guardians.total > 0 && (
                                <Pagination
                                    currentPage={guardians.current_page}
                                    totalPages={guardians.last_page}
                                    totalItems={guardians.total}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/master-data/guardians",
                                            {
                                                page,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            )}
                        </div>
                    </div>
                )}
                <ImportModal
                    open={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                    entity={importEntity}
                />

                {/* Student Create / Edit / Detail Modal */}
                <Modal
                    open={studentModal !== null}
                    onClose={closeStudentModal}
                    title={
                        studentModal === "create"
                            ? "Tambah Data Siswa"
                            : studentModal === "edit"
                              ? "Edit Data Siswa"
                              : "Detail Siswa"
                    }
                    width="lg"
                    onSubmit={
                        studentModal === "detail" ? undefined : submitStudent
                    }
                    submitLabel={
                        studentModal === "create" ? "Simpan" : "Perbarui"
                    }
                    loading={studentProcessing}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                NIS
                            </label>
                            <input
                                type="text"
                                value={studentForm.nis}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm("nis", e.target.value)
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            />
                            {studentErrors.nis && (
                                <p className="text-danger text-[11px] mt-1">
                                    {studentErrors.nis}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                NISN
                            </label>
                            <input
                                type="text"
                                value={studentForm.nisn}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm("nisn", e.target.value)
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            />
                            {studentErrors.nisn && (
                                <p className="text-danger text-[11px] mt-1">
                                    {studentErrors.nisn}
                                </p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={studentForm.name}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm("name", e.target.value)
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            />
                            {studentErrors.name && (
                                <p className="text-danger text-[11px] mt-1">
                                    {studentErrors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                Kelas
                            </label>
                            <select
                                value={String(studentForm.class_id ?? "")}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm("class_id", e.target.value)
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            >
                                <option value="">— Pilih Kelas —</option>
                                {classOptions.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {studentErrors.class_id && (
                                <p className="text-danger text-[11px] mt-1">
                                    {studentErrors.class_id}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                Tanggal Lahir
                            </label>
                            <input
                                type="date"
                                value={studentForm.birth_date}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm(
                                        "birth_date",
                                        e.target.value,
                                    )
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            />
                            {studentErrors.birth_date && (
                                <p className="text-danger text-[11px] mt-1">
                                    {studentErrors.birth_date}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                Tahun Masuk
                            </label>
                            <input
                                type="number"
                                value={studentForm.enrollment_year}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm(
                                        "enrollment_year",
                                        Number(e.target.value),
                                    )
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                Status
                            </label>
                            <select
                                value={studentForm.status}
                                disabled={
                                    studentModal === "detail" ||
                                    studentModal === "create"
                                }
                                onChange={(e) =>
                                    setStudentForm("status", e.target.value)
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            >
                                <option value="Active">Aktif</option>
                                <option value="Inactive">Non-Aktif</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                Wali Murid
                            </label>
                            <select
                                value={String(studentForm.guardian_id ?? "")}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm(
                                        "guardian_id",
                                        e.target.value,
                                    )
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            >
                                <option value="">— Opsional —</option>
                                {allGuardians.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                No. Telepon
                            </label>
                            <input
                                type="text"
                                value={studentForm.phone}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm("phone", e.target.value)
                                }
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            />
                        </div>
                        {studentModal === "create" && (
                            <>
                                <div>
                                    <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                        Email (SSO)
                                    </label>
                                    <input
                                        type="email"
                                        value={studentForm.email}
                                        onChange={(e) =>
                                            setStudentForm(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-border rounded-lg px-3 py-2 text-[13px]"
                                    />
                                    {studentErrors.email && (
                                        <p className="text-danger text-[11px] mt-1">
                                            {studentErrors.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                        Password Awal
                                    </label>
                                    <input
                                        type="password"
                                        value={studentForm.password}
                                        onChange={(e) =>
                                            setStudentForm(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Default: password"
                                        className="w-full border border-border rounded-lg px-3 py-2 text-[13px]"
                                    />
                                </div>
                            </>
                        )}
                        <div className="sm:col-span-2">
                            <label className="block text-[12px] font-semibold text-text-muted mb-1">
                                Alamat
                            </label>
                            <textarea
                                value={studentForm.address}
                                disabled={studentModal === "detail"}
                                onChange={(e) =>
                                    setStudentForm("address", e.target.value)
                                }
                                rows={2}
                                className="w-full border border-border rounded-lg px-3 py-2 text-[13px] disabled:bg-muted"
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </AppShell>
    );
}

// ─── Toolbar ───

function Toolbar({
    search,
    setSearch,
    handleSearch,
    placeholder = "Cari data...",
    selectedCount = 0,
    onDeleteSelected,
    onImport,
    onAdd,
    classFilter,
    classOptions,
    showClassFilter,
    onToggleClassFilter,
    onApplyClassFilter,
}: {
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
    showClassFilter?: boolean;
    onToggleClassFilter?: () => void;
    onApplyClassFilter?: (classId: string) => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-[340px]">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-text-inactive text-sm pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                        className="pl-10 pr-4 py-2 w-full border border-border rounded-lg text-[13px] font-inter bg-surface focus:outline-none focus:ring-2 focus:ring-primary/35 placeholder:text-text-placeholder"
                    />
                </div>
                
                {/* Filter Kelas */}
                {onApplyClassFilter && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={onToggleClassFilter}
                            className={`flex items-center gap-2 border rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer ${
                                classFilter
                                    ? "border-primary bg-primary-light text-primary"
                                    : "border-border text-text-primary bg-surface hover:bg-slate-50"
                            }`}
                        >
                            <i className="fas fa-filter text-[12px]" />
                            <span>
                                {classFilter
                                    ? classOptions?.find(
                                          (c) => String(c.id) === classFilter,
                                      )?.name ?? "Filter Kelas"
                                    : "Filter Kelas"}
                            </span>
                        </button>
                        {showClassFilter && (
                            <div className="absolute z-20 top-full mt-1 left-0 min-w-[200px] bg-surface border border-border rounded-lg shadow-dropdown py-1 max-h-60 overflow-y-auto">
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-muted"
                                    onClick={() => onApplyClassFilter("")}
                                >
                                    Semua Kelas
                                </button>
                                {classOptions?.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`w-full text-left px-3 py-2 text-[13px] hover:bg-muted ${
                                            classFilter === String(c.id)
                                                ? "bg-primary-light text-primary font-semibold"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            onApplyClassFilter(String(c.id))
                                        }
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </form>

            <div className="flex items-center gap-3">
                {/* Bulk Delete Button */}
                {selectedCount > 0 && (
                    <button
                        onClick={onDeleteSelected}
                        className="flex items-center gap-2 bg-danger-bg hover:bg-danger-light border border-danger-light text-danger rounded-lg px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer"
                        type="button"
                    >
                        <i className="fas fa-trash-alt text-[12px]" />
                        <span>Hapus Terpilih ({selectedCount})</span>
                    </button>
                )}

                {/* Import Excel */}
                {onImport && (
                    <button
                        onClick={onImport}
                        className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary rounded-lg px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer"
                        type="button"
                    >
                        <i className="fas fa-file-import text-[12px]" />
                        <span>Import Excel</span>
                    </button>
                )}

                {/* Tambah Data Baru */}
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white rounded-lg px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer"
                    type="button"
                >
                    <i className="fas fa-plus text-[12px]" />
                    <span>Tambah Data Baru</span>
                </button>
            </div>
        </div>
    );
}
