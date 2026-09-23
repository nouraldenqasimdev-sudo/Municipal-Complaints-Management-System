<?php

namespace App\Http\Controllers;

use App\Models\Municipality;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MunicipalityController extends Controller
{
    public function index()
    {
        return Municipality::all();
    }

    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'governorate' => 'nullable|string|max:255',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'address' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email'
        ]);

        $municipality = Municipality::create($request->only([
            'name', 'governorate', 'lat', 'lng', 'address', 'phone', 'email'
        ]));

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'إنشاء بلدية جديدة',
            'target' => $municipality->name,
            'details' => json_encode([
                'name' => $municipality->name,
                'address' => $municipality->address
            ]),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json($municipality, 201);
    }

    public function show(Municipality $municipality)
    {
        return $municipality;
    }

    public function update(Request $request, Municipality $municipality)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'governorate' => 'nullable|string|max:255',
            'lat' => 'sometimes|numeric',
            'lng' => 'sometimes|numeric',
            'address' => 'sometimes|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email'
        ]);

        $allowedFields = $request->only([
            'name', 'governorate', 'lat', 'lng', 'address', 'phone', 'email'
        ]);

        if (!empty($allowedFields)) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'تحديث بلدية',
                'target' => $municipality->name,
                'details' => json_encode([
                    'old_data' => $municipality->toArray(),
                    'new_data' => $allowedFields
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            $municipality->update($allowedFields);
        }

        return response()->json($municipality);
    }

    public function destroy(Municipality $municipality)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'حذف بلدية',
            'target' => $municipality->name,
            'details' => json_encode([
                'name' => $municipality->name,
                'address' => $municipality->address
            ]),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $municipality->delete();
        return response()->json(['message' => 'تم حذف البلدية بنجاح'], 204);
    }
}