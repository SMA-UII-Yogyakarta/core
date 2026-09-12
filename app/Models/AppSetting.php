<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $table = 'app_settings';
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    /**
     * Get all app settings cached in a single memory lookup key (O(1) memory read, 0 DB queries).
     *
     * @return array<string, string>
     */
    public static function allCached(): array
    {
        try {
            return Cache::rememberForever('app_settings:all', function () {
                return static::query()->pluck('value', 'key')->all();
            });
        } catch (\Throwable) {
            return [];
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $cached = static::allCached();
        if (array_key_exists($key, $cached)) {
            return $cached[$key];
        }

        return $default;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        Cache::forget("app_setting:{$key}");
        Cache::forget('app_settings:all');
    }

    /**
     * @param  array<string, mixed>  $settings
     */
    public static function setMany(array $settings): void
    {
        foreach ($settings as $key => $value) {
            static::updateOrCreate(['key' => $key], ['value' => (string) $value]);
            Cache::forget("app_setting:{$key}");
        }
        Cache::forget('app_settings:all');
    }
}
