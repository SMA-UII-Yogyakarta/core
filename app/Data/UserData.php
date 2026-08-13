<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData
{
    public int $id;
    public string $name;
    public string $email;
    public string $role;
    public ?string $avatar;
    public ?string $created_at;
    public ?string $updated_at;
}
