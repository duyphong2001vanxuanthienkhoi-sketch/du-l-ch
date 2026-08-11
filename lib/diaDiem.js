// Dữ liệu địa điểm của Bản Đồ Số Hồng Gai — dùng chung cho:
//  - components/BanDoSo.jsx        (khối bản đồ trang chủ)
//  - components/BanDoLeaflet.jsx   (bản đồ THẬT OpenStreetMap — ghim theo viTri [vĩ độ, kinh độ])
//  - app/(public)/kham-pha         (trang danh sách khám phá)
//  - app/(public)/dia-diem/[id]    (trang giới thiệu từng địa điểm)
//  - app/admin/dia-diem            (admin gắn gian hàng đáng chú ý)
//
// ĐA NGÔN NGỮ: các trường chữ (ten, loai, mota, gioiThieu, diemNoiBat, thongTin)
// là mảng [vi, en, zh]. React component hiển thị bằng t(...truong); component bản đồ
// dựng HTML thủ công (BanDoLeaflet) dùng helper dichDD(truong, lang) bên dưới.
// Các trường KHÔNG dịch: id, mau, icon, toạ độ (viTri/x/y), lanCan.
//
// CHỈNH TỌA ĐỘ: mở Google Maps, bấm chuột phải vào đúng vị trí -> dòng đầu menu
// là "vĩ độ, kinh độ" -> bấm để sao chép rồi dán vào viTri bên dưới.
//
// ẢNH THẬT: thả file vào public/dia-diem/ (hỗ trợ .jpg/.jpeg/.png/.webp), đặt tên:
//   <id>.jpg   -> ảnh bìa, tự hiện ở trang chi tiết, /kham-pha và trang chủ (vd: nui-bai-tho.jpg)
//   <id>-2.jpg -> ảnh thêm cho mục "Hình ảnh" của trang chi tiết (tiếp -3.jpg, -4.jpg...)
// Chưa có file thì giao diện giữ nguyên emoji — không cần khai báo gì thêm trong file này.

export const DIA_DIEM = [
    {
        id: 'nui-bai-tho', mau: '#059669', icon: '⛰️',
        ten: ['Núi Bài Thơ', 'Bai Tho Mountain', '诗山'],
        loai: ['Di tích', 'Heritage site', '古迹'],
        mota: [
            'Biểu tượng của Hồng Gai — vách đá còn lưu bài thơ vua Lê Thánh Tông khắc năm 1468, đứng trên đỉnh ngắm trọn vịnh.',
            'A symbol of Hong Gai — its cliff still bears a poem carved by King Le Thanh Tong in 1468; from the summit you can see the whole bay.',
            '鸿基的象征 —— 崖壁上仍留有黎圣宗于1468年题刻的诗篇，登顶可尽览下龙湾。',
        ],
        x: 60, y: 50, nhanPhai: true, viTri: [20.9497, 107.0742],
        gioiThieu: [
            [
                'Núi Bài Thơ cao khoảng 200m, sừng sững ngay giữa lòng phường Hồng Gai như một chứng nhân của lịch sử. Tên núi bắt nguồn từ bài thơ chữ Hán được vua Lê Thánh Tông cho khắc lên vách đá năm 1468 khi tuần du vùng biển Đông Bắc — đến nay bút tích vẫn còn.',
                'Bai Tho Mountain rises about 200m right in the heart of Hong Gai ward, a witness to history. Its name comes from a classical Chinese poem King Le Thanh Tong had carved into the cliff in 1468 during a tour of the northeastern coast — the inscription survives to this day.',
                '诗山高约200米，矗立于鸿基坊中心，宛如历史的见证者。山名源自黎圣宗于1468年巡视东北海域时命人刻在崖壁上的一首汉文诗篇 —— 至今字迹犹存。',
            ],
            [
                'Với người Hồng Gai, ngọn núi này còn gắn với lá cờ đỏ sao vàng được treo trên đỉnh ngày 1/5/1930 — sự kiện đi vào lịch sử phong trào công nhân vùng mỏ. Đứng từ trên cao, toàn cảnh vịnh Hạ Long, cầu Bãi Cháy và phố phường Hòn Gai thu trọn trong tầm mắt.',
                'For the people of Hong Gai, the mountain is also tied to the red flag with a yellow star raised on its peak on 1 May 1930 — a milestone in the mining region\'s labour movement. From the top, all of Ha Long Bay, Bai Chay Bridge and the streets of Hon Gai unfold before your eyes.',
                '对鸿基人而言，这座山还与1930年5月1日在山顶升起的金星红旗紧紧相连 —— 这是矿区工人运动史上的重要事件。登高远眺，下龙湾、拜寨大桥和鸿街的街巷尽收眼底。',
            ],
        ],
        diemNoiBat: [
            ['Bút tích bài thơ của vua Lê Thánh Tông khắc trên vách đá từ năm 1468', 'King Le Thanh Tong\'s poem carved into the cliff since 1468', '黎圣宗于1468年刻于崖壁的诗篇真迹'],
            ['Điểm ngắm toàn cảnh vịnh Hạ Long đẹp bậc nhất vùng', 'One of the finest panoramic viewpoints over Ha Long Bay', '俯瞰下龙湾全景的绝佳观景点'],
            ['Di tích lá cờ Đảng tung bay ngày 1/5/1930 của công nhân vùng mỏ', 'Site where miners raised the Party flag on 1 May 1930', '矿区工人于1930年5月1日升起党旗的遗址'],
        ],
        thongTin: {
            gioMoCua: ['Đường lên núi mở theo khung giờ quy định — nên hỏi trước tại chân núi', 'The trail up opens on set hours — ask at the foot of the mountain beforehand', '上山道路按规定时段开放 —— 建议先在山脚询问'],
            giaVe: ['Tham khảo tại điểm soát vé chân núi', 'Check at the ticket point at the foot of the mountain', '详情请咨询山脚检票处'],
            diChuyen: ['Nằm ngay trung tâm Hồng Gai, đi bộ được từ chợ Hạ Long I và chùa Long Tiên', 'Right in central Hong Gai — walkable from Ha Long Market I and Long Tien Pagoda', '位于鸿基中心，可从下龙一市场和龙仙寺步行前往'],
        },
        lanCan: ['chua-long-tien', 'den-duc-ong', 'cho-ha-long-1'],
    },
    {
        id: 'chua-long-tien', mau: '#d97706', icon: '🏯',
        ten: ['Chùa Long Tiên', 'Long Tien Pagoda', '龙仙寺'],
        loai: ['Tâm linh', 'Spiritual', '灵修'],
        mota: [
            'Ngôi chùa lớn và đẹp nhất TP. Hạ Long (cũ), xây năm 1941 dưới chân núi Bài Thơ, kiến trúc thời Nguyễn độc đáo.',
            'The largest and most beautiful pagoda in former Ha Long City, built in 1941 at the foot of Bai Tho Mountain, in distinctive Nguyen-dynasty style.',
            '原下龙市规模最大、最美的寺庙，1941年建于诗山脚下，具有独特的阮朝建筑风格。',
        ],
        x: 55.5, y: 33.5, viTri: [20.9527, 107.0731],
        gioiThieu: [
            [
                'Chùa Long Tiên được xây dựng năm 1941 dưới chân núi Bài Thơ, là ngôi chùa lớn nhất và cũng là di tích danh thắng nổi tiếng bậc nhất TP. Hạ Long (cũ). Chùa mang phong cách kiến trúc và điêu khắc thời nhà Nguyễn với tam quan, chính điện và những mái đao cong vút.',
                'Long Tien Pagoda was built in 1941 at the foot of Bai Tho Mountain and is the largest pagoda and one of the most famous scenic relics in former Ha Long City. It follows Nguyen-dynasty architecture and carving, with a triple gate, main hall and gracefully curved roof ridges.',
                '龙仙寺始建于1941年，坐落在诗山脚下，是原下龙市规模最大、最负盛名的名胜古迹之一。寺庙沿袭阮朝的建筑与雕刻风格，设有三关门、正殿和飞檐翘角的屋脊。',
            ],
            [
                'Chùa thờ Phật, đồng thời phối thờ các vị tướng nhà Trần có công với dân tộc. Mỗi dịp lễ Tết hay ngày rằm, người dân Hồng Gai và du khách thập phương lại về đây dâng hương, cầu bình an — không khí trang nghiêm mà gần gũi.',
                'The pagoda venerates the Buddha and also honours Tran-dynasty generals who served the nation. On festivals, Tet and full-moon days, locals and pilgrims from afar come to offer incense and pray for peace — solemn yet warmly familiar.',
                '寺内供奉佛陀，同时配祀有功于国家的陈朝将领。每逢节庆、春节或农历十五，鸿基百姓与四方香客都会前来上香祈福 —— 庄严之中透着亲切。',
            ],
        ],
        diemNoiBat: [
            ['Ngôi chùa lớn nhất TP. Hạ Long (cũ), kiến trúc thời Nguyễn tinh xảo', 'The largest pagoda in former Ha Long City, with refined Nguyen-dynasty architecture', '原下龙市最大的寺庙，阮朝建筑精美'],
            ['Nằm ngay chân núi Bài Thơ — tiện ghé cùng một chuyến', 'Right at the foot of Bai Tho Mountain — easy to visit on the same trip', '就在诗山脚下 —— 可一同顺道游览'],
            ['Lễ hội chùa Long Tiên ngày 24/3 âm lịch hằng năm', 'Long Tien Pagoda Festival on the 24th day of the 3rd lunar month each year', '每年农历三月廿四举办龙仙寺庙会'],
        ],
        thongTin: {
            gioMoCua: ['Mở cửa hằng ngày, đông nhất vào sáng sớm, ngày rằm và mùng 1', 'Open daily, busiest in early morning and on the 1st and 15th of the lunar month', '每日开放，清晨及农历初一、十五最为热闹'],
            giaVe: ['Miễn phí (tùy tâm công đức)', 'Free (donations welcome)', '免费（随喜功德）'],
            diChuyen: ['Phố Long Tiên, ngay chân núi Bài Thơ — đi bộ 5 phút từ chợ Hạ Long I', 'Long Tien Street, at the foot of Bai Tho Mountain — a 5-minute walk from Ha Long Market I', '龙仙街，诗山脚下 —— 距下龙一市场步行5分钟'],
        },
        lanCan: ['nui-bai-tho', 'cho-ha-long-1', 'den-duc-ong'],
    },
    {
        id: 'den-duc-ong', mau: '#dc2626', icon: '⛩️',
        ten: ['Đền Đức Ông Trần Quốc Nghiễn', 'Duc Ong Tran Quoc Nghien Temple', '陈国宁德翁庙'],
        loai: ['Tâm linh', 'Spiritual', '灵修'],
        mota: [
            'Đền thờ danh tướng nhà Trần trấn giữ vùng Đông Bắc, nằm ngay đường bao biển đẹp nhất Hạ Long.',
            'A temple to a Tran-dynasty general who guarded the northeast, right on Ha Long\'s most beautiful coastal road.',
            '供奉镇守东北的陈朝名将的庙宇，就位于下龙最美的海滨大道旁。',
        ],
        x: 53.5, y: 66.5, viTri: [20.9450, 107.0758],
        gioiThieu: [
            [
                'Đền thờ Đức Ông Trần Quốc Nghiễn — con trai cả của Hưng Đạo Đại Vương Trần Quốc Tuấn, vị danh tướng có công trấn giữ vùng biển Đông Bắc. Đền tựa lưng vào núi Bài Thơ, mặt hướng ra vịnh, thế "tựa sơn hướng thủy" hiếm có.',
                'The temple honours Duc Ong Tran Quoc Nghien — eldest son of Grand Prince Tran Quoc Tuan (Hung Dao) and a distinguished general who guarded the northeastern seas. It sits with its back to Bai Tho Mountain and its face to the bay — a rare "mountain-backed, water-facing" position.',
                '庙宇供奉德翁陈国宁 —— 兴道大王陈国峻的长子、镇守东北海域的名将。庙宇背靠诗山、面朝海湾，坐拥罕见的"背山面水"格局。',
            ],
            [
                'Con đường bao biển Trần Quốc Nghiễn chạy ngang trước đền được mệnh danh là cung đường ven biển đẹp nhất Hạ Long — buổi chiều rất đông người dân ra đi bộ, đạp xe và ngắm vịnh. Ghé đền dâng hương rồi thong thả dạo biển là trải nghiệm không nên bỏ lỡ.',
                'The Tran Quoc Nghien coastal road in front of the temple is regarded as the most beautiful seaside route in Ha Long — in the afternoon locals flock here to walk, cycle and watch the bay. Offering incense at the temple, then strolling along the sea, is an experience not to be missed.',
                '庙前的陈国宁海滨大道被誉为下龙最美的滨海路 —— 每到傍晚，当地人纷纷前来散步、骑行、赏湾。到庙中上香后再沿海漫步，是不容错过的体验。',
            ],
            [
                'Hằng năm vào ngày 29 và 30 tháng 4, đền tưng bừng mở hội — Lễ hội đền Đức Ông Trần Quốc Nghiễn. Đoàn rước kiệu, cờ hội cùng những màn múa lân sư rồng nối dài dọc đường bao biển; phần lễ tế trang nghiêm dâng hương tưởng nhớ công đức vị danh tướng nhà Trần, phần hội rộn ràng thu hút đông đảo người dân và du khách thập phương.',
                'Every year on 29–30 April, the temple holds its lively festival — the Duc Ong Tran Quoc Nghien Temple Festival. Palanquin processions, festival flags and lion-dragon dances stretch along the coastal road; the solemn rites pay tribute to the Tran general, while the festivities draw crowds of locals and visitors from afar.',
                '每年4月29日至30日，庙里都会热闹举办陈国宁德翁庙会。抬轿队伍、庆典彩旗与舞狮舞龙沿海滨大道绵延不绝；庄严的祭典缅怀陈朝名将的功德，喧腾的庙会则吸引众多本地居民与四方游客。',
            ],
        ],
        diemNoiBat: [
            ['Thế đền "tựa sơn hướng thủy" — lưng tựa núi Bài Thơ, mặt hướng vịnh', '"Mountain-backed, water-facing" setting — back to Bai Tho Mountain, facing the bay', '"背山面水"格局 —— 背靠诗山，面朝海湾'],
            ['Nằm trên đường bao biển Trần Quốc Nghiễn nổi tiếng', 'On the famous Tran Quoc Nghien coastal road', '坐落于著名的陈国宁海滨大道旁'],
            ['Lễ hội đền Đức Ông tưng bừng ngày 29-30/4 hằng năm — rước kiệu, múa lân, tế lễ ven biển', 'Lively Duc Ong Temple Festival on 29–30 April each year — processions, lion dances and seaside rites', '每年4月29–30日热闹的德翁庙会 —— 抬轿、舞狮、海滨祭典'],
        ],
        thongTin: {
            gioMoCua: ['Mở cửa hằng ngày từ sáng đến chiều tối — sôi động nhất dịp lễ hội 29-30/4', 'Open daily from morning to evening — liveliest during the 29–30 April festival', '每日从早开放至傍晚 —— 4月29–30日庙会期间最为热闹'],
            giaVe: ['Miễn phí (tùy tâm công đức)', 'Free (donations welcome)', '免费（随喜功德）'],
            diChuyen: ['Đường bao biển Trần Quốc Nghiễn — 5 phút đi xe từ trung tâm Hồng Gai', 'Tran Quoc Nghien coastal road — a 5-minute drive from central Hong Gai', '陈国宁海滨大道 —— 距鸿基中心车程5分钟'],
        },
        lanCan: ['nui-bai-tho', 'bao-tang-qn', 'vinh-ha-long'],
    },
    {
        id: 'cho-ha-long-1', mau: '#ea580c', icon: '🛒',
        ten: ['Chợ Hạ Long I', 'Ha Long Market I', '下龙一市场'],
        loai: ['Mua sắm', 'Shopping', '购物'],
        mota: [
            'Chợ trung tâm sầm uất nhất Hòn Gai — hải sản tươi cập bến mỗi sáng, đặc sản và quà quê đủ đầy.',
            'The busiest central market in Hon Gai — fresh seafood landing every morning, with plenty of specialties and local gifts.',
            '鸿街最繁华的中心市场 —— 每早新鲜海鲜靠岸，特产与土特产一应俱全。',
        ],
        x: 37.5, y: 38, viTri: [20.9524, 107.0656],
        gioiThieu: [
            [
                'Chợ Hạ Long I (người địa phương quen gọi chợ Hòn Gai) là khu chợ trung tâm sầm uất bậc nhất vùng. Sáng sớm, thuyền cá cập bến mang theo tôm, cua, mực, cá song... tươi rói — cảnh mua bán tấp nập đậm chất phố biển.',
                'Ha Long Market I (locals still call it Hon Gai Market) is one of the region\'s busiest central markets. At dawn, fishing boats dock with fresh shrimp, crab, squid and grouper — a bustling scene full of coastal-town character.',
                '下龙一市场（当地人仍习惯称鸿街市场）是本地最繁华的中心市场之一。清晨，渔船靠岸，带来鲜活的虾、蟹、鱿鱼、石斑鱼 —— 熙攘的买卖场景满是海滨小城的气息。',
            ],
            [
                'Đây cũng chính là "phiên bản đời thực" của Chợ Số Hồng Gai: các tiểu thương trong chợ nay đã lên gian hàng số, du khách có thể xem hàng và đặt mua ngay trên trang này, giao tận nơi trong ngày hoặc gửi đi tỉnh.',
                'This is also the real-life counterpart of Cho So Hong Gai: market vendors now have digital storefronts, so visitors can browse and order right on this site, with same-day local delivery or shipping to other provinces.',
                '这里也正是"鸿基数字市场"的现实版：市场商户如今都开设了数字店铺，游客可直接在本站浏览下单，当日本地配送或寄往外省。',
            ],
        ],
        diemNoiBat: [
            ['Hải sản tươi cập bến mỗi sáng — tôm, cua, mực, cá song vịnh Hạ Long', 'Fresh seafood landing each morning — Ha Long Bay shrimp, crab, squid and grouper', '每早新鲜海鲜靠岸 —— 下龙湾的虾、蟹、鱿鱼、石斑鱼'],
            ['Đủ đầy đặc sản làm quà: chả mực, ruốc tôm, hải sản khô', 'Plenty of specialty gifts: grilled squid cake, shrimp floss, dried seafood', '各式特产伴手礼齐全：墨鱼饼、虾松、海鲜干货'],
            ['Nhiều tiểu thương đã có gian hàng số ngay trên Chợ Số Hồng Gai', 'Many vendors already have digital stores on Cho So Hong Gai', '许多商户已在鸿基数字市场开设数字店铺'],
        ],
        thongTin: {
            gioMoCua: ['Sáng sớm đến chiều tối hằng ngày — đông vui nhất 6h-9h sáng', 'Early morning to evening daily — busiest between 6–9 am', '每日清晨营业至傍晚 —— 早6至9点最热闹'],
            giaVe: ['Vào chợ tự do', 'Free entry', '自由进入'],
            diChuyen: ['Trung tâm Hồng Gai, cạnh bến xe buýt và bến tàu — đi bộ được từ núi Bài Thơ', 'Central Hong Gai, next to the bus and boat stations — walkable from Bai Tho Mountain', '鸿基中心，紧邻公交站和码头 —— 可从诗山步行前往'],
        },
        lanCan: ['chua-long-tien', 'nui-bai-tho', 'cau-bai-chay'],
    },
    {
        id: 'bao-tang-qn', mau: '#334155', icon: '🏛️',
        ten: ['Bảo tàng Quảng Ninh', 'Quang Ninh Museum', '广宁博物馆'],
        loai: ['Văn hóa', 'Culture', '文化'],
        mota: [
            '"Viên ngọc đen" soi bóng bên bờ vịnh — bảo tàng có kiến trúc độc đáo bậc nhất Việt Nam, điểm check-in không thể bỏ lỡ.',
            'The "black pearl" mirrored on the bay shore — one of Vietnam\'s most striking museum designs, a must-visit photo spot.',
            '映照在海湾之畔的"黑珍珠" —— 拥有越南顶尖独特建筑的博物馆，不容错过的打卡地。',
        ],
        x: 76.5, y: 60, viTri: [20.9385, 107.0922],
        gioiThieu: [
            [
                'Bảo tàng Quảng Ninh do kiến trúc sư người Tây Ban Nha Salvador Pérez Arroyo thiết kế, lấy cảm hứng từ than đá — khoáng sản đặc trưng của vùng mỏ. Khối nhà kính đen tuyền soi bóng xuống bờ vịnh khiến nơi đây được ví như "viên ngọc đen" của Hạ Long.',
                'Quang Ninh Museum was designed by Spanish architect Salvador Pérez Arroyo, inspired by coal — the mining region\'s signature mineral. Its jet-black glass block mirrored on the bay has earned it the nickname the "black pearl" of Ha Long.',
                '广宁博物馆由西班牙建筑师萨尔瓦多·佩雷斯·阿罗约设计，灵感取自矿区标志性的矿产 —— 煤炭。漆黑的玻璃建筑倒映在海湾之上，被誉为下龙的"黑珍珠"。',
            ],
            [
                'Bên trong là hành trình khám phá từ đáy biển lên rừng núi: mô hình bộ xương cá voi khổng lồ, lịch sử ngành than, văn hóa các dân tộc Quảng Ninh... Khu quảng trường phía trước là điểm check-in nổi tiếng, đẹp cả ban ngày lẫn khi lên đèn.',
                'Inside is a journey from the seabed to the mountains: a giant whale-skeleton model, the history of the coal industry, the cultures of Quang Ninh\'s ethnic groups... The square out front is a famous photo spot, lovely by day and after dark.',
                '馆内是一段从海底到山林的探索之旅：巨型鲸鱼骨架模型、煤炭工业史、广宁各民族文化…… 馆前广场是著名的拍照点，白天与夜幕降临时同样迷人。',
            ],
        ],
        diemNoiBat: [
            ['Kiến trúc "viên ngọc đen" độc đáo bậc nhất Việt Nam', 'The "black pearl" — one of Vietnam\'s most distinctive designs', '"黑珍珠"建筑 —— 越南最独特的设计之一'],
            ['Không gian trưng bày về biển, ngành than và văn hóa vùng mỏ', 'Exhibits on the sea, the coal industry and mining-region culture', '关于海洋、煤炭工业与矿区文化的展陈'],
            ['Điểm chụp ảnh nổi tiếng nhất nhì Hạ Long, đẹp nhất lúc hoàng hôn', 'One of Ha Long\'s top photo spots, loveliest at sunset', '下龙数一数二的拍照胜地，黄昏时最美'],
        ],
        thongTin: {
            gioMoCua: ['Mở cửa các ngày trong tuần theo giờ hành chính — nên kiểm tra trước khi đi', 'Open on weekdays during office hours — best to check before you go', '工作日按办公时间开放 —— 出行前建议先确认'],
            giaVe: ['Có bán vé tham quan, giá tham khảo tại quầy (trẻ em được giảm)', 'Admission tickets sold; check prices at the counter (discounts for children)', '售参观门票，价格详见售票处（儿童优惠）'],
            diChuyen: ['Đường Trần Quốc Nghiễn, cạnh Cung Quy hoạch — 5 phút đi xe từ trung tâm Hồng Gai', 'Tran Quoc Nghien Street, next to the Planning Palace — a 5-minute drive from central Hong Gai', '陈国宁大道，毗邻规划宫 —— 距鸿基中心车程5分钟'],
        },
        lanCan: ['den-duc-ong', 'vinh-ha-long', 'nui-bai-tho'],
    },
    {
        id: 'cau-bai-chay', mau: '#7c3aed', icon: '🌉',
        ten: ['Cầu Bãi Cháy', 'Bai Chay Bridge', '拜寨大桥'],
        loai: ['Ngắm cảnh', 'Scenic view', '观景'],
        mota: [
            'Cầu dây văng một mặt phẳng nối Hòn Gai với Bãi Cháy — nơi ngắm hoàng hôn Cửa Lục đẹp nao lòng.',
            'A single-plane cable-stayed bridge linking Hon Gai and Bai Chay — a breathtaking spot to watch the sunset over Cua Luc.',
            '连接鸿街与拜寨的单索面斜拉桥 —— 观赏局漉海口日落的醉人之地。',
        ],
        x: 17.5, y: 19, viTri: [20.9589, 107.0517],
        gioiThieu: [
            [
                'Cầu Bãi Cháy bắc qua eo Cửa Lục, nối đôi bờ Hòn Gai — Bãi Cháy, là một trong số ít cầu dây văng một mặt phẳng dây có khẩu độ nhịp lớn hàng đầu thế giới vào thời điểm khánh thành năm 2006. Trước khi có cầu, người dân hai bờ qua lại bằng phà.',
                'Bai Chay Bridge spans the Cua Luc strait, joining the two shores of Hon Gai and Bai Chay. When it opened in 2006 it was one of the few single-plane cable-stayed bridges with a world-leading main span. Before the bridge, people crossed by ferry.',
                '拜寨大桥横跨局漉海口，连接鸿街与拜寨两岸。2006年落成时，它是世界上少有的、主跨领先的单索面斜拉桥之一。建桥之前，两岸居民靠渡轮往来。',
            ],
            [
                'Buổi chiều, khu vực đầu cầu và vườn hoa dưới chân cầu là chỗ ngắm hoàng hôn Cửa Lục đẹp nao lòng: mặt nước loang ánh vàng, thuyền bè qua lại, xa xa là những dãy núi trập trùng. Lên đèn về đêm, cây cầu trở thành dải sáng vắt ngang eo biển.',
                'In the afternoon, the bridgehead area and the flower garden below are heart-stirring places to watch the Cua Luc sunset: the water shimmers gold, boats drift by, and rolling mountains line the horizon. After dark, the bridge becomes a ribbon of light across the strait.',
                '傍晚时分，桥头一带与桥下花园是观赏局漉海口日落的动人之地：水面泛起金光，舟船往来，远处群山连绵。夜幕降临，大桥化作一道横跨海口的光带。',
            ],
        ],
        diemNoiBat: [
            ['Cầu dây văng một mặt phẳng dây thuộc hàng khẩu độ lớn nhất thế giới khi khánh thành', 'A single-plane cable-stayed bridge with one of the world\'s largest spans at its opening', '落成时主跨居世界前列的单索面斜拉桥'],
            ['Điểm ngắm hoàng hôn Cửa Lục đẹp nhất Hạ Long', 'Ha Long\'s finest spot for the Cua Luc sunset', '下龙观赏局漉海口日落的最佳地点'],
            ['Về đêm cầu lên đèn lung linh vắt ngang eo biển', 'At night the bridge lights up, shimmering across the strait', '入夜后大桥灯火璀璨，横跨海口'],
        ],
        thongTin: {
            gioMoCua: ['Ngắm cầu tự do mọi khung giờ — đẹp nhất lúc hoàng hôn và khi lên đèn', 'Admire the bridge any time — best at sunset and when lit up', '全天皆可观赏 —— 日落与亮灯时最美'],
            giaVe: ['Miễn phí', 'Free', '免费'],
            diChuyen: ['Đầu cầu phía Hòn Gai cách trung tâm Hồng Gai khoảng 5 phút đi xe', 'The Hon Gai bridgehead is about a 5-minute drive from central Hong Gai', '鸿街一侧桥头距鸿基中心车程约5分钟'],
        },
        lanCan: ['cho-ha-long-1', 'chua-long-tien', 'vinh-ha-long'],
    },
    {
        id: 'vinh-ha-long', mau: '#0284c7', icon: '⛵',
        ten: ['Vịnh Hạ Long', 'Ha Long Bay', '下龙湾'],
        loai: ['Kỳ quan', 'World wonder', '世界奇观'],
        mota: [
            'Di sản thiên nhiên thế giới UNESCO với gần 2.000 đảo đá vôi kỳ vĩ — lên tàu tham quan ngay từ bến Hòn Gai.',
            'A UNESCO World Natural Heritage site with nearly 2,000 majestic limestone islands — board a tour boat right from Hon Gai wharf.',
            '拥有近2000座壮丽石灰岩岛屿的联合国教科文组织世界自然遗产 —— 可直接从鸿街码头登船游览。',
        ],
        x: 80.5, y: 86, viTri: [20.9120, 107.1075],
        gioiThieu: [
            [
                'Vịnh Hạ Long — Di sản thiên nhiên thế giới được UNESCO công nhận — trải rộng trên 1.500km² với gần 2.000 hòn đảo đá vôi lớn nhỏ nhô lên giữa làn nước xanh ngọc. Hang Sửng Sốt, đảo Ti Tốp, hòn Trống Mái... là những cái tên đã đi khắp thế giới.',
                'Ha Long Bay — a UNESCO-recognised World Natural Heritage site — stretches over 1,500 km² with nearly 2,000 limestone islands rising from jade-green waters. Sung Sot Cave, Ti Top Island, the Trong Mai (Fighting Cocks) islets... are names known the world over.',
                '下龙湾 —— 联合国教科文组织认定的世界自然遗产 —— 绵延1500多平方公里，近2000座大小石灰岩岛屿从碧绿海水中拔起。惊讶洞、迪岛、斗鸡石…… 这些名字早已闻名世界。',
            ],
            [
                'Từ phía Hồng Gai, du khách có thể lên tàu tham quan vịnh mà không cần vòng sang Bãi Cháy. Một chuyến tàu vài tiếng đủ để len giữa những dãy đảo đá, ghé hang động và làng chài — trải nghiệm nhất định phải có khi đến Hạ Long.',
                'From the Hong Gai side, visitors can board bay-tour boats without going over to Bai Chay. A few hours\' cruise is enough to weave among the rock islands, visit caves and fishing villages — a must-do experience in Ha Long.',
                '从鸿基一侧，游客无需绕到拜寨即可登船游湾。几个小时的航程便足以穿行于石岛之间，探访洞穴与渔村 —— 这是到下龙必不可少的体验。',
            ],
        ],
        diemNoiBat: [
            ['Di sản thiên nhiên thế giới UNESCO, kỳ quan của Việt Nam', 'A UNESCO World Natural Heritage site and wonder of Vietnam', '联合国教科文组织世界自然遗产，越南的奇观'],
            ['Gần 2.000 đảo đá vôi cùng hệ thống hang động kỳ vĩ', 'Nearly 2,000 limestone islands and a system of magnificent caves', '近2000座石灰岩岛屿及壮观的洞穴群'],
            ['Có thể lên tàu tham quan ngay từ bến phía Hòn Gai', 'Board a tour boat right from the Hon Gai side', '可直接从鸿街一侧登船游览'],
        ],
        thongTin: {
            gioMoCua: ['Tàu tham quan chạy ban ngày, xuất bến theo chuyến', 'Tour boats run during the day, departing by scheduled trips', '游船白天运营，按班次发船'],
            giaVe: ['Vé tham quan theo tuyến (tuyến 1, 2, 3...) — tham khảo tại bến tàu', 'Tickets by route (route 1, 2, 3...) — check at the wharf', '按航线售票（1、2、3号线……）—— 详见码头'],
            diChuyen: ['Mua vé và lên tàu tại cảng tàu khách — có tuyến xuất phát từ phía Hòn Gai', 'Buy tickets and board at the passenger port — some routes depart from the Hon Gai side', '在客运港购票登船 —— 部分航线从鸿街一侧出发'],
        },
        lanCan: ['bao-tang-qn', 'den-duc-ong', 'nui-bai-tho'],
    },
    {
        id: 'den-ba-chua', mau: '#be123c', icon: '⛩️',
        ten: ['Đền Bà Chúa', 'Ba Chua Temple', '婆主庙'],
        loai: ['Tâm linh', 'Spiritual', '灵修'],
        mota: [
            'Ngôi đền nhỏ linh thiêng trong cụm di tích núi Bài Thơ — nơi người dân Hồng Gai dâng hương cầu bình an, tài lộc.',
            'A small, sacred temple within the Bai Tho Mountain relic cluster — where Hong Gai locals offer incense for peace and prosperity.',
            '诗山古迹群中一座灵验的小庙 —— 鸿基百姓在此上香祈求平安与财运。',
        ],
        viTri: [20.9505, 107.0730],
        gioiThieu: [
            [
                'Đền Bà Chúa nằm trong cụm di tích danh thắng núi Bài Thơ, cùng với chùa Long Tiên và đền Đức Ông làm nên một quần thể tâm linh sầm uất ngay giữa lòng phường Hồng Gai. Đền thờ Mẫu — vị thánh trong tín ngưỡng thờ Mẫu của người Việt — được người dân vùng mỏ gìn giữ qua nhiều thế hệ.',
                'Ba Chua Temple lies within the Bai Tho Mountain scenic relic cluster, which together with Long Tien Pagoda and Duc Ong Temple forms a lively spiritual complex in the heart of Hong Gai ward. It venerates the Mother Goddess (Mau) — a deity of Vietnam\'s Mother Goddess worship — cherished by the mining community for generations.',
                '婆主庙位于诗山名胜古迹群中，与龙仙寺、德翁庙共同构成鸿基坊中心一处香火旺盛的灵修建筑群。庙中供奉圣母（母道信仰中的神明），世代为矿区百姓所敬奉。',
            ],
            [
                'Không gian đền nhỏ nhắn, trầm mặc dưới bóng núi. Vào ngày rằm, mùng một và dịp đầu xuân, người dân Hồng Gai lại về đây thắp hương, cầu cho một năm bình an, buôn may bán đắt — một nét sinh hoạt tín ngưỡng gần gũi của phố biển.',
                'The temple is small and quiet beneath the mountain\'s shadow. On full-moon days, the first of the month and in early spring, Hong Gai locals come to light incense and pray for a peaceful year and good business — a warm, familiar part of coastal-town spiritual life.',
                '庙宇小巧，在山影下静谧安宁。每逢农历十五、初一及初春，鸿基百姓便前来上香，祈求一年平安、生意兴隆 —— 这是海滨小城亲切的信仰生活。',
            ],
        ],
        diemNoiBat: [
            ['Nằm trong cụm di tích núi Bài Thơ — tiện ghé cùng chùa Long Tiên và đền Đức Ông', 'Within the Bai Tho Mountain relic cluster — easy to visit alongside Long Tien Pagoda and Duc Ong Temple', '位于诗山古迹群中 —— 可与龙仙寺、德翁庙一同游览'],
            ['Điểm sinh hoạt tín ngưỡng thờ Mẫu quen thuộc của người dân vùng mỏ', 'A familiar centre of Mother Goddess worship for the mining community', '矿区百姓熟悉的母道信仰活动场所'],
            ['Đông vui nhất dịp đầu xuân, ngày rằm và mùng một', 'Busiest in early spring and on the 1st and 15th of the lunar month', '初春及农历初一、十五最为热闹'],
        ],
        thongTin: {
            gioMoCua: ['Mở cửa hằng ngày, đông nhất sáng sớm và ngày rằm, mùng một', 'Open daily, busiest in early morning and on the 1st and 15th of the lunar month', '每日开放，清晨及农历初一、十五最热闹'],
            giaVe: ['Miễn phí (tùy tâm công đức)', 'Free (donations welcome)', '免费（随喜功德）'],
            diChuyen: ['Nằm dưới chân núi Bài Thơ, đi bộ được từ chùa Long Tiên và chợ Hạ Long I', 'At the foot of Bai Tho Mountain, walkable from Long Tien Pagoda and Ha Long Market I', '位于诗山脚下，可从龙仙寺和下龙一市场步行前往'],
        },
        lanCan: ['nui-bai-tho', 'chua-long-tien', 'nha-bia-tho-co'],
    },
    {
        id: 'nha-bia-tho-co', mau: '#0891b2', icon: '📜',
        ten: ['Nhà che bia thơ cổ', 'Ancient Poem Stele Shelter', '古诗碑亭'],
        loai: ['Di tích', 'Heritage site', '古迹'],
        mota: [
            'Nơi che chở những bài thơ cổ khắc trên vách đá núi Bài Thơ — trong đó có bút tích vua Lê Thánh Tông năm 1468 làm nên tên ngọn núi.',
            'A shelter protecting ancient poems carved into Bai Tho Mountain\'s cliff — including King Le Thanh Tong\'s 1468 inscription that gave the mountain its name.',
            '守护诗山崖壁上古老题诗的碑亭 —— 其中包括赋予山名的黎圣宗1468年题刻。',
        ],
        viTri: [20.9486, 107.0744],
        gioiThieu: [
            [
                'Ngay dưới chân núi Bài Thơ có một nhà che nhỏ dựng lên để bảo vệ các bài thơ cổ được khắc thẳng vào vách đá. Nổi tiếng nhất là bài thơ chữ Hán vua Lê Thánh Tông cho khắc năm 1468 khi tuần du vùng biển Đông Bắc — chính bài thơ này đã đặt tên cho ngọn núi và cả vùng đất.',
                'At the foot of Bai Tho Mountain stands a small shelter built to protect ancient poems carved directly into the cliff. The most famous is the classical Chinese poem King Le Thanh Tong had carved in 1468 during a tour of the northeastern coast — the very poem that gave the mountain and the whole area its name.',
                '诗山脚下建有一座小亭，用以守护直接刻在崖壁上的古老题诗。其中最著名的是黎圣宗于1468年巡视东北海域时命人刻下的汉文诗篇 —— 正是这首诗为山峰乃至整片土地命名。',
            ],
            [
                'Hơn hai thế kỷ sau, chúa Trịnh Cương cùng nhiều tao nhân mặc khách khác cũng để lại bút tích trên vách đá, biến nơi đây thành một "tập thơ khắc đá" độc đáo giữa thiên nhiên. Mái che giúp giữ gìn những nét chữ đã ngả màu thời gian trước mưa nắng — một điểm dừng chân đáng quý cho ai yêu lịch sử.',
                'More than two centuries later, Lord Trinh Cuong and many other men of letters also left inscriptions on the cliff, turning the site into a unique "anthology carved in stone" amid nature. The shelter helps preserve the time-worn characters from sun and rain — a precious stop for anyone who loves history.',
                '两个多世纪后，郑棡王及众多文人墨客也在崖壁上留下题刻，使此处成为大自然中独特的"石刻诗集"。碑亭护佑着这些已被岁月染色的字迹，使之免受风吹日晒 —— 是历史爱好者难得的驻足之地。',
            ],
        ],
        diemNoiBat: [
            ['Bảo vệ bút tích bài thơ vua Lê Thánh Tông khắc trên đá từ năm 1468', 'Protects King Le Thanh Tong\'s poem carved in stone since 1468', '守护黎圣宗自1468年刻于石上的题诗真迹'],
            ['Nơi lưu giữ nhiều bài thơ cổ của các danh nhân qua các thời kỳ', 'Preserves many ancient poems by notable figures across the ages', '保存着历代名人的众多古诗'],
            ['Điểm khởi đầu ý nghĩa trước khi leo lên đỉnh núi Bài Thơ', 'A meaningful starting point before climbing to Bai Tho Mountain\'s summit', '登诗山之巅前富有意义的起点'],
        ],
        thongTin: {
            gioMoCua: ['Tham quan ban ngày — nên hỏi trước tại chân núi về đường lên', 'Daytime visits — ask at the foot of the mountain about the trail beforehand', '白天参观 —— 建议先在山脚询问上山路线'],
            giaVe: ['Tham khảo tại điểm soát vé chân núi', 'Check at the ticket point at the foot of the mountain', '详情请咨询山脚检票处'],
            diChuyen: ['Dưới chân núi Bài Thơ, ngay gần chùa Long Tiên và đền Bà Chúa', 'At the foot of Bai Tho Mountain, close to Long Tien Pagoda and Ba Chua Temple', '位于诗山脚下，紧邻龙仙寺与婆主庙'],
        },
        lanCan: ['nui-bai-tho', 'den-ba-chua', 'chua-long-tien'],
    },
    {
        id: 'vincom-hong-gai', mau: '#c026d3', icon: '🛍️',
        ten: ['Vincom Plaza Hồng Gai', 'Vincom Plaza Hong Gai', '鸿基Vincom广场'],
        loai: ['Mua sắm', 'Shopping', '购物'],
        mota: [
            'Trung tâm thương mại hiện đại bậc nhất Hồng Gai tại khu Cột Đồng Hồ — mua sắm, rạp phim, khu ẩm thực và vui chơi trong nhà.',
            'Hong Gai\'s premier modern mall at the Clock Tower area — shopping, cinema, food court and indoor entertainment.',
            '位于钟楼一带、鸿基最现代的商业中心 —— 购物、影院、美食广场与室内娱乐。',
        ],
        viTri: [20.9522, 107.0802],
        gioiThieu: [
            [
                'Vincom Plaza toạ lạc ngay khu Cột Đồng Hồ trên đường Trần Quốc Nghiễn — một trong những vị trí trung tâm và sầm uất nhất phía Hồng Gai. Đây là điểm mua sắm, giải trí hiện đại, đối lập thú vị với không khí chợ truyền thống gần đó.',
                'Vincom Plaza sits right at the Clock Tower area on Tran Quoc Nghien Street — one of the most central, bustling spots on the Hong Gai side. It\'s a modern shopping and entertainment hub, an interesting contrast to the traditional market nearby.',
                'Vincom广场就位于陈国宁大道上的钟楼一带 —— 鸿基一侧最中心、最繁华的地段之一。这里是现代购物娱乐中心，与附近传统市场形成有趣的对比。',
            ],
            [
                'Bên trong có gian hàng thời trang, siêu thị, rạp chiếu phim, khu vui chơi trẻ em và khu ẩm thực đa dạng. Ngày mưa gió hay buổi tối oi bức, đây là nơi lý tưởng để cả gia đình đổi gió, ăn uống và mua sắm mà không lo thời tiết.',
                'Inside are fashion stores, a supermarket, a cinema, a children\'s play area and a diverse food court. On rainy days or sultry evenings, it\'s an ideal place for the whole family to unwind, eat and shop regardless of the weather.',
                '内设时装店、超市、电影院、儿童游乐区和多样的美食广场。遇上雨天或闷热的夜晚，这里是全家不受天气影响、休闲、用餐、购物的理想去处。',
            ],
        ],
        diemNoiBat: [
            ['Ngay khu Cột Đồng Hồ — trung tâm sầm uất phía Hồng Gai', 'Right at the Clock Tower area — the bustling centre of the Hong Gai side', '就在钟楼一带 —— 鸿基一侧的繁华中心'],
            ['Đủ tiện ích: thời trang, siêu thị, rạp phim, khu vui chơi, ẩm thực', 'Full amenities: fashion, supermarket, cinema, play area, dining', '设施齐全：时装、超市、影院、游乐区、餐饮'],
            ['Điểm đổi gió lý tưởng cho gia đình, nhất là ngày mưa hoặc buổi tối', 'An ideal family getaway, especially on rainy days or evenings', '家庭休闲的理想去处，尤其适合雨天或夜晚'],
        ],
        thongTin: {
            gioMoCua: ['Mở cửa hằng ngày, thường từ khoảng 9:30 đến 22:00', 'Open daily, usually from around 9:30 to 22:00', '每日开放，通常约9:30至22:00'],
            giaVe: ['Vào cửa tự do', 'Free entry', '自由进入'],
            diChuyen: ['Khu Cột Đồng Hồ, đường Trần Quốc Nghiễn — trung tâm Hồng Gai, gần chợ Hạ Long I', 'Clock Tower area, Tran Quoc Nghien Street — central Hong Gai, near Ha Long Market I', '钟楼一带，陈国宁大道 —— 鸿基中心，近下龙一市场'],
        },
        lanCan: ['cho-ha-long-1', 'bao-tang-qn', 'den-duc-ong'],
    },
    {
        id: 'chua-bao-hai-linh-thong-tu', mau: '#b45309', icon: '🏯',
        ten: ['Chùa Bảo Hải Linh Thông Tự', 'Bao Hai Linh Thong Pagoda', '宝海灵通寺'],
        loai: ['Tâm linh', 'Spiritual', '灵修'],
        mota: [
            'Ngôi chùa Việt uy nghi trên đỉnh Ba Đèo, ẩn giữa rừng thông với tầm nhìn ôm trọn vịnh Hạ Long — khánh thành năm 2021.',
            'A stately Vietnamese pagoda atop Ba Deo hill, tucked in a pine forest with sweeping views of Ha Long Bay — inaugurated in 2021.',
            '巍然矗立于巴嶝顶的越式寺庙，隐于松林之间，尽揽下龙湾景致 —— 2021年落成。',
        ],
        viTri: [20.9483, 107.0662],
        gioiThieu: [
            [
                'Bảo Hải Linh Thông Tự toạ lạc trên đỉnh Ba Đèo, mang lối kiến trúc chùa Việt truyền thống với mái đao cong, gỗ và đá được chạm khắc tinh xảo. Chùa ẩn mình giữa rừng thông xanh mát, tạo nên một không gian thanh tịnh tách biệt hẳn nhịp phố phường bên dưới.',
                'Bao Hai Linh Thong Pagoda stands atop Ba Deo hill in traditional Vietnamese pagoda style, with curved roof ridges and finely carved wood and stone. Nestled among green pines, it offers a serene space set apart from the bustle of the streets below.',
                '宝海灵通寺坐落于巴嶝之巅，采用传统越式寺庙风格，飞檐翘角，木石雕刻精美。寺庙隐于苍翠松林间，营造出与山下街市喧嚣截然不同的清净空间。',
            ],
            [
                'Từ sân chùa, du khách phóng tầm mắt ngắm trọn vịnh Hạ Long và phố phường từ trên cao — góc nhìn được nhiều người ví là "view triệu đô". Được khánh thành năm 2021, ngôi chùa nhanh chóng trở thành điểm hành hương và vãn cảnh yêu thích của cả người dân lẫn du khách.',
                'From the pagoda courtyard, visitors take in all of Ha Long Bay and the town from above — a view many call "a million-dollar view." Inaugurated in 2021, the pagoda quickly became a favourite place of pilgrimage and sightseeing for locals and visitors alike.',
                '在寺庙庭院中，游客可从高处将下龙湾与城区尽收眼底 —— 许多人称之为"百万美元景观"。寺庙于2021年落成，很快便成为本地人与游客钟爱的朝圣与观光胜地。',
            ],
        ],
        diemNoiBat: [
            ['Kiến trúc chùa Việt truyền thống uy nghi giữa rừng thông trên đỉnh Ba Đèo', 'Stately traditional Vietnamese pagoda architecture amid pines atop Ba Deo hill', '巴嶝顶松林间巍峨的传统越式寺庙建筑'],
            ['Tầm nhìn toàn cảnh vịnh Hạ Long và phố phường từ trên cao', 'Panoramic views of Ha Long Bay and the town from above', '从高处俯瞰下龙湾与城区的全景'],
            ['Không gian hành hương, vãn cảnh thanh tịnh — đẹp cả sáng sớm lẫn hoàng hôn', 'A serene place for pilgrimage and sightseeing — lovely at both dawn and sunset', '清净的朝圣与观景之地 —— 清晨与黄昏皆美'],
        ],
        thongTin: {
            gioMoCua: ['Mở cửa ban ngày — nên đi sáng sớm hoặc chiều mát để ngắm cảnh đẹp nhất', 'Open in the daytime — visit early morning or the cool afternoon for the best views', '白天开放 —— 建议清晨或傍晚凉爽时前往，观景最佳'],
            giaVe: ['Tham khảo tại khu vực cổng vào (có thể đi kèm vé tổ hợp tham quan)', 'Check at the entrance gate (may be part of a combined tour ticket)', '详情请咨询入口处（或含在联票中）'],
            diChuyen: ['Trên đỉnh Ba Đèo, phía Hồng Gai — đi xe lên đồi, cách trung tâm vài phút', 'Atop Ba Deo hill on the Hong Gai side — drive up the hill, a few minutes from the centre', '位于鸿基一侧的巴嶝之巅 —— 驱车上山，距中心数分钟'],
        },
        lanCan: ['nui-bai-tho', 'cho-ha-long-1', 'vinh-ha-long'],
    },
]

// Chọn bản dịch theo ngôn ngữ cho một GIÁ TRỊ địa điểm dạng [vi, en, zh].
// Dùng cho component dựng HTML/thủ công (BanDoLeaflet) không tiện gọi hook t().
// React component nên gọi t(...truong) trực tiếp.
const _CHISO = { vi: 0, en: 1, zh: 2 }
export const dichDD = (v, lang = 'vi') => Array.isArray(v) ? (v[_CHISO[lang] ?? 0] ?? v[0]) : v

export const timDiaDiem = (id) => DIA_DIEM.find(d => d.id === id) || null

// ten có thể là mảng [vi,en,zh] — luôn dùng bản tiếng Việt để tra Google Maps cho đúng.
export const linkChiDuong = (ten) => {
    const s = Array.isArray(ten) ? ten[0] : ten
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s + ' Hạ Long Quảng Ninh')}`
}
