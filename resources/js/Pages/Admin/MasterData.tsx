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
import AdminLayout from "@/Layouts/AdminLayout";
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
    students: "/admin/master-data",
    teachers: "/admin/master-data/teachers",
    class: "/admin/master-data/classes",
    guardians: "/admin/master-data/guardians",
};

const activeTabMap: Record<string, string> = {
    siswa: "students",
    guru: "teachers",
    classes: "class",
    wali: "guardians",
};

const tabs = [
    { key: "students", label: "Siswa", icon: "fa-user-graduate" },
    { key: "teachers", label: "Guru", icon: "fa-chalkboard-teacher" },
    { key: "class", label: "Kelas", icon: "fa-school" },
    { key: "guardians", label: "Wali Murid", icon: "fa-user-friends" },
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
    const [, setSelectedIds] = useState<number[]>([]); // value not needed, only setter for reset
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
        post("/admin/master-data/classes", {
            onSuccess: () => {
                reset();
            },
        });
    };

    const switchTab = (tab: string) => {
        setCurrentTab(tab);
        setSelectedIds([]);
        router.get(
            tabRoutes[tab] ?? "/admin/master-data",
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
                tabRoutes[currentTab] ?? "/admin/master-data",
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
        router.delete(`/admin/master-data/${entity}/${id}`, {
            preserveState: true,
        });
    };

    // ─── Student Columns ───

    const studentColumns: Column<Student>[] = [
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
        { key: "class", header: "Kelas", render: (s) => s.class?.name ?? "-" },
        {
            key: "status",
            header: "Status",
            render: (s) => (
                <StatusBadge
                    variant={s.status === "Active" ? "active" : "inactive"}
                />
            ),
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
                    />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        onClick={() => handleDelete("students", s.id)}
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
        <AdminLayout title="Manajemen Data Master" activeMenu="Data Master">
            <div>
                <h1 className="text-[18px] font-bold text-text-primary font-inter mb-6">
                    Manajemen Data Master
                </h1>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border mb-6">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => switchTab(t.key)}
                            className={`px-4 py-2.5 text-[14px] font-inter transition-colors border-b-2 -mb-px inline-flex items-center gap-2 ${
                                currentTab === t.key
                                    ? "text-primary border-primary font-bold"
                                    : "text-text-inactive border-transparent hover:text-text-primary"
                            }`}
                            type="button"
                        >
                            <i className={`fas ${t.icon}`} />
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
                            onImport={() => {
                                setImportEntity("students");
                                setImportModalOpen(true);
                            }}
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
                                            "/admin/master-data",
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
                            onImport={() => {
                                setImportEntity("teachers");
                                setImportModalOpen(true);
                            }}
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
                                            "/admin/master-data/teachers",
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
                                                    "/admin/master-data/classes",
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
                                            "/admin/master-data/guardians",
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
        </AdminLayout>
    );
}

// ─── Toolbar ───

function Toolbar({
    search,
    setSearch,
    handleSearch,
    onImport,
}: {
    search: string;
    setSearch: (v: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    onImport?: () => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-inactive text-sm pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari data..."
                        className="pl-10 pr-4 py-2 w-70 border border-border rounded-lg text-[14px] font-inter bg-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-inactive"
                    />
                </div>
                <Button type="submit" variant="ghost" size="sm">
                    <i className="fas fa-filter mr-1" /> Filter
                </Button>
            </form>
            <div className="flex items-center gap-2">
                {onImport && (
                    <Button variant="secondary" size="sm" onClick={onImport}>
                        <i className="fas fa-file-import mr-1" /> Import Excel
                    </Button>
                )}
                <Button variant="primary" size="sm">
                    <i className="fas fa-plus mr-1" /> Tambah Data Baru
                </Button>
            </div>
        </div>
    );
}
