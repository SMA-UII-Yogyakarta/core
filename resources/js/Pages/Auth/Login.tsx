import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Button, Input, BrandLogo } from '@/Components/ui/index';
import { FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call — will be replaced with Inertia POST
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  /* ---------- Mobile View ---------- */
  const MobileView = () => (
    <div className="min-h-screen bg-background flex flex-col lg:hidden">
      {/* Header area */}
      <div className="bg-primary h-44 flex flex-col items-center justify-center gap-3 relative">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <span className="text-primary text-sm font-extrabold leading-none">UII</span>
        </div>
        <h1 className="text-white text-sm font-bold tracking-[0.15em] uppercase">
          SSO Mobile
        </h1>
      </div>

      {/* Form card */}
      <div className="flex-1 -mt-8 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col gap-5"
        >
          <Input
            icon={FaUser}
            placeholder="Username / NISN"
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            required
          />
          <Input
            icon={FaLock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            MASUK
          </Button>
        </form>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-text-muted">© 2026 SMA UII Yogyakarta</p>
      </footer>
    </div>
  );

  /* ---------- Desktop View ---------- */
  const DesktopView = () => (
    <div className="hidden lg:flex w-full max-w-[650px]">
      <div className="flex w-full rounded-xl overflow-hidden shadow-lg">
        {/* Left panel — brand info */}
        <div className="w-72 bg-primary p-8 flex flex-col justify-center gap-4">
          <BrandLogo variant="light" />
          <p className="text-white/80 text-sm font-medium mt-2 leading-relaxed">
            Portal SSO Mandiri
          </p>
          <p className="text-white/40 text-xs leading-relaxed">
            Sistem absensi digital terintegrasi dengan geolokasi, biometrik kamera,
            dan SSO untuk SMA UII Yogyakarta.
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-surface p-8 flex flex-col justify-center">
          <div className="mb-6">
            <BrandLogo variant="dark" />
          </div>

          <h2 className="text-lg font-bold text-text-primary mb-6">
            Sign In Institusi
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              icon={FaUser}
              placeholder="Username / NISN"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              required
            />
            <Input
              icon={FaLock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              MASUK
            </Button>
          </form>

          <p className="mt-6 text-xs text-text-muted text-center">
            © 2026 SMA UII Yogyakarta
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head title="Login" />

      {/* Mobile — standalone */}
      <MobileView />

      {/* Desktop — wrapped in AuthLayout */}
      <div className="hidden lg:block">
        <AuthLayout>
          <DesktopView />
        </AuthLayout>
      </div>
    </>
  );
}
