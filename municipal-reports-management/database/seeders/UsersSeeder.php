<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Municipality;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run()
    {
        // إنشاء حساب الأدمن
        User::updateOrCreate(
            ['phone' => '0912345678'],
            [
                'name' => 'الأدمن العام للنظام',
                'email' => 'admin@syria.gov',
                'national_id' => '00000000000',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true
            ]
        );

        // موظفين بلديات لكل المحافظات الـ14 - مرتبطين بأول بلدية رئيسية في كل محافظة
        $staffByGovernorate = [
            // 1. دمشق
            [
                'name' => 'م. سامر العلي',
                'phone' => '0911111111',
                'muni_name' => 'بلدية دمشق المركزية',
                'email' => 'samer.ali@gov.sy',
                'nid' => '11111111111'
            ],
            // 2. ريف دمشق
            [
                'name' => 'أ. ليلى حسن',
                'phone' => '0922222222',
                'muni_name' => 'بلدية دوما',
                'email' => 'layla.h@gov.sy',
                'nid' => '22222222222'
            ],
            // 3. حلب
            [
                'name' => 'م. أحمد الحسين',
                'phone' => '0933333333',
                'muni_name' => 'مجلس مدينة حلب',
                'email' => 'ahmad.h@gov.sy',
                'nid' => '33333333333'
            ],
            // 4. حمص
            [
                'name' => 'م. فاطمة الكردي',
                'phone' => '0944444444',
                'muni_name' => 'بلدية حمص',
                'email' => 'fatima.k@gov.sy',
                'nid' => '44444444444'
            ],
            // 5. حماة
            [
                'name' => 'أ. يوسف الناصر',
                'phone' => '0955555555',
                'muni_name' => 'بلدية حماة',
                'email' => 'youssef.n@gov.sy',
                'nid' => '55555555555'
            ],
            // 6. اللاذقية
            [
                'name' => 'م. نورا الدرويش',
                'phone' => '0966666666',
                'muni_name' => 'بلدية اللاذقية',
                'email' => 'nora.d@gov.sy',
                'nid' => '66666666666'
            ],
            // 7. طرطوس
            [
                'name' => 'م. خالد المالكي',
                'phone' => '0970000001',
                'muni_name' => 'بلدية طرطوس',
                'email' => 'khalid.m@gov.sy',
                'nid' => '70000000001'
            ],
            // 8. إدلب
            [
                'name' => 'أ. ريم العبدالله',
                'phone' => '0970000002',
                'muni_name' => 'بلدية إدلب',
                'email' => 'reem.a@gov.sy',
                'nid' => '70000000002'
            ],
            // 9. دير الزور
            [
                'name' => 'م. وائل الشامي',
                'phone' => '0970000003',
                'muni_name' => 'بلدية دير الزور',
                'email' => 'wael.s@gov.sy',
                'nid' => '70000000003'
            ],
            // 10. الحسكة
            [
                'name' => 'أ. سمر الحكيم',
                'phone' => '0970000004',
                'muni_name' => 'بلدية الحسكة',
                'email' => 'samar.h@gov.sy',
                'nid' => '70000000004'
            ],
            // 11. الرقة
            [
                'name' => 'م. باسل العمر',
                'phone' => '0970000005',
                'muni_name' => 'بلدية الرقة',
                'email' => 'basel.a@gov.sy',
                'nid' => '70000000005'
            ],
            // 12. السويداء
            [
                'name' => 'أ. لينا الصالح',
                'phone' => '0970000006',
                'muni_name' => 'بلدية السويداء',
                'email' => 'lina.s@gov.sy',
                'nid' => '70000000006'
            ],
            // 13. درعا
            [
                'name' => 'م. عماد الدروبي',
                'phone' => '0970000007',
                'muni_name' => 'بلدية درعا',
                'email' => 'emad.d@gov.sy',
                'nid' => '70000000007'
            ],
            // 14. القنيطرة
            [
                'name' => 'أ. هبة القادري',
                'phone' => '0970000008',
                'muni_name' => 'بلدية القنيطرة',
                'email' => 'heba.q@gov.sy',
                'nid' => '70000000008'
            ],
        ];

        $created = 0;
        $failed = 0;

        foreach ($staffByGovernorate as $s) {
            $municipality = Municipality::where('name', $s['muni_name'])->first();
            
            if ($municipality) {
                User::updateOrCreate(
                    ['phone' => $s['phone']],
                    [
                        'name' => $s['name'],
                        'email' => $s['email'],
                        'national_id' => $s['nid'],
                        'password' => Hash::make('password'),
                        'role' => 'municipality',
                        'municipality_id' => $municipality->id,
                        'is_active' => true
                    ]
                );
                $created++;
            } else {
                $this->command->error("❌ لم يتم العثور على البلدية: '{$s['muni_name']}' للموظف: {$s['name']}");
                $failed++;
            }
        }

        if ($created > 0) {
            $this->command->info("✅ تم إنشاء/تحديث {$created} موظف بلدية بنجاح!");
        }
        if ($failed > 0) {
            $this->command->warn("⚠️  فشل في إنشاء {$failed} موظف بسبب عدم وجود البلدية!");
        }

        // إنشاء حسابات المواطنين - 14 مواطن (واحد لكل محافظة)
        $citizens = [
            // 1. دمشق
            [
                'name' => 'محمد العلي',
                'phone' => '0999999999',
                'email' => 'mohammed.alali@example.com',
                'gov' => 'دمشق',
                'nid' => '77777777777'
            ],
            // 2. ريف دمشق
            [
                'name' => 'سارة حسن',
                'phone' => '0988888888',
                'email' => 'sara.hassan@example.com',
                'gov' => 'ريف دمشق',
                'nid' => '88888888888'
            ],
            // 3. حلب
            [
                'name' => 'خالد المحمد',
                'phone' => '0977777777',
                'email' => 'khalid.almohammed@example.com',
                'gov' => 'حلب',
                'nid' => '99999999999'
            ],
            // 4. حمص
            [
                'name' => 'آمنة الخليل',
                'phone' => '0965555555',
                'email' => 'amena.khalil@example.com',
                'gov' => 'حمص',
                'nid' => '10101010101'
            ],
            // 5. حماة
            [
                'name' => 'علي المحمود',
                'phone' => '0954444444',
                'email' => 'ali.mahmoud@example.com',
                'gov' => 'حماة',
                'nid' => '12121212121'
            ],
            // 6. اللاذقية
            [
                'name' => 'لينا الأسعد',
                'phone' => '0943333333',
                'email' => 'lina.asaad@example.com',
                'gov' => 'اللاذقية',
                'nid' => '13131313131'
            ],
            // 7. طرطوس
            [
                'name' => 'فادي السعد',
                'phone' => '0932222222',
                'email' => 'fadi.saad@example.com',
                'gov' => 'طرطوس',
                'nid' => '14141414141'
            ],
            // 8. إدلب
            [
                'name' => 'ريم العبدالله',
                'phone' => '0921111111',
                'email' => 'reem.abdullah@example.com',
                'gov' => 'إدلب',
                'nid' => '15151515151'
            ],
            // 9. دير الزور
            [
                'name' => 'وائل الشامي',
                'phone' => '0910000000',
                'email' => 'wael.shami@example.com',
                'gov' => 'دير الزور',
                'nid' => '16161616161'
            ],
            // 10. الحسكة
            [
                'name' => 'سمر الحكيم',
                'phone' => '0909999999',
                'email' => 'samar.hakim@example.com',
                'gov' => 'الحسكة',
                'nid' => '17171717171'
            ],
            // 11. الرقة
            [
                'name' => 'باسل العمر',
                'phone' => '0908888888',
                'email' => 'basel.omar@example.com',
                'gov' => 'الرقة',
                'nid' => '18181818181'
            ],
            // 12. السويداء
            [
                'name' => 'نورا الصالح',
                'phone' => '0907777777',
                'email' => 'nora.saleh@example.com',
                'gov' => 'السويداء',
                'nid' => '19191919191'
            ],
            // 13. درعا
            [
                'name' => 'عماد الدروبي',
                'phone' => '0906666666',
                'email' => 'emad.darwbi@example.com',
                'gov' => 'درعا',
                'nid' => '20202020202'
            ],
            // 14. القنيطرة
            [
                'name' => 'هبة القادري',
                'phone' => '0905555555',
                'email' => 'heba.qadri@example.com',
                'gov' => 'القنيطرة',
                'nid' => '21212121212'
            ],
        ];

        foreach ($citizens as $c) {
            User::updateOrCreate(
                ['phone' => $c['phone']],
                [
                    'name' => $c['name'],
                    'email' => $c['email'],
                    'national_id' => $c['nid'],
                    'password' => Hash::make('password'),
                    'role' => 'citizen',
                    'governorate' => $c['gov'],
                    'is_active' => true
                ]
            );
        }

        $this->command->info('✅ تم إنشاء حسابات المواطنين بنجاح!');
        $this->command->info('✅ تم إنشاء جميع الحسابات بنجاح!');
    }
}
