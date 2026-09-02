<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $user->load(['student', 'teacher', 'guardian']);

        return Inertia::render('Profile', [
            'user' => $user,
            'sessions' => $this->getSessions($user),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'remove_avatar' => 'nullable|boolean',
            'current_password' => 'nullable|required_with:password',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->boolean('remove_avatar')) {
            $user->avatar = null;
        } elseif ($request->hasFile('avatar')) {
            $storageService = app(\App\Services\StorageService::class);
            $user->avatar = $storageService->uploadAvatar($request->file('avatar'), $user->id);
        }

        if ($request->filled('password')) {
            if (! Hash::check($request->current_password, $user->password)) {
                return redirect()->back()->with('error', 'Password saat ini tidak sesuai.');
            }
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updateAvatar(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $storageService = app(\App\Services\StorageService::class);
        $user->avatar = $storageService->uploadAvatar($request->file('avatar'), $user->id);
        $user->save();

        return redirect()->back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    public function deleteAvatar(Request $request)
    {
        $user = Auth::user();
        $user->avatar = null;
        $user->save();

        return redirect()->back()->with('success', 'Foto profil berhasil dihapus.');
    }

    public function revokeSession(Request $request, string $id)
    {
        $user = Auth::user();
        $user->tokens()->where('id', $id)->delete();

        return redirect()->back()->with('success', 'Sesi berhasil dicabut.');
    }

    public function switchRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string|in:duty,homeroom',
        ]);

        $user = Auth::user();
        if ($user->role !== 'teacher') {
            return redirect()->back()->with('error', 'Hanya guru yang dapat mengubah peran aktif.');
        }

        $teacherTypes = $user->teacher->teacher_type?->map(fn($t) => $t->value)->toArray() ?? [];
        if (!is_array($teacherTypes) || !in_array($request->role, $teacherTypes)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk peran tersebut.');
        }

        session(['active_teacher_role' => $request->role]);

        $previousUrl = url()->previous();
        $isTeacherDashboard = str_contains($previousUrl, '/teacher/duty') || str_contains($previousUrl, '/teacher/homeroom');

        $roleLabel = $request->role === 'duty' ? 'Guru Piket' : 'Wali Kelas';

        if ($isTeacherDashboard) {
            $targetRoute = $request->role === 'duty' ? 'teacher.duty' : 'teacher.homeroom';
            return redirect()->route($targetRoute)->with('success', 'Peran berhasil diubah menjadi ' . $roleLabel . '.');
        }

        return redirect()->back()->with('success', 'Peran berhasil diubah menjadi ' . $roleLabel . '.');
    }

    private function getSessions($user): array
    {
        return $user->tokens()
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at?->diffForHumans(),
                'created_at' => $token->created_at?->diffForHumans(),
            ])->toArray();
    }
}
