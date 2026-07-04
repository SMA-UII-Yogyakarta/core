<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 — {{ __('Halaman Tidak Ditemukan') }} | SMA UII Yogyakarta</title>
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
        <div class="text-center max-w-md">
            <div class="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-search text-2xl text-warning"></i>
            </div>
            <h1 class="text-[48px] font-bold text-primary leading-none mb-2">404</h1>
            <h2 class="text-[18px] font-bold text-text-primary mb-2">{{ __('Halaman Tidak Ditemukan') }}</h2>
            <p class="text-[14px] text-text-muted mb-8 leading-relaxed">
                Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
                Periksa kembali URL atau navigasi dari menu.
            </p>
            <a href="{{ url('/') }}"
               class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold text-[14px] hover:bg-primary/90 transition-colors">
                <i class="fas fa-arrow-left text-[12px]"></i>
                Kembali ke Beranda
            </a>
        </div>
    </div>
</body>
</html>
