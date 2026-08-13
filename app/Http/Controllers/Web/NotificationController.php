<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationRead;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;

        // Fetch notifications for the user
        $notifications = Notification::where(function ($query) use ($user, $role) {
            $query->where('recipient_id', $user->id)
                  ->orWhere(function ($q) use ($role) {
                      $q->whereNull('recipient_id')
                        ->where(function ($sub) use ($role) {
                            $sub->where('target_group', 'all')
                                ->orWhere('target_group', $role);
                        });
                  });
        })
        ->with('sender')
        ->latest()
        ->paginate(15);

        // Get read notifications IDs
        $readIds = NotificationRead::where('user_id', $user->id)
            ->pluck('notification_id')
            ->toArray();

        $notifications->getCollection()->transform(function ($n) use ($readIds) {
            $n->is_read = in_array($n->id, $readIds);
            return $n;
        });

        // If admin, load sent notifications for management
        $sentNotifications = null;
        if ($role === 'admin') {
            $sentNotifications = Notification::with('sender')
                ->latest()
                ->paginate(15, ['*'], 'sent_page');
        }

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
            'sentNotifications' => $sentNotifications,
            'unreadCount' => $this->getUnreadCount($user, $role),
        ]);
    }

    public function store(Request $request)
    {
        // Only admin can broadcast/create notifications
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'target_group' => 'required|string|in:all,student,teacher,guardian',
        ]);

        Notification::create([
            'sender_id' => Auth::id(),
            'target_group' => $request->target_group,
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return redirect()->back()->with('success', 'Notifikasi berhasil dikirim.');
    }

    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();

        // Check if notification exists
        $notification = Notification::findOrFail($id);

        // Create read record if not exists
        NotificationRead::firstOrCreate([
            'notification_id' => $notification->id,
            'user_id' => $user->id,
        ], [
            'read_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Notifikasi ditandai telah dibaca.');
    }

    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;

        // Fetch all unread notification IDs
        $unreadIds = Notification::where(function ($query) use ($user, $role) {
            $query->where('recipient_id', $user->id)
                  ->orWhere(function ($q) use ($role) {
                      $q->whereNull('recipient_id')
                        ->where(function ($sub) use ($role) {
                            $sub->where('target_group', 'all')
                                ->orWhere('target_group', $role);
                        });
                  });
        })
        ->whereNotIn('id', function ($query) use ($user) {
            $query->select('notification_id')
                  ->from('notification_reads')
                  ->where('user_id', $user->id);
        })
        ->pluck('id');

        foreach ($unreadIds as $id) {
            NotificationRead::firstOrCreate([
                'notification_id' => $id,
                'user_id' => $user->id,
            ], [
                'read_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Semua notifikasi ditandai telah dibaca.');
    }

    public function destroy($id)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $notification = Notification::findOrFail($id);
        $notification->delete();

        return redirect()->back()->with('success', 'Notifikasi berhasil dihapus.');
    }

    private function getUnreadCount($user, $role)
    {
        return Notification::where(function ($query) use ($user, $role) {
            $query->where('recipient_id', $user->id)
                  ->orWhere(function ($q) use ($role) {
                      $q->whereNull('recipient_id')
                        ->where(function ($sub) use ($role) {
                            $sub->where('target_group', 'all')
                                ->orWhere('target_group', $role);
                        });
                  });
        })
        ->whereNotIn('id', function ($query) use ($user) {
            $query->select('notification_id')
                  ->from('notification_reads')
                  ->where('user_id', $user->id);
        })
        ->count();
    }
}
