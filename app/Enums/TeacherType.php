<?php

namespace App\Enums;

enum TeacherType: string
{
    case HOMEROOM = 'homeroom';
    case DUTY = 'duty';

    public function label(): string
    {
        return match($this) {
            self::HOMEROOM => 'Wali Kelas',
            self::DUTY => 'Guru Piket',
        };
    }
}
