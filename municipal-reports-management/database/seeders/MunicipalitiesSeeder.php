<?php

namespace Database\Seeders;

use App\Models\Municipality;
use Illuminate\Database\Seeder;

class MunicipalitiesSeeder extends Seeder
{
    public function run()
    {
        $municipalities = [
            ['name' => 'بلدية دمشق المركزية', 'governorate' => 'دمشق', 'lat' => 33.5138, 'lng' => 36.2765, 'address' => 'دمشق - ساحة يوسف العظمة', 'phone' => '0112211000', 'email' => 'damascus@gov.sy'],
            ['name' => 'بلدية المزة', 'governorate' => 'دمشق', 'lat' => 33.4800, 'lng' => 36.2800, 'address' => 'دمشق - المزة', 'phone' => '0112211001', 'email' => 'mazza@gov.sy'],
            ['name' => 'بلدية كفرسوسة', 'governorate' => 'دمشق', 'lat' => 33.5000, 'lng' => 36.2900, 'address' => 'دمشق - كفرسوسة', 'phone' => '0112211002', 'email' => 'kafrsouseh@gov.sy'],
            ['name' => 'بلدية ركن الدين', 'governorate' => 'دمشق', 'lat' => 33.5200, 'lng' => 36.3000, 'address' => 'دمشق - ركن الدين', 'phone' => '0112211003', 'email' => 'roukneddine@gov.sy'],
            ['name' => 'بلدية الشاغور', 'governorate' => 'دمشق', 'lat' => 33.5100, 'lng' => 36.3100, 'address' => 'دمشق - الشاغور', 'phone' => '0112211004', 'email' => 'shaghour@gov.sy'],
            
            ['name' => 'بلدية دوما', 'governorate' => 'ريف دمشق', 'lat' => 33.5722, 'lng' => 36.4028, 'address' => 'ريف دمشق - دوما', 'phone' => '0112233000', 'email' => 'douma@gov.sy'],
            ['name' => 'بلدية داريا', 'governorate' => 'ريف دمشق', 'lat' => 33.4581, 'lng' => 36.2325, 'address' => 'ريف دمشق - داريا', 'phone' => '0112233001', 'email' => 'darya@gov.sy'],
            ['name' => 'بلدية الزبداني', 'governorate' => 'ريف دمشق', 'lat' => 33.7244, 'lng' => 36.0950, 'address' => 'ريف دمشق - الزبداني', 'phone' => '0112233002', 'email' => 'zabadani@gov.sy'],
            ['name' => 'بلدية النبك', 'governorate' => 'ريف دمشق', 'lat' => 34.0247, 'lng' => 36.7281, 'address' => 'ريف دمشق - النبك', 'phone' => '0112233003', 'email' => 'nabk@gov.sy'],
            ['name' => 'بلدية قطنا', 'governorate' => 'ريف دمشق', 'lat' => 33.4333, 'lng' => 36.0833, 'address' => 'ريف دمشق - قطنا', 'phone' => '0112233004', 'email' => 'qatana@gov.sy'],
            ['name' => 'بلدية يبرود', 'governorate' => 'ريف دمشق', 'lat' => 33.9667, 'lng' => 36.6667, 'address' => 'ريف دمشق - يبرود', 'phone' => '0112233005', 'email' => 'yabroud@gov.sy'],
            
            ['name' => 'مجلس مدينة حلب', 'governorate' => 'حلب', 'lat' => 36.2021, 'lng' => 37.1343, 'address' => 'حلب - حي العزيزية', 'phone' => '0212233000', 'email' => 'aleppo@gov.sy'],
            ['name' => 'بلدية حلب القديمة', 'governorate' => 'حلب', 'lat' => 36.1992, 'lng' => 37.1608, 'address' => 'حلب - المدينة القديمة', 'phone' => '0212233001', 'email' => 'aleppo-old@gov.sy'],
            ['name' => 'بلدية الشهباء', 'governorate' => 'حلب', 'lat' => 36.2100, 'lng' => 37.1500, 'address' => 'حلب - حي الشهباء', 'phone' => '0212233002', 'email' => 'shahba@gov.sy'],
            ['name' => 'بلدية منبج', 'governorate' => 'حلب', 'lat' => 36.5281, 'lng' => 37.9550, 'address' => 'حلب - منبج', 'phone' => '0212233003', 'email' => 'manbij@gov.sy'],
            ['name' => 'بلدية عفرين', 'governorate' => 'حلب', 'lat' => 36.5114, 'lng' => 36.8661, 'address' => 'حلب - عفرين', 'phone' => '0212233004', 'email' => 'afrin@gov.sy'],
            ['name' => 'بلدية الباب', 'governorate' => 'حلب', 'lat' => 36.3708, 'lng' => 37.5158, 'address' => 'حلب - الباب', 'phone' => '0212233005', 'email' => 'al-bab@gov.sy'],
            ['name' => 'بلدية جرابلس', 'governorate' => 'حلب', 'lat' => 36.8181, 'lng' => 38.0114, 'address' => 'حلب - جرابلس', 'phone' => '0212233006', 'email' => 'jarablus@gov.sy'],
            ['name' => 'بلدية أعزاز', 'governorate' => 'حلب', 'lat' => 36.5861, 'lng' => 37.0442, 'address' => 'حلب - أعزاز', 'phone' => '0212233007', 'email' => 'azaz@gov.sy'],
            
            ['name' => 'بلدية حمص', 'governorate' => 'حمص', 'lat' => 34.7324, 'lng' => 36.7137, 'address' => 'حمص - مركز المدينة', 'phone' => '0312244000', 'email' => 'homs@gov.sy'],
            ['name' => 'بلدية تدمر', 'governorate' => 'حمص', 'lat' => 34.5581, 'lng' => 38.2736, 'address' => 'حمص - تدمر', 'phone' => '0312244001', 'email' => 'palmyra@gov.sy'],
            ['name' => 'بلدية القصير', 'governorate' => 'حمص', 'lat' => 34.5081, 'lng' => 36.5781, 'address' => 'حمص - القصير', 'phone' => '0312244002', 'email' => 'qusayr@gov.sy'],
            ['name' => 'بلدية الرستن', 'governorate' => 'حمص', 'lat' => 34.9264, 'lng' => 36.7328, 'address' => 'حمص - الرستن', 'phone' => '0312244003', 'email' => 'rastan@gov.sy'],
            ['name' => 'بلدية المخرم', 'governorate' => 'حمص', 'lat' => 34.8167, 'lng' => 37.0500, 'address' => 'حمص - المخرم', 'phone' => '0312244004', 'email' => 'mukharram@gov.sy'],
            ['name' => 'بلدية القريتين', 'governorate' => 'حمص', 'lat' => 34.2333, 'lng' => 37.2333, 'address' => 'حمص - القريتين', 'phone' => '0312244005', 'email' => 'qaryatayn@gov.sy'],
            
            ['name' => 'بلدية حماة', 'governorate' => 'حماة', 'lat' => 35.1318, 'lng' => 36.7578, 'address' => 'حماة - حي الحاضر', 'phone' => '0332266000', 'email' => 'hama@gov.sy'],
            ['name' => 'بلدية مصياف', 'governorate' => 'حماة', 'lat' => 35.0667, 'lng' => 36.3333, 'address' => 'حماة - مصياف', 'phone' => '0332266001', 'email' => 'misyaf@gov.sy'],
            ['name' => 'بلدية السلمية', 'governorate' => 'حماة', 'lat' => 35.0114, 'lng' => 37.0531, 'address' => 'حماة - السلمية', 'phone' => '0332266002', 'email' => 'salamiyah@gov.sy'],
            ['name' => 'بلدية محردة', 'governorate' => 'حماة', 'lat' => 35.2500, 'lng' => 36.5667, 'address' => 'حماة - محردة', 'phone' => '0332266003', 'email' => 'mhardeh@gov.sy'],
            ['name' => 'بلدية سلمية', 'governorate' => 'حماة', 'lat' => 35.0114, 'lng' => 37.0531, 'address' => 'حماة - سلمية', 'phone' => '0332266004', 'email' => 'salamieh@gov.sy'],
            
            ['name' => 'بلدية اللاذقية', 'governorate' => 'اللاذقية', 'lat' => 35.5173, 'lng' => 35.7822, 'address' => 'اللاذقية - الكورنيش الغربي', 'phone' => '0412255000', 'email' => 'latakia@gov.sy'],
            ['name' => 'بلدية جبلة', 'governorate' => 'اللاذقية', 'lat' => 35.3611, 'lng' => 35.9331, 'address' => 'اللاذقية - جبلة', 'phone' => '0412255001', 'email' => 'jableh@gov.sy'],
            ['name' => 'بلدية بانياس', 'governorate' => 'اللاذقية', 'lat' => 35.1833, 'lng' => 35.9500, 'address' => 'اللاذقية - بانياس', 'phone' => '0412255002', 'email' => 'banias@gov.sy'],
            ['name' => 'بلدية الحفة', 'governorate' => 'اللاذقية', 'lat' => 35.5833, 'lng' => 36.0333, 'address' => 'اللاذقية - الحفة', 'phone' => '0412255003', 'email' => 'haffa@gov.sy'],
            ['name' => 'بلدية القرداحة', 'governorate' => 'اللاذقية', 'lat' => 35.4500, 'lng' => 36.0167, 'address' => 'اللاذقية - القرداحة', 'phone' => '0412255004', 'email' => 'qardaha@gov.sy'],
            
            ['name' => 'بلدية طرطوس', 'governorate' => 'طرطوس', 'lat' => 34.8890, 'lng' => 35.8860, 'address' => 'طرطوس - الميناء', 'phone' => '0432277000', 'email' => 'tartus@gov.sy'],
            ['name' => 'بلدية صافيتا', 'governorate' => 'طرطوس', 'lat' => 34.8167, 'lng' => 36.1167, 'address' => 'طرطوس - صافيتا', 'phone' => '0432277001', 'email' => 'safita@gov.sy'],
            ['name' => 'بلدية دريكيش', 'governorate' => 'طرطوس', 'lat' => 34.9167, 'lng' => 36.1167, 'address' => 'طرطوس - دريكيش', 'phone' => '0432277002', 'email' => 'drekish@gov.sy'],
            ['name' => 'بلدية الشيخ بدر', 'governorate' => 'طرطوس', 'lat' => 34.9833, 'lng' => 35.9167, 'address' => 'طرطوس - الشيخ بدر', 'phone' => '0432277003', 'email' => 'sheikh-bader@gov.sy'],
            
            ['name' => 'بلدية إدلب', 'governorate' => 'إدلب', 'lat' => 35.9333, 'lng' => 36.6333, 'address' => 'إدلب - مركز المدينة', 'phone' => '0232288000', 'email' => 'idlib@gov.sy'],
            ['name' => 'بلدية معرة النعمان', 'governorate' => 'إدلب', 'lat' => 35.6500, 'lng' => 36.6667, 'address' => 'إدلب - معرة النعمان', 'phone' => '0232288001', 'email' => 'maarat@gov.sy'],
            ['name' => 'بلدية جسر الشغور', 'governorate' => 'إدلب', 'lat' => 35.8167, 'lng' => 36.3167, 'address' => 'إدلب - جسر الشغور', 'phone' => '0232288002', 'email' => 'jisr-ash-shugur@gov.sy'],
            ['name' => 'بلدية أريحا', 'governorate' => 'إدلب', 'lat' => 35.8167, 'lng' => 36.6000, 'address' => 'إدلب - أريحا', 'phone' => '0232288003', 'email' => 'ariha@gov.sy'],
            ['name' => 'بلدية سرمين', 'governorate' => 'إدلب', 'lat' => 35.9000, 'lng' => 36.7167, 'address' => 'إدلب - سرمين', 'phone' => '0232288004', 'email' => 'sarmin@gov.sy'],
            
            ['name' => 'بلدية دير الزور', 'governorate' => 'دير الزور', 'lat' => 35.3333, 'lng' => 40.1500, 'address' => 'دير الزور - مركز المدينة', 'phone' => '0512299000', 'email' => 'deir-ez-zor@gov.sy'],
            ['name' => 'بلدية الميادين', 'governorate' => 'دير الزور', 'lat' => 35.0167, 'lng' => 40.4500, 'address' => 'دير الزور - الميادين', 'phone' => '0512299001', 'email' => 'mayadeen@gov.sy'],
            ['name' => 'بلدية البوكمال', 'governorate' => 'دير الزور', 'lat' => 34.4500, 'lng' => 40.9167, 'address' => 'دير الزور - البوكمال', 'phone' => '0512299002', 'email' => 'abu-kamal@gov.sy'],
            ['name' => 'بلدية القورية', 'governorate' => 'دير الزور', 'lat' => 35.1833, 'lng' => 40.2833, 'address' => 'دير الزور - القورية', 'phone' => '0512299003', 'email' => 'qouriya@gov.sy'],
            
            ['name' => 'بلدية الحسكة', 'governorate' => 'الحسكة', 'lat' => 36.5000, 'lng' => 40.7500, 'address' => 'الحسكة - مركز المدينة', 'phone' => '0522211000', 'email' => 'hasakah@gov.sy'],
            ['name' => 'بلدية القامشلي', 'governorate' => 'الحسكة', 'lat' => 37.0500, 'lng' => 41.2167, 'address' => 'الحسكة - القامشلي', 'phone' => '0522211001', 'email' => 'qamishli@gov.sy'],
            ['name' => 'بلدية رأس العين', 'governorate' => 'الحسكة', 'lat' => 36.8500, 'lng' => 40.0667, 'address' => 'الحسكة - رأس العين', 'phone' => '0522211002', 'email' => 'ras-al-ain@gov.sy'],
            ['name' => 'بلدية المالكية', 'governorate' => 'الحسكة', 'lat' => 37.1667, 'lng' => 42.1333, 'address' => 'الحسكة - المالكية', 'phone' => '0522211003', 'email' => 'malikiya@gov.sy'],
            ['name' => 'بلدية الدرباسية', 'governorate' => 'الحسكة', 'lat' => 37.0833, 'lng' => 41.2167, 'address' => 'الحسكة - الدرباسية', 'phone' => '0522211004', 'email' => 'derbasiya@gov.sy'],
            
            ['name' => 'بلدية الرقة', 'governorate' => 'الرقة', 'lat' => 35.9500, 'lng' => 39.0167, 'address' => 'الرقة - مركز المدينة', 'phone' => '0223311000', 'email' => 'raqqa@gov.sy'],
            ['name' => 'بلدية الثورة', 'governorate' => 'الرقة', 'lat' => 35.8333, 'lng' => 38.5500, 'address' => 'الرقة - الثورة', 'phone' => '0223311001', 'email' => 'thawra@gov.sy'],
            ['name' => 'بلدية تل أبيض', 'governorate' => 'الرقة', 'lat' => 36.6833, 'lng' => 38.9500, 'address' => 'الرقة - تل أبيض', 'phone' => '0223311002', 'email' => 'tell-abyad@gov.sy'],
            
            ['name' => 'بلدية السويداء', 'governorate' => 'السويداء', 'lat' => 32.7081, 'lng' => 36.5692, 'address' => 'السويداء - مركز المدينة', 'phone' => '0163322000', 'email' => 'sweida@gov.sy'],
            ['name' => 'بلدية شهبا', 'governorate' => 'السويداء', 'lat' => 32.8500, 'lng' => 36.6167, 'address' => 'السويداء - شهبا', 'phone' => '0163322001', 'email' => 'shahba@gov.sy'],
            ['name' => 'بلدية صلخد', 'governorate' => 'السويداء', 'lat' => 32.4833, 'lng' => 36.7167, 'address' => 'السويداء - صلخد', 'phone' => '0163322002', 'email' => 'salkhad@gov.sy'],
            ['name' => 'بلدية قنوات', 'governorate' => 'السويداء', 'lat' => 32.7500, 'lng' => 36.5667, 'address' => 'السويداء - قنوات', 'phone' => '0163322003', 'email' => 'qanawat@gov.sy'],
            
            ['name' => 'بلدية درعا', 'governorate' => 'درعا', 'lat' => 32.6189, 'lng' => 36.1019, 'address' => 'درعا - مركز المدينة', 'phone' => '0153344000', 'email' => 'daraa@gov.sy'],
            ['name' => 'بلدية إزرع', 'governorate' => 'درعا', 'lat' => 32.8667, 'lng' => 36.2500, 'address' => 'درعا - إزرع', 'phone' => '0153344001', 'email' => 'izra@gov.sy'],
            ['name' => 'بلدية بصرى الشام', 'governorate' => 'درعا', 'lat' => 32.5167, 'lng' => 36.4833, 'address' => 'درعا - بصرى الشام', 'phone' => '0153344002', 'email' => 'bosra@gov.sy'],
            ['name' => 'بلدية نوى', 'governorate' => 'درعا', 'lat' => 32.8833, 'lng' => 36.0333, 'address' => 'درعا - نوى', 'phone' => '0153344003', 'email' => 'nawa@gov.sy'],
            ['name' => 'بلدية الصنمين', 'governorate' => 'درعا', 'lat' => 32.8167, 'lng' => 36.2000, 'address' => 'درعا - الصنمين', 'phone' => '0153344004', 'email' => 'sanamein@gov.sy'],
            
            ['name' => 'بلدية القنيطرة', 'governorate' => 'القنيطرة', 'lat' => 33.1250, 'lng' => 35.8244, 'address' => 'القنيطرة - مركز المدينة', 'phone' => '0143355000', 'email' => 'quneitra@gov.sy'],
            ['name' => 'بلدية فيق', 'governorate' => 'القنيطرة', 'lat' => 32.7833, 'lng' => 35.7000, 'address' => 'القنيطرة - فيق', 'phone' => '0143355001', 'email' => 'fiq@gov.sy'],
            ['name' => 'بلدية خان أرنبة', 'governorate' => 'القنيطرة', 'lat' => 33.0833, 'lng' => 35.8167, 'address' => 'القنيطرة - خان أرنبة', 'phone' => '0143355002', 'email' => 'khan-arnabeh@gov.sy'],
        ];

        foreach ($municipalities as $muni) {
            Municipality::updateOrCreate(
                ['name' => $muni['name']], 
                $muni
            );
        }

        $this->command->info('✅ تم إنشاء ' . count($municipalities) . ' بلدية ومجلس مدينة سوري بنجاح!');
    }
}
