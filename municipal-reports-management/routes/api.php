<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MunicipalityController;
use App\Http\Controllers\GisController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;
use Barryvdh\DomPDF\Facade\Pdf;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/municipalities', [MunicipalityController::class, 'index']);
Route::get('/stats/reports-category', [StatsController::class, 'getReportsByCategory']);
Route::get('/stats/citizens-count', [StatsController::class, 'getCitizensCount']);

Route::get('/stats/public/admin', [StatsController::class, 'getAdminStats']);
Route::get('/public/reports/resolved-latest', [ReportController::class, 'getPublicResolvedLatest']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [UserController::class, 'getCurrentUser']);

    Route::apiResource('reports', ReportController::class);
    Route::get('/reports/{report}/receipt', [ReportController::class, 'downloadReceipt']);
    Route::get('/reports/user/current', [ReportController::class, 'getUserReports']);

    Route::get('/municipalities/{municipality}', [MunicipalityController::class, 'show']);

    Route::get('/gis/reports-radius', [GisController::class, 'getReportsInRadius']);
    Route::get('/gis/nearest-municipality', [GisController::class, 'getNearestMunicipality']);

    Route::get('/stats/citizen', [StatsController::class, 'getCitizenStats']);
    Route::get('/stats/staff', [StatsController::class, 'getStaffStats']);
    Route::get('/stats/admin', [StatsController::class, 'getAdminStats']);
    Route::get('/stats/map', [StatsController::class, 'getReportsForMap']);
    
    Route::middleware('role:admin')->group(function () {
        Route::get('/stats/admin/detailed', [StatsController::class, 'getAdminDetailedReport']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('/audit-logs/{auditLog}/restore-user', [UserController::class, 'restore']);
        
        Route::post('/municipalities', [MunicipalityController::class, 'store']);
        Route::put('/municipalities/{municipality}', [MunicipalityController::class, 'update']);
        Route::delete('/municipalities/{municipality}', [MunicipalityController::class, 'destroy']);
        
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/stats', [AuditLogController::class, 'getStats']);
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show']);
    });

    Route::middleware('role:municipality,admin')->group(function () {
    });
});