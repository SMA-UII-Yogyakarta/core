<?php

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum TeacherType: string
{
    case PIKET = 'piket';
    case WALI = 'wali';
    case BOTH = 'both';

    public function label(): string
    {
        return match($this) {
            self::PIKET => 'Guru Piket',
            self::WALI => 'Wali Kelas',
            self::BOTH => 'Piket & Wali Kelas',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PIKET => 'orange',
            self::WALI => 'blue',
            self::BOTH => 'purple',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::PIKET => 'fa-clipboard-list',
            self::WALI => 'fa-chalkboard-teacher',
            self::BOTH => 'fa-user-tie',
        };
    }
}
