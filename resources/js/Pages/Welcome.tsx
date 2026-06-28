import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <AppLayout>
                <div className="flex max-w-[335px] w-full flex-col-reverse lg:max-w-4xl lg:flex-row">
                    <div className="text-[13px] leading-[20px] flex-1 p-6 pb-6 lg:p-20 lg:pb-10 bg-white dark:bg-[#161615] dark:text-[#EDEDEC] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d] rounded-bl-lg rounded-br-lg lg:rounded-tl-lg lg:rounded-br-none">
                        <h1 className="mb-1 font-medium">
                            Let&apos;s get started
                        </h1>
                        <p className="mb-2 text-[#706f6c] dark:text-[#A1A09A]">
                            Sistem Presensi Digital Terintegrasi dengan
                            Geolokasi, Biometrik Kamera &amp; SSO
                        </p>
                    </div>

                    <div className="relative lg:ml-0 -ml-8 w-[438px] max-w-[335px] lg:max-w-4xl lg:w-[438px] lg:aspect-auto aspect-[335/364]">
                        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white/10 lg:from-transparent to-transparent" />
                        <svg className="w-full h-full" viewBox="0 0 438 364" fill="none">
                            <rect width="438" height="364" rx="16" fill="url(#gradient)" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#f53003" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#f53003" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
