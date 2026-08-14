import type { Meta, StoryObj } from '@storybook/react';
import AttendanceCalendar from '../Components/features/AttendanceCalendar';

const meta: Meta<typeof AttendanceCalendar> = {
    title: 'Features/AttendanceCalendar',
    component: AttendanceCalendar,
    tags: ['autodocs'],
    argTypes: {
        month: { control: { type: 'number', min: 1, max: 12 } },
        year: { control: 'number' },
    },
};

export default meta;
type Story = StoryObj<typeof AttendanceCalendar>;

const mockAttendances = [
    { attendance_date: '2026-08-03', status: 'present', check_in_time: '06:40' },
    { attendance_date: '2026-08-04', status: 'present', check_in_time: '06:45' },
    { attendance_date: '2026-08-05', status: 'late', check_in_time: '07:15' },
    { attendance_date: '2026-08-06', status: 'present', check_in_time: '06:50' },
    { attendance_date: '2026-08-07', status: 'sick', notes: 'Demam tinggi' },
    { attendance_date: '2026-08-10', status: 'present', check_in_time: '06:35' },
    { attendance_date: '2026-08-11', status: 'present', check_in_time: '06:42' },
    { attendance_date: '2026-08-12', status: 'absent' },
    { attendance_date: '2026-08-13', status: 'leave', notes: 'Izin lomba OSN' },
];

const mockHolidays = [
    { holiday_date: '2026-08-17', description: 'HUT Kemerdekaan RI ke-81' },
];

export const DefaultAugust: Story = {
    args: {
        month: 8,
        year: 2026,
        attendances: mockAttendances,
        holidays: mockHolidays,
        selectedDay: 14,
        onSelectDay: (day, att, holiday) => {
            alert(
                `Tanggal ${day} dipilih:\nStatus Presensi: ${att?.status ?? 'Tidak ada data'}\nLibur: ${
                    holiday?.description ?? 'Hari Efektif'
                }`
            );
        },
    },
};
