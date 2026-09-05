export interface NavItem {
    key: string;
    label: string;
    icon: string;
    href: string;
    roles?: string[];
    badge?: string;
    labelKey?: string;
}

export interface NavSection {
    key: string;
    label: string;
    roles?: string[];
    items: NavItem[];
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "danger-outline" | "success" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type StatColor = "green" | "amber" | "blue" | "red" | "grey";

export type StatusVariant =
    | "present"
    | "late"
    | "absent"
    | "sick"
    | "permission"
    | "active"
    | "inactive"
    | "pending"
    | "approved"
    | "rejected";
