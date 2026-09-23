<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\Municipality;
use Illuminate\Database\Seeder;

class UpdateReportsMunicipalitiesSeeder extends Seeder
{
    

    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    
    private function findNearestMunicipality($lat, $lng)
    {
        $municipalities = Municipality::all();
        $nearest = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($municipalities as $municipality) {
            $distance = $this->calculateDistance(
                $lat,
                $lng,
                $municipality->lat,
                $municipality->lng
            );

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $nearest = $municipality;
            }
        }

        return $nearest;
    }

    public function run()
    {
        $reports = Report::all();
        $updated = 0;
        $skipped = 0;

        foreach ($reports as $report) {
            if (!$report->location_lat || !$report->location_lng) {
                $skipped++;
                continue;
            }

            $nearestMunicipality = $this->findNearestMunicipality(
                $report->location_lat,
                $report->location_lng
            );

            if ($nearestMunicipality) {
                $oldMunicipalityId = $report->municipality_id;
                $report->municipality_id = $nearestMunicipality->id;
                $report->save();

                if ($oldMunicipalityId != $nearestMunicipality->id) {
                    $updated++;
                    $this->command->info(sprintf(
                        "✓ تم تحديث البلاغ #%d: %s → %s (%s)",
                        $report->id,
                        $oldMunicipalityId ? Municipality::find($oldMunicipalityId)?->name : 'غير محدد',
                        $nearestMunicipality->name,
                        $nearestMunicipality->governorate
                    ));
                }
            } else {
                $skipped++;
                $this->command->warn("⚠ لم يتم العثور على بلدية قريبة للبلاغ #{$report->id}");
            }
        }

        $this->command->info("✅ تم تحديث {$updated} بلاغ بنجاح!");
        if ($skipped > 0) {
            $this->command->info("⚠ تم تخطي {$skipped} بلاغ (لا توجد إحداثيات أو بلدية قريبة)");
        }
    }
}
