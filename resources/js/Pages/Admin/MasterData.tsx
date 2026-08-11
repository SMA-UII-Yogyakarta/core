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
    class: { id: number; name: string } | null;
    status: string;
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

interface PageProps {
    students: PaginatedData<Student>;
    teachers?: PaginatedData<Teacher>;
    allTeachers?: Teacher[];
    schoolClasses?: PaginatedData<SchoolClass>;
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
    guardians,
    searchConfig,
    activeTab,
    filters,
}: PageProps) {
    const [currentTab, setCurrentTab] = useState(
        activeTabMap[activeTab ?? ""] ?? "students",
    );
    const [search, setSearch] = useState(filters.search ?? "");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleDeleteSelected = () => {
        if (!confirm(`Hapus ${selectedIds.length} data yang terpilih?`)) return;
        alert(`API Bulk delete akan menghapus ID: ${selectedIds.join(", ")}`);
        setSelectedIds([]);
    };
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importEntity, setImportEntity] = useState<"students" | "teachers">(
        "students",
    );

    const [allClasses] = useState<SchoolClass[]>(
        () => searchConfig?.allData || [],
    );
    const [filteredClasses, setFilteredClasses] = useState<SchoolClass[]>(
        () => searchConfig?.allData || schoolClasses?.data || [],
    );

    const { data: formData, setData: setFormData, post, processing, reset } = useForm({
        name: "",
        teacher_id: null as number | null,
        capacity: "",
        level: "X",
    });

    const { errors } = usePage().props as { errors: Record<string, string> };

    const handleCreateClass = (e: React.FormEvent) => {
        e.preventDefault();
        post("/master-data/classes", {
            onSuccess: () => {
                reset();
            },
        });
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
            render: (_s) => (
                <div className="flex gap-2">
                    <ActionButton
                        variant="detail"
                        icon="fa-eye"
                        label="Detail"
                    />
                    <ActionButton
                        variant="edit"
                        icon="fa-edit"
                        label="Edit"
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
        { key: "name", header: "Nama Kelas" },
        {
            key: "teacher",
            header: "Wali Kelas",
            render: (c) => c.teacher?.name ?? "-",
        },
        {
            key: "students_count",
            header: "Jumlah Siswa",
            render: (c) => `${c.students_count}/${c.capacity}`,
        },
        {
            key: "actions",
            header: "Aksi",
            render: (c) => (
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
                        onClick={() => handleDelete("class", c.id)}
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
                            onImport={() => {
                                setImportEntity("students");
                                setImportModalOpen(true);
                            }}
                            onAdd={() => alert("Tambah data siswa baru")}
                        />
                        <div className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                            <Table
                                columns={studentColumns}
                                data={students.data}
                                keyExtractor={(s: Student) => s.id}
                            />
                            {students.total > 0 && (
                                <Pagination
                                    currentPage={students.current_page}
                                    totalPages={students.last_page}
                                    totalItems={students.total}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/master-data",
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
                            <div className="text-primary py-2 text-lg font-semibold">
                                    Buat Kelas Baru
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
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="w-full h-10 mt-auto"
                                    disabled={processing}
                                >
                                    {processing ? "Menyimpan..." : "Simpan Kelas Baru"}
                                </Button>
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
}: {
    search: string;
    setSearch: (v: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    placeholder?: string;
    selectedCount?: number;
    onDeleteSelected?: () => void;
    onImport?: () => void;
    onAdd?: () => void;
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
                
                {/* Filter Kelas Button */}
                <button
                    type="button"
                    className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-[13px] font-semibold text-text-primary bg-surface hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <i className="fas fa-filter text-text-inactive text-[12px]" />
                    <span>Filter Kelas</span>
                </button>
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
