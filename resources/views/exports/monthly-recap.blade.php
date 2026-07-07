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
    .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #999; }
</style>
</head>
<body>
    <h1>Rekap Kehadiran Bulanan</h1>
    <h2>{{ $monthName }} {{ $year }}</h2>
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
                <th>Hadir</th>
                <th>Terlambat</th>
                <th>Alpa</th>
                <th>Persentase</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $i => $s)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $s['nis'] }}</td>
                <td>{{ $s['name'] }}</td>
                <td>{{ $s['class'] }}</td>
                <td>{{ $s['present'] }}</td>
                <td>{{ $s['late'] }}</td>
                <td>{{ $s['absent'] }}</td>
                <td>{{ $s['percentage'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="footer">Dicetak pada {{ now()->translatedFormat('d F Y H:i') }}</div>
</body>
</html>
