<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class GuardianData
{
    public int $id;
    public ?int $user_id;
    public string $name;
    public ?string $phone;
    public ?string $address;
    public ?UserData $user;
    public ?string $created_at;
    public ?string $updated_at;
}
