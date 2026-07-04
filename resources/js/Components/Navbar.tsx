interface NavbarProps {
    brand: string;
    username?: string;
    userInitial?: string;
    showLogout?: boolean;
    onLogout?: () => void;
}

export default function Navbar({
    brand,
    username = "Administrator IT",
    userInitial = "AD",
    showLogout = true,
    onLogout,
}: NavbarProps) {
    return (
        <header className="flex items-center justify-between px-6 lg:px-10 py-3.75 bg-primary h-17.5 w-full shrink-0">
            {/* Left — Brand */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-sm font-inter shrink-0">
                    UII
                </div>
                <span className="text-white font-bold text-[16px] font-inter tracking-wide hidden sm:block">
                    {brand}
                </span>
            </div>

            {/* Right — Icons + User */}
            <div className="flex items-center gap-4 lg:gap-5">
                <button
                    className="text-white/70 hover:text-white transition-colors text-lg"
                    aria-label="Notifikasi"
                    type="button"
                >
                    <i className="fas fa-bell" />
                </button>
                <button
                    className="text-white/70 hover:text-white transition-colors text-lg"
                    aria-label="Pengaturan"
                    type="button"
                >
                    <i className="fas fa-cog" />
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-white/90 text-[14px] font-inter hidden sm:block">
                        {username}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-sm font-inter shrink-0">
                        {userInitial}
                    </div>
                </div>
                {showLogout && (
                    <button
                        onClick={onLogout}
                        className="text-white/70 hover:text-white transition-colors text-sm font-inter ml-2"
                        aria-label="Logout"
                        type="button"
                    >
                        <i className="fas fa-sign-out-alt mr-1" />
                        <span className="hidden lg:inline">Keluar</span>
                    </button>
                )}
            </div>
        </header>
    );
}
