<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use App\Models\Municipality;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StatsController extends Controller
{
    

    private function calculateAverageResolutionTime($reports)
    {
        if ($reports->count() === 0) {
            return 0;
        }
        
        $totalDays = $reports->sum(function($report) {
            return $report->created_at->diffInDays($report->updated_at);
        });
        
        return round($totalDays / $reports->count(), 1);
    }

    public function getCitizenStats()
    {
        $userId = Auth::id();
        $stats = Report::where('user_id', $userId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'total' => Report::where('user_id', $userId)->count(),
            'pending' => $stats['pending'] ?? 0,
            'processing' => $stats['processing'] ?? 0,
            'in_progress' => $stats['processing'] ?? 0,
            'resolved' => $stats['resolved'] ?? 0,
            'rejected' => $stats['rejected'] ?? 0,
        ]);
    }

    public function getStaffStats()
    {
         
        $user = Auth::user();
        $municipalityId = $user->municipality_id;
        
        $assignedToMe = Report::where('municipality_id', $municipalityId)
            ->where(function($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhereNull('assigned_to');
            })
            ->count();
        
        $stats = Report::where('municipality_id', $municipalityId)
            ->where(function($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhereNull('assigned_to');
            })
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $resolvedReports = Report::where('municipality_id', $municipalityId)
            ->where(function($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhereNull('assigned_to');
            })
            ->where('status', 'resolved')
            ->whereNotNull('updated_at')
            ->whereNotNull('created_at')
            ->get();
        
        $avgDays = $this->calculateAverageResolutionTime($resolvedReports);
        $avgTime = $avgDays > 0 ? $avgDays . ' يوم' : 'لا توجد بيانات';

        return response()->json([
            'assigned_to_me' => $assignedToMe,
            'awaiting' => $stats['pending'] ?? 0,
            'closed_this_month' => Report::where('municipality_id', $municipalityId)
                ->where(function($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                      ->orWhereNull('assigned_to');
                })
                ->where('status', 'resolved')
                ->whereMonth('updated_at', now()->month)
                ->count(),
            'avg_time' => $avgTime,
        ]);
    }

    public function getAdminStats()
    {
        $totalReports = Report::count();
        $underReview = Report::where(function($q) {
            $q->where('status', 'pending')
              ->orWhere('status', 'processing');
        })->count();
        
        $resolvedReports = Report::where('status', 'resolved')
            ->whereNotNull('updated_at')
            ->whereNotNull('created_at')
            ->get();
        
        $avgResolutionDays = $this->calculateAverageResolutionTime($resolvedReports);
        
        $satisfactionRate = 0;
        if ($totalReports > 0) {
            $resolvedCount = Report::where('status', 'resolved')->count();
            $satisfactionRate = round(($resolvedCount / $totalReports) * 100, 0);
        }
        
        $lastWeek = Carbon::now()->subWeek();
        $totalReportsLastWeek = Report::where('created_at', '<', $lastWeek)->count();
        $underReviewLastWeek = Report::where('created_at', '<', $lastWeek)
            ->where(function($q) {
                $q->where('status', 'pending')->orWhere('status', 'processing');
            })
            ->count();
        
        $totalTrend = $totalReportsLastWeek > 0 
            ? round((($totalReports - $totalReportsLastWeek) / $totalReportsLastWeek) * 100, 0)
            : 0;
        
        $underReviewTrend = $underReviewLastWeek > 0
            ? round((($underReview - $underReviewLastWeek) / $underReviewLastWeek) * 100, 0)
            : 0;
        
        $municipalityRanking = Municipality::select(
                'municipalities.id',
                'municipalities.name',
                DB::raw('COUNT(reports.id) as total'),
                DB::raw('SUM(CASE WHEN reports.status = "resolved" THEN 1 ELSE 0 END) as resolved'),
                DB::raw('CASE 
                    WHEN COUNT(reports.id) > 0 
                    THEN ROUND(SUM(CASE WHEN reports.status = "resolved" THEN 1 ELSE 0 END) * 100.0 / COUNT(reports.id), 0)
                    ELSE 0 
                END as rate')
            )
            ->leftJoin('reports', 'municipalities.id', '=', 'reports.municipality_id')
            ->groupBy('municipalities.id', 'municipalities.name')
            ->havingRaw('COUNT(reports.id) > 0')
            ->orderByDesc('rate')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function($m) {
                return [
                    'id' => $m->id,
                    'name' => $m->name,
                    'total' => (int)$m->total,
                    'resolved' => (int)$m->resolved,
                    'rate' => (int)$m->rate
                ];
            });
        
        return response()->json([
            'total_reports' => $totalReports,
            'under_review' => $underReview,
            'avg_resolution_time' => $avgResolutionDays > 0 ? $avgResolutionDays . ' أيام' : 'لا توجد بيانات',
            'satisfaction_rate' => $satisfactionRate . '%',
            'total_trend' => $totalTrend,
            'under_review_trend' => $underReviewTrend,
            'municipality_ranking' => $municipalityRanking
        ]);
    }

    public function getReportsByCategory()
    {
        return Report::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get();
    }

    public function getCitizensCount()
    {
        $citizensCount = User::where('role', 'citizen')->count();
        
        return response()->json([
            'count' => $citizensCount
        ]);
    }

    public function getReportsForMap()
    {
        return Report::select('id', 'title', 'location_lat as lat', 'location_lng as lng', 'priority', 'status', 'category')
            ->whereNotNull('location_lat')
            ->get();
    }

    public function getAdminDetailedReport()
    {
        $totalReports = Report::count();
        $resolvedReports = Report::where('status', 'resolved')->count();
        $pendingReports = Report::where('status', 'pending')->count();
        $processingReports = Report::where('status', 'processing')->count();
        $rejectedReports = Report::where('status', 'rejected')->count();

        $categoryStats = Report::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        $priorityStats = Report::select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get();

        $statusStats = Report::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $municipalityStats = Municipality::select(
                'municipalities.id',
                'municipalities.name',
                DB::raw('COUNT(reports.id) as total'),
                DB::raw('SUM(CASE WHEN reports.status = "resolved" THEN 1 ELSE 0 END) as resolved'),
                DB::raw('SUM(CASE WHEN reports.status = "pending" THEN 1 ELSE 0 END) as pending'),
                DB::raw('SUM(CASE WHEN reports.status = "processing" THEN 1 ELSE 0 END) as processing')
            )
            ->leftJoin('reports', 'municipalities.id', '=', 'reports.municipality_id')
            ->groupBy('municipalities.id', 'municipalities.name')
            ->orderByDesc('total')
            ->get();

        $resolvedReportsWithTime = Report::where('status', 'resolved')
            ->whereNotNull('updated_at')
            ->whereNotNull('created_at')
            ->get();
        
        $avgResolutionDays = $this->calculateAverageResolutionTime($resolvedReportsWithTime);

        $satisfactionRate = $totalReports > 0 
            ? round(($resolvedReports / $totalReports) * 100, 0)
            : 0;

        return response()->json([
            'summary' => [
                'total_reports' => $totalReports,
                'resolved' => $resolvedReports,
                'pending' => $pendingReports,
                'processing' => $processingReports,
                'rejected' => $rejectedReports,
                'avg_resolution_time' => $avgResolutionDays,
                'satisfaction_rate' => $satisfactionRate
            ],
            'by_category' => $categoryStats,
            'by_priority' => $priorityStats,
            'by_status' => $statusStats,
            'by_municipality' => $municipalityStats,
            'generated_at' => now()->toDateTimeString()
        ]);
    }
}
