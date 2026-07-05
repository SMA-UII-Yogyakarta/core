import type { IconType } from 'react-icons';
import Badge from './Badge';

interface SidebarItemProps {
  icon: IconType;
  label: string;
  active?: boolean;
  badge?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function SidebarItem({
  icon: Icon,
  label,
  active = false,
  badge,
  href,
  onClick,
  className = '',
}: SidebarItemProps) {
  /**
   * From component.css:
   * - Active:   bg-accent (#FAE62A), icon+text text-primary (#2E3391), font-bold, rounded-lg
   * - Default:  transparent bg, icon+text white/60, font-normal, rounded-lg
   * - padding: 12px 18px, gap: 12px, height: 41px
   */

  const content = (
    <div
      className={`
        flex items-center gap-3 px-[18px] py-3 w-full
        rounded-lg cursor-pointer transition-colors duration-150
        ${active
          ? 'bg-accent text-primary font-bold'
          : 'text-white/60 font-normal hover:bg-white/10'
        }
        ${className}
      `.trim()}
      onClick={onClick}
    >
      {/* Icon container — FA5 14px */}
      <span className="w-4 h-3.5 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </span>

      {/* Label — Semantic/Strong 14px */}
      <span className="text-sm leading-[17px] flex-1">{label}</span>

      {/* Badge notification */}
      {badge !== undefined && badge > 0 && (
        <Badge variant="danger" size="sm">
          {badge}
        </Badge>
      )}
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
