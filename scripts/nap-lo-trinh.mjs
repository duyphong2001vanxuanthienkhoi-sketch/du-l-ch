// Nạp LỘ TRÌNH, BỘ SƯU TẬP và SỰ KIỆN mẫu cho Hồng Gai.
// Chạy:  npm run nap-lo-trinh      (cần có bảng + đã nạp địa điểm trước)
//
// AN TOÀN KHI CHẠY LẠI: đã có thì bỏ qua, không đè bản biên tập viên đã sửa.
//
// Nội dung dựng từ chính các địa điểm trong lib/diaDiem.mjs — giờ giấc là GỢI Ý
// hợp lý theo khoảng cách đi bộ thực tế giữa các điểm trong phường, không phải
// lịch cứng. Lễ hội lấy đúng mốc đã ghi trong phần giới thiệu địa điểm.
import { ketNoiAnToan } from './_csdl.mjs'

const sql = await ketNoiAnToan()
const luc = new Date().toISOString()

const LO_TRINH = [
    {
        id: 'hong-gai-mot-ngay', kieu: 'lo_trinh', mau: '#0284c7', icon: '🌤️', noiBat: 10,
        ten: ['Hồng Gai một ngày', 'Hong Gai in a day', '鸿基一日游'],
        mota: [
            'Từ chùa cổ lên đỉnh núi, xuống chợ biển rồi kết bằng hoàng hôn Cửa Lục — trọn vẹn Hồng Gai trong một ngày đi bộ là chính.',
            'From an ancient pagoda to a mountain summit, down to the sea market and ending with the Cua Luc sunset — all of Hong Gai in one mostly-walkable day.',
            '从古寺登上山顶，再到海市，最后以局漉海口的日落收尾 —— 一天之内、以步行为主，走遍鸿基。',
        ],
        thoiLuong: ['Khoảng 1 ngày', 'About 1 day', '约一天'],
        diem: [
            { diaDiemId: 'chua-long-tien', gio: '08:00', phut: 45, ghiChu: ['Đi sớm cho mát và vắng', 'Go early — cooler and quieter', '早去凉快又清静'] },
            { diaDiemId: 'nha-bia-tho-co', gio: '09:00', phut: 30, ghiChu: ['Ghé xem bút tích trước khi lên núi', 'See the inscriptions before climbing', '登山前先看题刻'] },
            { diaDiemId: 'nui-bai-tho', gio: '09:45', phut: 90, ghiChu: ['Hỏi trước ở chân núi về đường lên', 'Ask at the foot about the trail first', '先在山脚询问上山路线'] },
            { diaDiemId: 'cho-ha-long-1', gio: '11:30', phut: 60, ghiChu: ['Ăn trưa và mua đặc sản khô làm quà', 'Lunch and dried specialties to take home', '午餐并选购干货特产'] },
            { diaDiemId: 'bao-tang-qn', gio: '14:00', phut: 90, ghiChu: ['Tránh nắng gắt đầu giờ chiều', 'Escape the early-afternoon heat', '避开午后烈日'] },
            { diaDiemId: 'den-duc-ong', gio: '16:00', phut: 45, ghiChu: ['Dâng hương rồi dạo đường bao biển', 'Offer incense, then stroll the coastal road', '上香后沿海滨大道散步'] },
            { diaDiemId: 'cau-bai-chay', gio: '17:30', phut: 60, ghiChu: ['Điểm ngắm hoàng hôn đẹp nhất', 'The finest sunset spot', '最佳日落观赏点'] },
        ],
    },
    {
        id: 'nua-ngay-tam-linh', kieu: 'lo_trinh', mau: '#d97706', icon: '🏯', noiBat: 9,
        ten: ['Nửa ngày tâm linh', 'Half a day of temples', '半日灵修之旅'],
        mota: [
            'Cụm di tích quanh chân núi Bài Thơ — bốn điểm đi bộ được với nhau, hợp cho buổi sáng đầu xuân hoặc ngày rằm.',
            'The relic cluster at the foot of Bai Tho Mountain — four sites within walking distance, ideal for an early-spring morning or a full-moon day.',
            '诗山脚下的古迹群 —— 四处景点彼此可步行往来，适合初春清晨或农历十五。',
        ],
        thoiLuong: ['Khoảng 4 tiếng', 'About 4 hours', '约4小时'],
        diem: [
            { diaDiemId: 'chua-long-tien', gio: '07:30', phut: 45, ghiChu: ['', '', ''] },
            { diaDiemId: 'den-ba-chua', gio: '08:30', phut: 30, ghiChu: ['', '', ''] },
            { diaDiemId: 'den-duc-ong', gio: '09:15', phut: 45, ghiChu: ['Mặt hướng vịnh, lưng tựa núi', 'Facing the bay, backed by the mountain', '面朝海湾，背靠山峰'] },
            { diaDiemId: 'chua-bao-hai-linh-thong-tu', gio: '10:30', phut: 60, ghiChu: ['Lên đỉnh Ba Đèo ngắm toàn cảnh vịnh', 'Up Ba Deo hill for the full bay view', '登巴嶝顶俯瞰海湾全景'] },
        ],
    },
    {
        id: 'chieu-hoang-hon', kieu: 'lo_trinh', mau: '#ea580c', icon: '🌅', noiBat: 8,
        ten: ['Chiều hoàng hôn & lên đèn', 'Sunset & city lights', '黄昏与灯火'],
        mota: [
            'Buổi chiều muộn dành cho người thích chụp ảnh: bảo tàng lúc nắng xiên, đường bao biển lúc trời chuyển màu, cây cầu lúc lên đèn.',
            'A late afternoon for photographers: the museum in slanting light, the coastal road as the sky turns, the bridge as it lights up.',
            '为摄影爱好者准备的傍晚：斜阳中的博物馆、天色渐变时的海滨大道、华灯初上的大桥。',
        ],
        thoiLuong: ['Khoảng 4 tiếng', 'About 4 hours', '约4小时'],
        diem: [
            { diaDiemId: 'bao-tang-qn', gio: '15:30', phut: 75, ghiChu: ['Quảng trường trước bảo tàng rất ăn ảnh', 'The square out front is very photogenic', '馆前广场非常上镜'] },
            { diaDiemId: 'den-duc-ong', gio: '17:00', phut: 45, ghiChu: ['', '', ''] },
            { diaDiemId: 'cau-bai-chay', gio: '18:00', phut: 60, ghiChu: ['Ở lại tới lúc cầu lên đèn', 'Stay until the bridge lights up', '待到大桥亮灯'] },
            { diaDiemId: 'vincom-hong-gai', gio: '19:15', phut: 90, ghiChu: ['Ăn tối trong nhà, tránh gió biển', 'Dinner indoors, out of the sea breeze', '室内用餐，避开海风'] },
        ],
    },
    {
        id: 'check-in-hoang-hon', kieu: 'bo_suu_tap', mau: '#7c3aed', icon: '📸', noiBat: 7,
        ten: ['Góc check-in đẹp nhất', 'Best photo spots', '最佳拍照地'],
        mota: [
            'Những nơi người Hồng Gai hay dẫn khách tới chụp ảnh — đẹp nhất lúc chiều muộn.',
            'Where locals take their guests for photos — at their best in late afternoon.',
            '鸿基人常带客人来拍照的地方 —— 傍晚时分最美。',
        ],
        thoiLuong: ['', '', ''],
        diem: [
            { diaDiemId: 'cau-bai-chay', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'bao-tang-qn', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'chua-bao-hai-linh-thong-tu', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'nui-bai-tho', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'vinh-ha-long', gio: '', phut: 0, ghiChu: ['', '', ''] },
        ],
    },
    {
        id: 'khong-ton-ve', kieu: 'bo_suu_tap', mau: '#059669', icon: '🎟️', noiBat: 6,
        ten: ['Đi chơi không tốn vé', 'Free to visit', '免费游玩'],
        mota: [
            'Vào cửa tự do hoặc tuỳ tâm công đức — đi cả ngày mà không mất tiền vé.',
            'Free entry or donation-based — a whole day out without paying admission.',
            '免费入场或随喜功德 —— 玩上一整天也无需门票。',
        ],
        thoiLuong: ['', '', ''],
        diem: [
            { diaDiemId: 'chua-long-tien', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'den-duc-ong', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'den-ba-chua', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'cau-bai-chay', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'cho-ha-long-1', gio: '', phut: 0, ghiChu: ['', '', ''] },
            { diaDiemId: 'vincom-hong-gai', gio: '', phut: 0, ghiChu: ['', '', ''] },
        ],
    },
]

const SU_KIEN = [
    {
        id: 'le-hoi-den-duc-ong', diaDiemId: 'den-duc-ong', mau: '#dc2626', icon: '🎏', noiBat: 10,
        ten: ['Lễ hội đền Đức Ông Trần Quốc Nghiễn', 'Duc Ong Tran Quoc Nghien Temple Festival', '陈国宁德翁庙会'],
        mota: [
            'Lễ hội lớn nhất Hồng Gai — rước kiệu, múa lân sư rồng dọc đường bao biển.',
            'Hong Gai\'s biggest festival — palanquin processions and lion-dragon dances along the coastal road.',
            '鸿基最盛大的庙会 —— 沿海滨大道抬轿巡游、舞狮舞龙。',
        ],
        noiDung: [
            [
                'Hằng năm vào ngày 29 và 30 tháng 4, đền Đức Ông tưng bừng mở hội. Đoàn rước kiệu, cờ hội cùng những màn múa lân sư rồng nối dài dọc đường bao biển Trần Quốc Nghiễn.',
                'Every year on 29–30 April, Duc Ong Temple holds its lively festival. Palanquin processions, festival flags and lion-dragon dances stretch along the Tran Quoc Nghien coastal road.',
                '每年4月29日至30日，德翁庙都会热闹举办庙会。抬轿队伍、庆典彩旗与舞狮舞龙沿陈国宁海滨大道绵延不绝。',
            ],
            [
                'Phần lễ tế trang nghiêm dâng hương tưởng nhớ công đức vị danh tướng nhà Trần; phần hội rộn ràng thu hút đông đảo người dân và du khách thập phương. Nên đi sớm vì đường bao biển rất đông vào giờ rước.',
                'The solemn rites pay tribute to the Tran-dynasty general, while the festivities draw crowds of locals and visitors. Come early — the coastal road gets very busy at procession time.',
                '庄严的祭典缅怀陈朝名将的功德，喧腾的庙会则吸引众多本地居民与四方游客。建议早到 —— 巡游时段海滨大道十分拥挤。',
            ],
        ],
        batDau: '2026-04-29', ketThuc: '2026-04-30', hangNam: true, amLich: false,
        ghiChuNgay: ['Ngày 29–30/4 dương lịch hằng năm', 'Annually on 29–30 April', '每年公历4月29–30日'],
    },
    {
        id: 'hoi-chua-long-tien', diaDiemId: 'chua-long-tien', mau: '#d97706', icon: '🪷', noiBat: 9,
        ten: ['Lễ hội chùa Long Tiên', 'Long Tien Pagoda Festival', '龙仙寺庙会'],
        mota: [
            'Hội chùa lớn nhất vùng, tổ chức ngày 24/3 âm lịch hằng năm dưới chân núi Bài Thơ.',
            'The region\'s largest pagoda festival, held on the 24th day of the 3rd lunar month at the foot of Bai Tho Mountain.',
            '本地区最大的寺庙庙会，每年农历三月廿四在诗山脚下举行。',
        ],
        noiDung: [
            [
                'Ngày 24 tháng 3 âm lịch, chùa Long Tiên mở hội. Người dân Hồng Gai và khách thập phương về dâng hương, cầu bình an — không khí trang nghiêm mà gần gũi đúng chất phố biển.',
                'On the 24th day of the 3rd lunar month, Long Tien Pagoda holds its festival. Locals and pilgrims from afar come to offer incense and pray for peace — solemn yet warmly familiar.',
                '农历三月廿四，龙仙寺举办庙会。鸿基百姓与四方香客前来上香祈福 —— 庄严之中透着海滨小城的亲切。',
            ],
        ],
        batDau: '', ketThuc: '', hangNam: true, amLich: true,
        ghiChuNgay: [
            'Ngày 24/3 âm lịch hằng năm (thường rơi vào tháng 4–5 dương lịch)',
            '24th day of the 3rd lunar month (usually April–May)',
            '每年农历三月廿四（通常在公历4–5月）',
        ],
    },
    {
        id: 'ky-niem-co-dang-nui-bai-tho', diaDiemId: 'nui-bai-tho', mau: '#059669', icon: '🚩', noiBat: 8,
        ten: ['Kỷ niệm ngày treo cờ Đảng trên núi Bài Thơ', 'Anniversary of the Party flag on Bai Tho Mountain', '诗山升党旗纪念日'],
        mota: [
            'Ngày 1/5 — kỷ niệm lá cờ đỏ sao vàng tung bay trên đỉnh núi Bài Thơ năm 1930.',
            '1 May — marking the red flag with a yellow star raised on Bai Tho Mountain\'s peak in 1930.',
            '5月1日 —— 纪念1930年金星红旗在诗山之巅升起。',
        ],
        noiDung: [
            [
                'Ngày 1/5/1930, lá cờ đỏ sao vàng được treo trên đỉnh núi Bài Thơ — sự kiện đi vào lịch sử phong trào công nhân vùng mỏ. Dịp này khu di tích thường có hoạt động kỷ niệm và rất đông người dân lên núi.',
                'On 1 May 1930 the red flag with a yellow star was raised on the peak of Bai Tho Mountain — a milestone in the mining region\'s labour movement. Around this date the site usually holds commemorations and draws many visitors up the mountain.',
                '1930年5月1日，金星红旗在诗山之巅升起 —— 这是矿区工人运动史上的重要事件。此时遗址通常举办纪念活动，许多人会登山参观。',
            ],
        ],
        batDau: '2026-05-01', ketThuc: '2026-05-01', hangNam: true, amLich: false,
        ghiChuNgay: ['Ngày 1/5 hằng năm', 'Annually on 1 May', '每年5月1日'],
    },
]

async function nap(bang, ds, chuanHoa) {
    let them = 0
    const boQua = []
    for (const x of ds) {
        const rows = await sql.query(
            `INSERT INTO ${bang} (id, data) VALUES ($1, $2::jsonb)
             ON CONFLICT (id) DO NOTHING RETURNING id`,
            [x.id, JSON.stringify(chuanHoa(x))],
        )
        if (rows.length) { them++; console.log('  + ', x.id) }
        else boQua.push(x.id)
    }
    console.log(`  => thêm ${them}` + (boQua.length ? `, bỏ qua ${boQua.length} đã có` : ''))
}

const dayDuLoTrinh = (x) => ({
    ...x,
    anhBia: '',
    status: 'da_duyet',
    createdAt: luc,
    capNhatLuc: luc,
})

const dayDuSuKien = (x) => ({
    ...x,
    anhBia: '',
    status: 'da_duyet',
    createdAt: luc,
    capNhatLuc: luc,
})

console.log('Lộ trình & bộ sưu tập:')
await nap('lo_trinh', LO_TRINH, dayDuLoTrinh)

console.log('\nSự kiện & lễ hội:')
await nap('su_kien', SU_KIEN, dayDuSuKien)

const [{ n_lt }] = await sql`SELECT COUNT(*)::int AS n_lt FROM lo_trinh`
const [{ n_sk }] = await sql`SELECT COUNT(*)::int AS n_sk FROM su_kien`
console.log(`\nXong. lo_trinh: ${n_lt} · su_kien: ${n_sk}`)
