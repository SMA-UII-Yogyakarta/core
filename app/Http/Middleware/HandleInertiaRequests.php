<?php

namespace App\Http\Middleware;

use App\Permissions\PermissionRegistry;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'auth' => [
                'user' => $user
                    ? $user->only('id', 'name', 'email', 'role', 'teacher')
                    : null,
                'unreadCount' => $user
                    ? \App\Models\Notification::where(function ($query) use ($user) {
                        $query->where('recipient_id', $user->id)
                              ->orWhere(function ($q) use ($user) {
                                  $q->whereNull('recipient_id')
                                    ->where(function ($sub) use ($user) {
                                        $sub->where('target_group', 'all')
                                            ->orWhere('target_group', $user->role);
                                    });
                              });
                    })
                    ->whereNotIn('id', function ($query) use ($user) {
                        $query->select('notification_id')
                              ->from('notification_reads')
                              ->where('user_id', $user->id);
                    })
                    ->count()
                    : 0,
                'recentNotifications' => $user
                    ? \App\Models\Notification::where(function ($query) use ($user) {
                        $query->where('recipient_id', $user->id)
                              ->orWhere(function ($q) use ($user) {
                                  $q->whereNull('recipient_id')
                                    ->where(function ($sub) use ($user) {
                                        $sub->where('target_group', 'all')
                                            ->orWhere('target_group', $user->role);
                                    });
                              });
                    })
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($n) use ($user) {
                        return [
                            'id' => $n->id,
                            'title' => $n->title,
                            'content' => $n->content,
                            'created_at' => $n->created_at ? $n->created_at->diffForHumans() : null,
                            'is_read' => \App\Models\NotificationRead::where('notification_id', $n->id)
                                ->where('user_id', $user->id)
                                ->exists(),
                        ];
                    })
                    : [],
            ],
            'navSections' => $user ? PermissionRegistry::getNavFor($user) : [],
            // Flash Messages untuk Toast component
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
        ];
    }
}
