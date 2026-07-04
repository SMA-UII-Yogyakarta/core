<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Process\Process;

#[AsCommand(name: 'log:tail')]
class LogTailCommand extends Command
{
    protected $signature = 'log:tail
        {--filter= : Filter logs by the given value}
        {--message= : Filter logs by the given message}
        {--level= : Filter logs by the given level}
        {--timeout=3600 : The maximum execution time in seconds}';

    protected $description = 'Tail application logs (cross-platform fallback for pail)';

    public function handle(): int
    {
        if (PHP_OS_FAMILY === 'Windows') {
            return $this->tailWindows();
        }

        return $this->tailUnix();
    }

    protected function tailUnix(): int
    {
        $pail = array_filter([
            'php', 'artisan', 'pail',
            '--timeout=' . $this->option('timeout'),
            $this->option('level') ? '--level=' . $this->option('level') : null,
            $this->option('filter') ? '--filter=' . $this->option('filter') : null,
            $this->option('message') ? '--message=' . $this->option('message') : null,
        ]);

        $process = new Process(array_values($pail), base_path());
        $process->setTimeout((int) $this->option('timeout'));
        $process->setTty(false);
        $process->run(function (string $type, string $buffer) {
            $this->output->write($buffer);
        });

        return $process->getExitCode();
    }

    protected function tailWindows(): int
    {
        $logFile = storage_path('logs/laravel.log');
        $timeout = (int) $this->option('timeout');
        $startTime = time();

        if (! file_exists($logFile)) {
            $this->components->warn("Log file not found: $logFile");
            $this->line('Waiting for log file to be created...');
        }

        $this->components->info('Tailing application logs (Windows fallback mode). Press Ctrl+C to exit.');

        $currentSize = file_exists($logFile) ? filesize($logFile) : 0;

        while (true) {
            if (! file_exists($logFile)) {
                usleep(500_000);
                continue;
            }

            $newSize = filesize($logFile);

            if ($newSize > $currentSize) {
                $handle = fopen($logFile, 'r');
                fseek($handle, $currentSize);

                while (! feof($handle)) {
                    $line = fgets($handle);
                    if ($line === false) {
                        break;
                    }
                    $line = rtrim($line, "\r\n");

                    if ($line === '') {
                        continue;
                    }

                    if (! $this->passesFilter($line)) {
                        continue;
                    }

                    $this->line("  <fg=gray>[$this->formatTimestamp()]</> $line");
                }

                fclose($handle);
                $currentSize = $newSize;
            } elseif ($newSize < $currentSize) {
                $currentSize = 0;
            }

            if ($timeout > 0 && (time() - $startTime) >= $timeout) {
                $this->components->info('Maximum execution time exceeded.');
                break;
            }

            usleep(500_000);
        }

        return 0;
    }

    protected function passesFilter(string $line): bool
    {
        $level = $this->option('level');
        if ($level && ! str_contains(strtolower($line), strtolower(".$level") ?? strtolower($level))) {
            $parts = explode('.', $line);
            if (count($parts) < 2 || strtolower(explode(' ', $parts[1] ?? '')[0]) !== strtolower($level)) {
                return false;
            }
        }

        $filter = $this->option('filter');
        if ($filter && ! str_contains(strtolower($line), strtolower($filter))) {
            return false;
        }

        $message = $this->option('message');
        if ($message && ! str_contains(strtolower($line), strtolower($message))) {
            return false;
        }

        return true;
    }

    protected function formatTimestamp(): string
    {
        return date('H:i:s');
    }
}
