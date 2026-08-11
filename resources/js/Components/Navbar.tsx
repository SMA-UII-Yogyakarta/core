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
        <header className="flex items-center justify-between px-10 py-4 bg-primary h-[70px] w-full shrink-0">
            {/* Left — Brand */}
            <div className="flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-full bg-accent flex items-center justify-center text-primary font-extrabold text-[11px] font-inter shrink-0 select-none">
                    UII
                </div>
                <span className="text-white font-bold text-[16px] font-inter tracking-wide hidden sm:block">
                    {brand}
                </span>
            </div>

            {/* Right — Icons + User */}
            <div className="flex items-center gap-5">
                <button
                    className="text-white/80 hover:text-white transition-colors text-[16px]"
                    aria-label="Cari"
                    type="button"
                >
                    <i className="fas fa-search" />
                </button>
                <button
                    className="text-white/80 hover:text-white transition-colors text-[16px]"
                    aria-label="Notifikasi"
                    type="button"
                >
                    <i className="fas fa-bell" />
                </button>
                
                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-white/20 mx-1" />

                <div className="flex items-center gap-3">
                    <span className="text-white/90 text-[14px] font-medium font-inter hidden sm:block">
                        {username}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary font-extrabold text-[10px] font-inter shrink-0 select-none">
                        {userInitial}
                    </div>
                </div>

                {showLogout && (
                    <button
                        onClick={onLogout}
                        className="text-white/70 hover:text-white transition-colors text-[13px] font-medium font-inter flex items-center gap-1.5 ml-2 border border-white/20 hover:border-white/40 px-3 py-1 rounded-md"
                        aria-label="Logout"
                        type="button"
                    >
                        <i className="fas fa-sign-out-alt text-[12px]" />
                        <span>Keluar</span>
                    </button>
                )}
            </div>
        </header>
    );
}
