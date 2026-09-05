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

        $activeRole = null;
        if ($user && $user->role === 'teacher' && $user->teacher) {
            $types = $user->teacher->teacher_type?->map(fn ($t) => $t->value)->toArray() ?? [];

            $activeRole = session('active_teacher_role');
            if (! $activeRole || ! in_array($activeRole, $types)) {
                $activeRole = in_array('homeroom', $types) ? 'homeroom' : (in_array('duty', $types) ? 'duty' : null);
                if ($activeRole) {
                    session(['active_teacher_role' => $activeRole]);
                }
            }
        }

        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'auth' => [
                'user' => $user
                    ? array_merge($user->only('id', 'name', 'email', 'role', 'teacher'), [
                        'avatar' => $user->avatar,
                        'avatar_url' => $user->avatar,
                        'active_teacher_role' => $activeRole,
                    ])
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
'navSections' => $user ? PermissionRegistry::getNavFor($user, $activeRole) : [],
            'navBadges' => $this->getNavBadges($user),
            // Flash Messages untuk Toast component
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
        ];
    }

    private function getNavBadges($user): array
    {
        if (! $user || $user->role !== 'teacher') {
            return [];
        }

        $teacher = $user->teacher;
        if (! $teacher || ! $teacher->isHomeroom()) {
            return [];
        }

        $schoolClass = $teacher->schoolClasses()->first();
        if (! $schoolClass) {
            return [];
        }

        $studentIds = \App\Models\Student::where('class_id', $schoolClass->id)
            ->where('status', 'Active')
            ->pluck('id')
            ->all();

        $pendingCount = \App\Models\LeaveRequest::where('approval_status', 'Pending')
            ->whereIn('student_id', $studentIds)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->count();

        return [
            'pendingLeaveCount' => $pendingCount,
        ];
    }
}
