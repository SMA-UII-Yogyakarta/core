import { router } from '@inertiajs/react'
import { useState } from 'react'

interface Student {
  id: number
  nis: string
  name: string
  class: string
  original_status: string
  overridden_status: string | null
  current_status: string
  override_id: number | null
  check_in_time: string | null
}

interface SchoolClass {
  id: number
  name: string
}

interface Props {
  students: Student[]
  classes: SchoolClass[]
  filters: { date: string; class_id: number | null }
}

export default function KoreksiAbsensi({ students, classes, filters }: Props) {
  const [selectedDate, setSelectedDate] = useState(filters.date)
  const [selectedClass, setSelectedClass] = useState(filters.class_id ?? '')
  const [modal, setModal] = useState<{
    open: boolean
    student: Student | null
    newStatus: string
    reason: string
  }>({ open: false, student: null, newStatus: 'Present', reason: '' })

  function applyFilter() {
    router.get(route('admin.attendance.override'), {
      date: selectedDate,
      class_id: selectedClass || undefined,
    })
  }

  function openModal(student: Student) {
    setModal({
      open: true,
      student,
      newStatus: student.current_status,
      reason: '',
    })
  }

  function submitOverride() {
    if (!modal.student || !modal.reason.trim()) return
    router.post(route('admin.attendance.override.store'), {
      student_id: modal.student.id,
      date: selectedDate,
      new_status: modal.newStatus,
      reason: modal.reason,
    })
    setModal({ open: false, student: null, newStatus: 'Present', reason: '' })
  }

  function deleteOverride(overrideId: number) {
    if (!confirm('Hapus override ini?')) return
    router.delete(route('admin.attendance.override.destroy', overrideId))
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Present: 'bg-green-100 text-green-800',
      Late: 'bg-yellow-100 text-yellow-800',
      Absent: 'bg-red-100 text-red-800',
      Sick: 'bg-blue-100 text-blue-800',
      Permit: 'bg-purple-100 text-purple-800',
    }
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}
      >
        {status}
      </span>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Koreksi Absensi</h1>

      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : '')}
            className="border rounded px-3 py-2"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={applyFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tampilkan
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2 border">No</th>
              <th className="text-left px-3 py-2 border">NIS</th>
              <th className="text-left px-3 py-2 border">Nama</th>
              <th className="text-left px-3 py-2 border">Kelas</th>
              <th className="text-left px-3 py-2 border">Jam Masuk</th>
              <th className="text-center px-3 py-2 border">Status Asli</th>
              <th className="text-center px-3 py-2 border">Status Saat Ini</th>
              <th className="text-center px-3 py-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border">{i + 1}</td>
                <td className="px-3 py-2 border">{s.nis}</td>
                <td className="px-3 py-2 border">{s.name}</td>
                <td className="px-3 py-2 border">{s.class}</td>
                <td className="px-3 py-2 border">{s.check_in_time ?? '-'}</td>
                <td className="px-3 py-2 border text-center">
                  {statusBadge(s.original_status)}
                </td>
                <td className="px-3 py-2 border text-center">
                  {statusBadge(s.current_status)}
                </td>
                <td className="px-3 py-2 border text-center">
                  <button
                    onClick={() => openModal(s)}
                    className="text-blue-600 hover:underline text-sm mr-2"
                  >
                    Ubah
                  </button>
                  {s.override_id && (
                    <button
                      onClick={() => deleteOverride(s.override_id!)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && modal.student && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              Koreksi — {modal.student.name}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={modal.newStatus}
                onChange={(e) =>
                  setModal({ ...modal, newStatus: e.target.value })
                }
                className="border rounded px-3 py-2 w-full"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Sick">Sick</option>
                <option value="Permit">Permit</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Alasan
              </label>
              <textarea
                value={modal.reason}
                onChange={(e) =>
                  setModal({ ...modal, reason: e.target.value })
                }
                className="border rounded px-3 py-2 w-full"
                rows={3}
                placeholder="Alasan perubahan..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setModal({
                    open: false,
                    student: null,
                    newStatus: 'Present',
                    reason: '',
                  })
                }
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={submitOverride}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
