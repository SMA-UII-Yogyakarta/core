interface NavbarProps {
    username?: string;
    userInitial?: string;
    showLogout?: boolean;
    onLogout?: () => void;
}

export default function Navbar({
    username = "Administrator IT",
    userInitial = "AD",
    showLogout = true,
    onLogout,
}: NavbarProps) {
    return (
        <header className="flex items-center justify-end px-8 bg-primary h-[72px] w-full shrink-0 relative">
            <div className="absolute inset-y-0 left-0 w-4 bg-primary" /> {/* Seamless cover */}
            
            {/* Right — Actions + User */}
            <div className="flex items-center gap-5">
                {/* Search */}
                <button
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Cari"
                    type="button"
                >
                    <i className="fas fa-search text-[17px]" />
                </button>

                {/* Bell */}
                <button
                    className="relative text-white/80 hover:text-white transition-colors"
                    aria-label="Notifikasi"
                    type="button"
                >
                    <i className="fas fa-bell text-[17px]" />
                </button>

                {/* Divider */}
                <div className="h-5 w-px bg-white/20 hidden sm:block" />

                {/* Username + Avatar */}
                <div className="flex items-center gap-2.5">
                    <span className="text-white/90 text-[13.5px] font-inter hidden sm:block">
                        {username}
                    </span>
                    <button
                        onClick={showLogout ? onLogout : undefined}
                        title={showLogout ? "Keluar" : undefined}
                        className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-[13px] font-inter shrink-0 hover:opacity-90 transition-opacity select-none"
                        type="button"
                    >
                        {userInitial}
                    </button>
                </div>
            </div>
        </header>
    );
}
