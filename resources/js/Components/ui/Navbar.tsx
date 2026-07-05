import { FaUserCircle, FaBars, FaSignOutAlt } from 'react-icons/fa';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  user?: { name: string; email: string } | null;
  onMenuClick?: () => void;
  className?: string;
}

export default function Navbar({ user, onMenuClick, className = '' }: NavbarProps) {
  return (
    <header
      className={`
        h-16 bg-surface border-b border-border
        flex items-center justify-between px-4 lg:px-6
        ${className}
      `.trim()}
    >
      {/* Left — Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-text-secondary hover:text-text-primary"
        aria-label="Toggle menu"
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Center/Left — Brand desktop */}
      <div className="hidden lg:block">
        <BrandLogo variant="dark" />
      </div>

      {/* Right — User info */}
      {user && (
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{user.name}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>

          <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-text-muted">
            <FaUserCircle className="w-6 h-6" />
          </div>

          <button
            className="p-2 text-text-muted hover:text-danger transition-colors"
            title="Logout"
          >
            <FaSignOutAlt className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
