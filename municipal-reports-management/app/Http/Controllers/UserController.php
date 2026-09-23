<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('municipality');
        
        if ($request->has('role')) {
            $query->byRole($request->role);
        }
        
        if ($request->has('municipality_id')) {
            $query->byMunicipality((int)$request->municipality_id);
        }
        
        if ($request->has('is_active')) {
            if ($request->is_active === 'true') {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:citizen,municipality,admin',
            'national_id' => 'nullable|string|unique:users',
            'governorate' => 'nullable|string',
            'municipality_id' => 'nullable|exists:municipalities,id',
            'is_active' => 'sometimes|boolean',
            'current_lat' => 'nullable|numeric',
            'current_lng' => 'nullable|numeric'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'national_id' => $request->national_id,
            'governorate' => $request->governorate,
            'municipality_id' => $request->municipality_id,
            'is_active' => $request->is_active ?? true,
            'current_lat' => $request->current_lat,
            'current_lng' => $request->current_lng
        ]);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'إنشاء مستخدم جديد',
            'target' => "#{$user->id}",
            'details' => json_encode([
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json($user->load('municipality'), 201);
    }

    public function show(User $user)
    {
        return $user->load('municipality');
    }

    public function update(Request $request, User $user)
    {
         
        $currentUser = Auth::user();
        
        if ($currentUser->hasRole('admin') && $currentUser->id !== $user->id) {
            $request->validate([
                'role' => 'sometimes|in:citizen,municipality,admin',
                'is_active' => 'sometimes|boolean'
            ]);

            $data = $request->only(['role', 'is_active']);
            
            $oldRole = $user->role;
            $oldIsActive = $user->is_active;
            
            $user->update($data);
            
            if (isset($data['role']) && $data['role'] !== $oldRole) {
                AuditLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'تغيير صلاحيات المستخدم',
                    'target' => "#{$user->id}",
                    'details' => json_encode([
                        'user_name' => $user->name,
                        'old_role' => $oldRole,
                        'new_role' => $data['role']
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }
            
            if (isset($data['is_active']) && $data['is_active'] !== $oldIsActive) {
                AuditLog::create([
                    'user_id' => Auth::id(),
                    'action' => $data['is_active'] ? 'تفعيل حساب مستخدم' : 'تعطيل حساب مستخدم',
                    'target' => "#{$user->id}",
                    'details' => json_encode([
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                        'status' => $data['is_active'] ? 'active' : 'inactive'
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }
            
            return response()->json($user->load('municipality'));
        }
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'string', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'municipality_id' => 'nullable|exists:municipalities,id',
            'current_lat' => 'nullable|numeric',
            'current_lng' => 'nullable|numeric'
        ]);

        $data = $request->only([
            'name', 'email', 'phone', 'municipality_id', 
            'current_lat', 'current_lng'
        ]);

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user->load('municipality'));
    }

    public function destroy(User $user)
    {
        $userData = [
            'deleted_user_id' => $user->id,
            'deleted_user_name' => $user->name,
            'deleted_user_email' => $user->email,
            'deleted_user_phone' => $user->phone,
            'deleted_user_role' => $user->role,
            'deleted_user_national_id' => $user->national_id,
            'deleted_user_governorate' => $user->governorate,
            'deleted_user_municipality_id' => $user->municipality_id,
            'deleted_user_is_active' => $user->is_active,
            'deleted_at' => now()->toDateTimeString(),
            'can_restore' => true
        ];

        $auditLog = AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'حذف مستخدم',
            'target' => "#{$user->id}",
            'details' => json_encode($userData, JSON_UNESCAPED_UNICODE),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $user->delete();
        return response()->json([
            'message' => 'تم حذف المستخدم بنجاح',
            'audit_log_id' => $auditLog->id
        ], 204);
    }

    public function restore(Request $request, $auditLogId)
    {
        $auditLog = AuditLog::findOrFail($auditLogId);
        
        if ($auditLog->action !== 'حذف مستخدم') {
            return response()->json([
                'message' => 'هذا السجل ليس لحذف مستخدم'
            ], 400);
        }

        $details = json_decode($auditLog->details, true);
        
        if (!isset($details['can_restore']) || !$details['can_restore']) {
            return response()->json([
                'message' => 'لا يمكن استعادة هذا المستخدم'
            ], 400);
        }

        $deletedUser = User::withTrashed()->find($details['deleted_user_id']);
        
        if (!$deletedUser) {
            return response()->json([
                'message' => 'المستخدم المحذوف غير موجود'
            ], 404);
        }

        if (!$deletedUser->trashed()) {
            return response()->json([
                'message' => 'المستخدم غير محذوف بالفعل'
            ], 400);
        }

        $deletedUser->restore();

        if (isset($details['deleted_user_is_active'])) {
            $deletedUser->is_active = $details['deleted_user_is_active'];
            $deletedUser->save();
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'تراجع عن حذف مستخدم',
            'target' => "#{$deletedUser->id}",
            'details' => json_encode([
                'restored_user_id' => $deletedUser->id,
                'restored_user_name' => $deletedUser->name,
                'restored_user_email' => $deletedUser->email,
                'restored_user_role' => $deletedUser->role,
                'original_deletion_log_id' => $auditLogId,
                'restored_at' => now()->toDateTimeString()
            ], JSON_UNESCAPED_UNICODE),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        $details['restored'] = true;
        $details['restored_at'] = now()->toDateTimeString();
        $details['restored_by'] = Auth::id();
        $auditLog->details = json_encode($details, JSON_UNESCAPED_UNICODE);
        $auditLog->save();

        return response()->json([
            'message' => 'تم استعادة المستخدم بنجاح',
            'user' => $deletedUser->load('municipality')
        ], 200);
    }

    public function getCurrentUser(Request $request)
    {
        return $request->user()->load('municipality');
    }
}