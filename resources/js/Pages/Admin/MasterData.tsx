import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Navbar,
    Sidebar,
    Button,
    ActionButton,
    StatusBadge,
    Table,
    Pagination,
    ImportModal,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";

// ─── Shared Types ───

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string } | null;
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

interface PageProps {
    students: PaginatedData<Student>;
    teachers?: PaginatedData<Teacher>;
    schoolClasses?: PaginatedData<SchoolClass>;
    guardians?: PaginatedData<Guardian>;
    tab: string;
    filters: Record<string, string | undefined>;
}

const tabs = [
    { key: "siswa", label: "Siswa", icon: "fa-user-graduate" },
    { key: "guru", label: "Guru", icon: "fa-chalkboard-teacher" },
    { key: "kelas", label: "Kelas", icon: "fa-school" },
    { key: "wali", label: "Wali Murid", icon: "fa-user-friends" },
];

export default function DataMaster({
    students,
    teachers,
    schoolClasses,
    guardians,
    filters,
}: PageProps) {
    const [currentTab, setCurrentTab] = useState(filters.tab ?? "siswa");
    const [search, setSearch] = useState(filters.search ?? "");
    const [, setSelectedIds] = useState<number[]>([]); // value not needed, only setter for reset
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importEntity, setImportEntity] = useState<"students" | "teachers">("students");

    const switchTab = (tab: string) => {
        setCurrentTab(tab);
        setSelectedIds([]);
        router.get("/admin/master-data", { tab }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/admin/master-data",
            { tab: currentTab, search: search || undefined },
            { preserveState: true },
        );
    };

    const handleDelete = (entity: string, id: number) => {
        if (!confirm("Hapus data ini?")) return;
        router.delete(`/admin/data-master/${entity}/${id}`, {
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
                    <div className="font-medium text-text-primary">{s.nis}</div>
                    <div className="text-[12px] text-text-inactive">
                        NISN: {s.nisn}
                    </div>
                </div>
            ),
        },
        { key: "name", header: "Nama Siswa" },
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
                        onClick={() => handleDelete("siswa", s.id)}
                    />
                </div>
            ),
        },
    ];

    // ─── Teacher Columns ───

    const teacherColumns: Column<Teacher>[] = [
        { key: "teacher_code", header: "Kode Guru" },
        { key: "name", header: "Nama Guru" },
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
                        onClick={() => handleDelete("guru", t.id)}
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
            key: "student_count",
            header: "Jumlah Siswa",
            render: () => "-",
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
                        onClick={() => handleDelete("kelas", c.id)}
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
                        onClick={() => handleDelete("wali", w.id)}
                    />
                </div>
            ),
        },
    ];

    // ─── Render ───

    return (
        <>
            <Head title="Manajemen Data Master" />
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar brand="SMA UII YOGYAKARTA" />
                <div className="flex flex-1">
                    <Sidebar activeMenu="Data Master" />
                    <main className="flex-1 p-6">
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
                        {currentTab === "siswa" && students && (
                            <div>
                                <Toolbar
                                    search={search}
                                    setSearch={setSearch}
                                    handleSearch={handleSearch}
                                    onImport={() => { setImportEntity("students"); setImportModalOpen(true); }}
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
                                                        tab: "siswa",
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
                        {currentTab === "guru" && teachers && (
                            <div>
                                <Toolbar
                                    search={search}
                                    setSearch={setSearch}
                                    handleSearch={handleSearch}
                                    onImport={() => { setImportEntity("teachers"); setImportModalOpen(true); }}
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
                                                    "/admin/master-data",
                                                    {
                                                        tab: "guru",
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
                        {currentTab === "kelas" && schoolClasses && (
                            <div>
                                <Toolbar
                                    search={search}
                                    setSearch={setSearch}
                                    handleSearch={handleSearch}
                                />
                                <div className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                                    <Table
                                        columns={classColumns}
                                        data={schoolClasses.data}
                                        keyExtractor={(c: SchoolClass) => c.id}
                                    />
                                    {schoolClasses.total > 0 && (
                                        <Pagination
                                            currentPage={
                                                schoolClasses.current_page
                                            }
                                            totalPages={schoolClasses.last_page}
                                            totalItems={schoolClasses.total}
                                            onPageChange={(page) =>
                                                router.get(
                                                    "/admin/master-data",
                                                    {
                                                        tab: "kelas",
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

                        {/* ── Wali Tab ── */}
                        {currentTab === "wali" && guardians && (
                            <div>
                                <Toolbar
                                    search={search}
                                    setSearch={setSearch}
                                    handleSearch={handleSearch}
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
                                                    "/admin/master-data",
                                                    {
                                                        tab: "wali",
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
                    </main>
                </div>
            </div>
            <ImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                entity={importEntity}
            />
        </>
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


