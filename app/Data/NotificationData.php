<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NotificationData
{
    public int $id;
    public ?int $sender_id;
    public ?int $recipient_id;
    public ?string $target_group;
    public string $title;
    public string $content;
    public bool $is_read;
    public ?UserData $sender;
    public ?string $created_at;
}
