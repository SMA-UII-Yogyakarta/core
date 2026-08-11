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
            'current_password' => 'nullable|required_with:password',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            if (! Hash::check($request->current_password, $user->password)) {
                return redirect()->back()->with('error', 'Password saat ini tidak sesuai.');
            }
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function revokeSession(Request $request, string $id)
    {
        $user = Auth::user();
        $user->tokens()->where('id', $id)->delete();

        return redirect()->back()->with('success', 'Sesi berhasil dicabut.');
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
