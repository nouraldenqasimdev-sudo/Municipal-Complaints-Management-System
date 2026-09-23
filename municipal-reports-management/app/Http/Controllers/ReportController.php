<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
         
        $user = Auth::user();

        $query = Report::with(['user', 'municipality', 'assignedUser']);

        if ($user->hasRole('citizen')) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('municipality')) {
            $query->where(function($q) use ($user) {
                $q->where('municipality_id', $user->municipality_id)
                  ->where(function($subQ) use ($user) {
                      $subQ->where('assigned_to', $user->id)
                           ->orWhereNull('assigned_to')
                           ->orWhereHas('assignedUser', function($assignedQuery) use ($user) {
                               $assignedQuery->where('municipality_id', $user->municipality_id);
                           });
                  });
            });
        }

        if ($user->hasRole('admin')) {
            if ($request->has('municipality_id')) {
                $query->where('municipality_id', $request->municipality_id);
            }
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }
            if ($request->has('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }
        }

        if ($user->hasRole('municipality')) {
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('assigned_to_me')) {
                $query->where('assigned_to', $user->id);
            }
        }

        $reports = $query->latest()->get();
        
        return $reports->map(function($report) {
            return [
                'id' => $report->id,
                'title' => $report->title,
                'description' => $report->description,
                'category' => $report->category,
                'priority' => $report->priority,
                'status' => $report->status,
                'location_lat' => $report->location_lat,
                'location_lng' => $report->location_lng,
                'address' => $report->address,
                'is_anonymous' => $report->is_anonymous,
                'official_comment' => $report->official_comment,
                'images' => $report->images ?? [],
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
                'user' => $report->user ? [
                    'id' => $report->user->id,
                    'name' => $report->is_anonymous ? 'مجهول' : $report->user->name,
                    'email' => $report->is_anonymous ? null : $report->user->email,
                ] : null,
                'municipality' => $report->municipality ? [
                    'id' => $report->municipality->id,
                    'name' => $report->municipality->name,
                ] : null,
                'assigned_to' => $report->assigned_to,
                'assignedUser' => $report->assignedUser ? [
                    'id' => $report->assignedUser->id,
                    'name' => $report->assignedUser->name,
                ] : null,
            ];
        });
    }

    public function store(Request $request)
    {
        \Log::info('=== New Complaint Submission ===', [
            'user_id' => Auth::id(),
            'user_email' => Auth::user()?->email,
            'user_name' => Auth::user()?->name,
            'request_data' => [
                'title' => $request->title,
                'description' => substr($request->description, 0, 100) . '...',
                'category' => $request->category,
                'priority' => $request->priority,
                'location_lat' => $request->location_lat,
                'location_lng' => $request->location_lng,
                'address' => $request->address,
                'municipality_id' => $request->municipality_id,
                'is_anonymous' => $request->is_anonymous,
                'images_count' => is_array($request->images) ? count($request->images) : 0,
            ]
        ]);

        \Log::info('Request data before validation:', [
            'has_location_lat' => $request->has('location_lat'),
            'location_lat_value' => $request->input('location_lat'),
            'location_lat_type' => gettype($request->input('location_lat')),
            'has_location_lng' => $request->has('location_lng'),
            'location_lng_value' => $request->input('location_lng'),
            'location_lng_type' => gettype($request->input('location_lng')),
            'all_inputs' => $request->all()
        ]);

        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'category' => 'required|string',
                'priority' => 'sometimes|in:low,medium,high,urgent',
                'location_lat' => 'required|numeric',
                'location_lng' => 'required|numeric',
                'address' => 'nullable|string',
                'municipality_id' => 'required|integer|exists:municipalities,id',
                'is_anonymous' => 'sometimes|boolean',
                'images' => 'sometimes|array'
            ], [
                'title.required' => 'عنوان البلاغ مطلوب',
                'description.required' => 'وصف البلاغ مطلوب',
                'category.required' => 'فئة البلاغ مطلوبة',
                'location_lat.required' => 'حقل خط العرض مطلوب',
                'location_lat.numeric' => 'خط العرض يجب أن يكون رقماً',
                'location_lng.required' => 'حقل خط الطول مطلوب',
                'location_lng.numeric' => 'خط الطول يجب أن يكون رقماً',
                'municipality_id.required' => 'يرجى اختيار البلدية',
                'municipality_id.integer' => 'معرف البلدية يجب أن يكون رقماً',
                'municipality_id.exists' => 'البلدية المختارة غير موجودة',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'يرجى التحقق من البيانات المدخلة',
                'errors' => $e->errors()
            ], 422);
        }

        if (!$request->has('location_lat') || !$request->has('location_lng')) {
            return response()->json([
                'message' => 'الإحداثيات مطلوبة',
                'errors' => ['location' => 'يرجى تحديد الموقع على الخريطة']
            ], 422);
        }

        $lat = floatval($request->location_lat);
        $lng = floatval($request->location_lng);
        
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return response()->json([
                'message' => 'إحداثيات غير صحيحة',
                'errors' => ['location' => 'يرجى تحديد موقع صحيح']
            ], 422);
        }

        $images = $request->images ?? [];
        if (is_array($images)) {
            $validImages = [];
            foreach ($images as $image) {
                if (is_string($image)) {
                    $isValidImage = 
                        (strpos($image, 'data:image/') === 0) ||
                        (strpos($image, '/9j/') === 0) ||
                        (strpos($image, 'iVBORw0KGgo') === 0) ||
                        (strpos($image, 'R0lGODlh') === 0) ||
                        (base64_decode($image, true) !== false);
                    
                    if ($isValidImage && strlen($image) < 10 * 1024 * 1024) {
                        $validImages[] = $image;
                    }
                }
            }
            $images = $validImages;
        }

        try {
            $user = Auth::user();
            
            if (!$user) {
                \Log::error('User not authenticated when creating report');
                return response()->json([
                    'message' => 'غير مصرح لك',
                    'error' => 'User not authenticated'
                ], 401);
            }
            
            \Log::info('Creating report with validated data:', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'location' => "{$lat}, {$lng}",
                'municipality_id' => $request->municipality_id,
                'municipality_id_type' => gettype($request->municipality_id),
                'images_count' => count($images),
                'is_anonymous' => $request->is_anonymous ?? false
            ]);

            $municipalityId = (int)$request->municipality_id;
            if ($municipalityId <= 0) {
                \Log::error('Invalid municipality_id:', ['municipality_id' => $request->municipality_id]);
                return response()->json([
                    'message' => 'البلدية المختارة غير صحيحة',
                    'errors' => ['municipality_id' => ['يرجى اختيار بلدية صحيحة']]
                ], 422);
            }

            $report = Report::create([
                'user_id' => $user->id,
                'title' => trim($request->title),
                'description' => trim($request->description),
                'category' => $request->category,
                'priority' => $request->priority ?? 'medium',
                'location_lat' => $lat,
                'location_lng' => $lng,
                'address' => $request->address ? trim($request->address) : null,
                'municipality_id' => $municipalityId,
                'is_anonymous' => (bool)($request->is_anonymous ?? false),
                'images' => !empty($images) ? $images : null,
                'status' => 'pending'
            ]);

            \Log::info('Report created successfully:', [
                'report_id' => $report->id,
                'report_title' => $report->title,
                'status' => $report->status
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'إنشاء بلاغ جديد',
                'target' => "#{$report->id}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            $report->load(['municipality', 'user']);
            
            $responseData = [
                'id' => $report->id,
                'title' => $report->title,
                'description' => $report->description,
                'status' => $report->status,
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
                'location_lat' => $report->location_lat,
                'location_lng' => $report->location_lng,
                'address' => $report->address,
                'category' => $report->category,
                'priority' => $report->priority,
                'is_anonymous' => $report->is_anonymous,
                'municipality' => $report->municipality ? [
                    'id' => $report->municipality->id,
                    'name' => $report->municipality->name
                ] : null,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_anonymous' => $request->is_anonymous ?? false
                ],
                'images_count' => $images ? count($images) : 0,
                'images' => $report->images
            ];

            \Log::info('Sending response to client:', [
                'report_id' => $report->id,
                'response_data' => $responseData
            ]);

            return response()->json($responseData, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error creating report:', [
                'user_id' => Auth::id(),
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'يرجى التحقق من البيانات المدخلة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating report:', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'فشل في إنشاء البلاغ',
                'error' => config('app.debug') ? $e->getMessage() : 'حدث خطأ غير متوقع'
            ], 500);
        }
    }

    public function downloadReceipt(Report $report)
    {
        $user = Auth::user();

        if (!$user || (!$user->hasRole('admin') && !$user->hasRole('municipality') && $report->user_id !== $user->id)) {
            return response()->json(['message' => 'غير مصرح لك بالوصول إلى هذا الإيصال'], 403);
        }

        $statusMap = [
            'pending' => 'قيد الانتظار',
            'processing' => 'قيد المعالجة',
            'resolved' => 'تم الحل',
            'on-hold' => 'مؤجل',
            'rejected' => 'مرفوض',
        ];

        $statusText = $statusMap[$report->status] ?? $report->status;

        $pdf = Pdf::loadView('reports.receipt', [
            'report' => $report->load('municipality'),
            'statusText' => $statusText,
        ])->setPaper('A4', 'portrait');

        $fileName = 'إيصال_البلاغ_' . $report->id . '_' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($fileName);
    }

    public function getPublicResolvedLatest()
    {
        $reports = Report::with('municipality')
            ->where('status', 'resolved')
            ->orderByDesc('updated_at')
            ->limit(6)
            ->get();

        return $reports->map(function ($report) {
            return [
                'id' => $report->id,
                'title' => $report->title,
                'category' => $report->category,
                'municipality' => $report->municipality?->name,
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
            ];
        });
    }

    public function show(Report $report)
    {
         
        $user = Auth::user();

        if (!$user->hasRole('admin')) {
            if ($user->hasRole('citizen') && $report->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($user->hasRole('municipality') && $report->municipality_id !== $user->municipality_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $report->load(['user', 'municipality', 'assignedUser']);
        
        return [
            'id' => $report->id,
            'title' => $report->title,
            'description' => $report->description,
            'category' => $report->category,
            'priority' => $report->priority,
            'status' => $report->status,
            'location_lat' => $report->location_lat,
            'location_lng' => $report->location_lng,
            'address' => $report->address,
            'is_anonymous' => $report->is_anonymous,
            'official_comment' => $report->official_comment,
            'images' => $report->images ?? [],
            'created_at' => $report->created_at,
            'updated_at' => $report->updated_at,
            'user' => $report->user ? [
                'id' => $report->user->id,
                'name' => $report->is_anonymous ? 'مجهول' : $report->user->name,
                'email' => $report->is_anonymous ? null : $report->user->email,
                'phone' => $report->is_anonymous ? null : $report->user->phone,
            ] : null,
            'municipality' => $report->municipality ? [
                'id' => $report->municipality->id,
                'name' => $report->municipality->name,
                'address' => $report->municipality->address,
                'phone' => $report->municipality->phone,
                'email' => $report->municipality->email,
            ] : null,
            'assigned_to' => $report->assigned_to,
            'assignedUser' => $report->assignedUser ? [
                'id' => $report->assignedUser->id,
                'name' => $report->assignedUser->name,
            ] : null,
        ];
    }

    public function update(Request $request, Report $report)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                \Log::error('User not authenticated when updating report', [
                    'report_id' => $report->id
                ]);
                return response()->json([
                    'message' => 'غير مصرح لك',
                    'error' => 'User not authenticated'
                ], 401);
            }

            $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'status' => 'sometimes|in:pending,processing,on-hold,resolved,rejected',
                'official_comment' => 'sometimes|string|nullable',
                'priority' => 'sometimes|in:low,medium,high,urgent',
                'assigned_to' => 'sometimes|exists:users,id|nullable',
                'category' => 'sometimes|string',
                'address' => 'sometimes|string|nullable',
                'location_lat' => 'sometimes|numeric',
                'location_lng' => 'sometimes|numeric',
                'images' => 'sometimes|array',
                'images.*' => 'string',
            ]);

            if (!$report->canBeUpdatedBy($user)) {
                \Log::warning('User not authorized to update report', [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'report_id' => $report->id,
                    'report_municipality_id' => $report->municipality_id,
                    'user_municipality_id' => $user->municipality_id
                ]);
                return response()->json([
                    'message' => 'غير مصرح لك بتحديث هذه الشكوى'
                ], 403);
            }

            if ($user->hasRole('municipality') && $request->has('assigned_to') && $request->assigned_to != $user->id) {
                return response()->json([
                    'message' => 'يمكنك فقط إسناد الشكاوى لنفسك'
                ], 403);
            }

            $allowedFields = [];
            
            // الحقول المسموحة لجميع الأدوار
            if ($request->has('status')) {
                $allowedFields['status'] = $request->status;
            }
            if ($request->has('official_comment')) {
                $allowedFields['official_comment'] = $request->official_comment ? trim($request->official_comment) : null;
            }
            if ($request->has('priority')) {
                $allowedFields['priority'] = $request->priority;
            }
            
            // السماح للمواطن بتعديل البلاغ إذا كان في حالة pending
            if ($user->hasRole('citizen') && $report->status === 'pending' && $report->user_id === $user->id) {
                if ($request->has('title')) {
                    $allowedFields['title'] = trim($request->title);
                }
                if ($request->has('description')) {
                    $allowedFields['description'] = trim($request->description);
                }
                if ($request->has('category')) {
                    $allowedFields['category'] = $request->category;
                }
                if ($request->has('address')) {
                    $allowedFields['address'] = trim($request->address);
                }
                if ($request->has('location_lat') && $request->has('location_lng')) {
                    $allowedFields['location_lat'] = (float)$request->location_lat;
                    $allowedFields['location_lng'] = (float)$request->location_lng;
                }
                if ($request->has('images')) {
                    $allowedFields['images'] = $request->images;
                }
            }
            
            // الحقول المسموحة للأدمن فقط
            if ($user->hasRole('admin')) {
                if ($request->has('title')) {
                    $allowedFields['title'] = $request->title;
                }
                if ($request->has('description')) {
                    $allowedFields['description'] = $request->description;
                }
                if ($request->has('assigned_to')) {
                    $allowedFields['assigned_to'] = $request->assigned_to ? (int)$request->assigned_to : null;
                }
                if ($request->has('category')) {
                    $allowedFields['category'] = $request->category;
                }
            }

            if (empty($allowedFields)) {
                return response()->json([
                    'message' => 'لا توجد بيانات للتحديث'
                ], 422);
            }

            if (isset($allowedFields['status']) && $allowedFields['status'] !== $report->status) {
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'تغيير حالة الشكوى',
                    'target' => "#{$report->id}",
                    'details' => json_encode([
                        'old_status' => $report->status,
                        'new_status' => $allowedFields['status']
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }

            if (isset($allowedFields['assigned_to']) && $allowedFields['assigned_to'] != $report->assigned_to) {
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'إسناد الشكوى',
                    'target' => "#{$report->id}",
                    'details' => json_encode([
                        'old_assigned_to' => $report->assigned_to,
                        'new_assigned_to' => $allowedFields['assigned_to']
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }

            $report->update($allowedFields);

            \Log::info('Report updated successfully', [
                'report_id' => $report->id,
                'user_id' => $user->id,
                'updated_fields' => array_keys($allowedFields)
            ]);

            $report->load(['user', 'municipality', 'assignedUser']);
            
            return response()->json([
                'id' => $report->id,
                'title' => $report->title,
                'description' => $report->description,
                'category' => $report->category,
                'priority' => $report->priority,
                'status' => $report->status,
                'location_lat' => $report->location_lat,
                'location_lng' => $report->location_lng,
                'address' => $report->address,
                'is_anonymous' => $report->is_anonymous,
                'official_comment' => $report->official_comment,
                'images' => $report->images ?? [],
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
                'user' => $report->user ? [
                    'id' => $report->user->id,
                    'name' => $report->is_anonymous ? 'مجهول' : $report->user->name,
                    'email' => $report->is_anonymous ? null : $report->user->email,
                ] : null,
                'municipality' => $report->municipality ? [
                    'id' => $report->municipality->id,
                    'name' => $report->municipality->name,
                ] : null,
                'assigned_to' => $report->assigned_to,
                'assignedUser' => $report->assignedUser ? [
                    'id' => $report->assignedUser->id,
                    'name' => $report->assignedUser->name,
                ] : null,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error updating report:', [
                'user_id' => Auth::id(),
                'report_id' => $report->id,
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'يرجى التحقق من البيانات المدخلة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating report:', [
                'user_id' => Auth::id(),
                'report_id' => $report->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'فشل في تحديث الشكوى',
                'error' => config('app.debug') ? $e->getMessage() : 'حدث خطأ غير متوقع'
            ], 500);
        }
    }

    public function destroy(Report $report)
    {
         
        $user = Auth::user();

        if (!$report->canBeDeletedBy($user)) {
            if ($user->hasRole('citizen') && $report->user_id === $user->id) {
                if (in_array($report->status, ['processing', 'on-hold', 'resolved'])) {
                    return response()->json([
                        'message' => 'لا يمكن حذف الشكوى أثناء المعالجة. يرجى التواصل مع الدعم الفني',
                        'status_code' => 'CANNOT_DELETE_PROCESSING'
                    ], 403);
                }
            }
            return response()->json([
                'message' => 'غير مصرح لك بحذف هذه الشكوى'
            ], 403);
        }

        if ($user->hasRole('admin')) {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'حذف البلاغ',
                'target' => "#{$report->id}",
                'details' => json_encode([
                    'title' => $report->title,
                    'status' => $report->status,
                    'category' => $report->category,
                    'deleted_by' => 'admin'
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);
        } else {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'مواطن حذف شكواه',
                'target' => "#{$report->id}",
                'details' => json_encode([
                    'title' => $report->title,
                    'status' => $report->status,
                    'category' => $report->category
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);
        }

        $report->delete();

        return response()->json([
            'message' => 'تم حذف الشكوى بنجاح'
        ], 204);
    }

    public function getUserReports()
    {
        $reports = Auth::user()->reports()->with('municipality')->get();
        
        return $reports->map(function($report) {
            return [
                'id' => $report->id,
                'title' => $report->title,
                'description' => $report->description,
                'category' => $report->category,
                'priority' => $report->priority,
                'status' => $report->status,
                'location_lat' => $report->location_lat,
                'location_lng' => $report->location_lng,
                'address' => $report->address,
                'is_anonymous' => $report->is_anonymous,
                'official_comment' => $report->official_comment,
                'images' => $report->images ?? [],
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
                'municipality' => $report->municipality ? [
                    'id' => $report->municipality->id,
                    'name' => $report->municipality->name,
                ] : null,
            ];
        });
    }
}
