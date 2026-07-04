export type SidebarStatus = 'active' | 'default';

export interface SidebarMenuItem {
    label: string;
    icon: string;
    status: SidebarStatus;
    badge?: number;
    href?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type StatColor = 'green' | 'amber' | 'blue' | 'red' | 'grey';

export type StatusVariant =
    | 'present' | 'late' | 'absent'
    | 'sick' | 'permission'
    | 'active' | 'inactive'
    | 'pending' | 'approved' | 'rejected';
