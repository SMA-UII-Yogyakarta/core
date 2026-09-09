<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error Simulator — SMA UII Yogyakarta</title>
    @vite('resources/css/app.css')
    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-..."
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
    />
</head>
<body class="antialiased bg-background font-inter">
    <div class="min-h-screen flex items-center justify-center p-6">
        <div class="w-full max-w-xl">
            <h1 class="text-2xl font-bold text-primary mb-1">Simulasi Halaman Error</h1>
            <p class="text-text-muted text-sm mb-8">
                Alat verifikasi tampilan error. Klik salah satu kode — link dibuka di tab baru
                (full-page load) agar halaman error benar-benar ter-render.
            </p>
            <div class="grid grid-cols-2 gap-3">
                @foreach ($codes as $code)
                    <a href="{{ route('dev.errors.show', $code) }}"
                       target="_blank"
                       rel="noopener"
                       class="inline-flex items-center gap-3 bg-white border border-border rounded-lg px-4 py-3 font-semibold text-text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors">
                        <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-danger/10 text-danger text-[11px] font-bold shrink-0">{{ $code }}</span>
                        <span class="text-[14px]">Simulasi {{ $code }}</span>
                        <i class="fas fa-external-link-alt text-[11px] text-text-muted ml-auto"></i>
                    </a>
                @endforeach
            </div>
        </div>
    </div>
</body>
</html>