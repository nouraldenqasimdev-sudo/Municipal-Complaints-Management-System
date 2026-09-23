<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <title>إيصال مراجعة البلاغ</title>
    <style>
        @font-face {
            font-family: 'Cairo';
            font-style: normal;
            font-weight: normal;
            src: url('{{ public_path('fonts/Cairo-Regular.ttf') }}') format('truetype');
        }

        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            text-align: right;
            font-size: 12px;
        }

        h1 {
            text-align: center;
            color:
            margin-bottom: 20px;
        }

        .section {
            margin-bottom: 18px;
        }

        .label {
            font-weight: bold;
            color:
        }

        .value {
            color:
        }

        hr {
            border: 0;
            border-top: 1px solid
            margin: 16px 0;
        }

        .footer {
            text-align: center;
            font-size: 10px;
            color:
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <h1>إيصال مراجعة البلاغ</h1>

    <div class="section">
        <span class="label">رقم البلاغ:</span>
        <span class="value">#{{ $report->id }}</span>
    </div>

    <hr>

    <div class="section">
        <div><span class="label">عنوان البلاغ:</span> <span class="value">{{ $report->title }}</span></div>
        <div><span class="label">الحالة:</span> <span class="value">{{ $statusText }}</span></div>
        <div><span class="label">تاريخ التقديم:</span> <span class="value">{{ $report->created_at->format('Y/m/d') }}</span></div>
        <div><span class="label">البلدية المعنية:</span> <span class="value">{{ $report->municipality->name ?? 'غير محدد' }}</span></div>
        <div><span class="label">العنوان:</span> <span class="value">{{ $report->address ?? 'لم يتم تحديد العنوان' }}</span></div>
    </div>

    <hr>

    <div class="section">
        <div><span class="label">رقم التتبع:</span> <span class="value">#{{ $report->id }}</span></div>
        <div class="value" style="font-size: 11px; margin-top: 4px;">
            يمكنك استخدام هذا الرقم لمتابعة حالة البلاغ في أي وقت.
        </div>
    </div>

    <hr>

    <div class="footer">
        تاريخ الإصدار: {{ now()->format('Y/m/d') }}
    </div>
</body>
</html>

