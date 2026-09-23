<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Municipality;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GisController extends Controller
{
    public function getReportsInRadius(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'required|numeric|min:0'
        ]);

        $reports = Report::select('*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(location_lat)) * cos(radians(location_lng) - radians(?)) + sin(radians(?)) * sin(radians(location_lat)))) AS distance',
                [$request->lat, $request->lng, $request->lat]
            )
            ->havingRaw('distance < ?', [$request->radius])
            ->orderBy('distance')
            ->with(['user', 'municipality'])
            ->get();

        return response()->json($reports);
    }

    public function getNearestMunicipality(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric'
        ]);

        $nearest = Municipality::select('*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) AS distance',
                [$request->lat, $request->lng, $request->lat]
            )
            ->orderBy('distance')
            ->first();

        return response()->json($nearest);
    }
}
