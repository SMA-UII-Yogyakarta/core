<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: sans-serif; font-size: 12px; }
    h1 { text-align: center; font-size: 16px; margin-bottom: 5px; }
    h2 { text-align: center; font-size: 13px; color: #666; margin-top: 0; font-weight: normal; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f3f4f6; padding: 8px 6px; text-align: left; font-size: 11px; border: 1px solid #d1d5db; }
    td { padding: 6px; border: 1px solid #d1d5db; font-size: 11px; }
    .present { color: #16a34a; font-weight: bold; }
    .late { color: #d97706; font-weight: bold; }
    .absent { color: #dc2626; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #999; }
</style>
</head>
<body>
    <h1>Rekap Kehadiran Harian</h1>
    <h2>{{ $date }}</h2>
    @if($class)
        <p style="text-align:center;font-size:12px;">Kelas: {{ $class->name }}</p>
    @endif
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Status</th>
                <th>Jam Masuk</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $i => $s)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $s['nis'] }}</td>
                <td>{{ $s['name'] }}</td>
                <td>{{ $s['class'] }}</td>
                <td class="{{ strtolower($s['status']) }}">{{ $s['status'] }}</td>
                <td>{{ $s['check_in_time'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="footer">Dicetak pada {{ now()->translatedFormat('d F Y H:i') }}</div>
</body>
</html>
