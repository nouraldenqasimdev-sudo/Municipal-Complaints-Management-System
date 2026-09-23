<?php

namespace App\Console\Commands;

use App\Models\Report;
use App\Models\Municipality;
use Illuminate\Console\Command;

class UpdateReportsMunicipalities extends Command
{
    

    protected $signature = 'reports:update-municipalities';

    
    protected $description = 'Update all reports to use the nearest municipality based on their location coordinates';

    
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

    
    public function handle()
    {
        $this->info('🔄 بدء تحديث الشكاوى...');
        
        $reports = Report::all();
        $updated = 0;
        $skipped = 0;
        $bar = $this->output->createProgressBar($reports->count());
        $bar->start();

        foreach ($reports as $report) {
            if (!$report->location_lat || !$report->location_lng) {
                $skipped++;
                $bar->advance();
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
                }
            } else {
                $skipped++;
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        
        $this->info("✅ تم تحديث {$updated} بلاغ بنجاح!");
        if ($skipped > 0) {
            $this->warn("⚠ تم تخطي {$skipped} بلاغ (لا توجد إحداثيات أو بلدية قريبة)");
        }
        
        return Command::SUCCESS;
    }
}
