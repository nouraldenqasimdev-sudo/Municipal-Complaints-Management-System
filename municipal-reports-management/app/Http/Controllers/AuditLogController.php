<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user')->latest();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', 'like', "%{$request->action}%");
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $perPage = $request->get('per_page', 50);
        return $query->paginate($perPage);
    }

    public function show(AuditLog $auditLog)
    {
        return $auditLog->load('user');
    }

    public function getStats()
    {
        $total = AuditLog::count();
        $today = AuditLog::whereDate('created_at', today())->count();
        $thisWeek = AuditLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $thisMonth = AuditLog::whereMonth('created_at', now()->month)->count();

        $topActions = AuditLog::select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        $topUsers = AuditLog::select('user_id', DB::raw('count(*) as count'))
            ->with('user:id,name')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        return response()->json([
            'total' => $total,
            'today' => $today,
            'this_week' => $thisWeek,
            'this_month' => $thisMonth,
            'top_actions' => $topActions,
            'top_users' => $topUsers
        ]);
    }
}

