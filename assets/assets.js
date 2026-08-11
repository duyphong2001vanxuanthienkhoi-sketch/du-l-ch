import gs_logo      from "./gs_logo.jpg"
import happy_store  from "./happy_store.webp"
import upload_area  from "./upload_area.svg"

// Hero images – Hồng Gai themed
import hero_model_img    from "./hero_main.svg"
import hero_product_img1 from "./hero_panel1.svg"
import hero_product_img2 from "./hero_panel2.svg"

// Product images – đặc sản & hải sản Quảng Ninh
import product_img1  from "./p_tom_hum.svg"
import product_img2  from "./p_cua_bien.svg"
import product_img3  from "./p_ca_song.svg"
import product_img4  from "./p_muc_tuoi.svg"
import product_img5  from "./p_cha_muc.svg"
import product_img6  from "./p_hai_san_kho.svg"
import product_img7  from "./p_tra_hoa_vang.svg"
import product_img8  from "./p_nuoc_mam.svg"
import product_img9  from "./p_muc_kho.svg"
import product_img10 from "./p_ruoc_tom.svg"
import product_img11 from "./p_thu_cong.svg"
import product_img12 from "./p_ruou_ba_kich.svg"

import { ClockFadingIcon, HeadsetIcon, SendIcon } from "lucide-react"
import profile_pic1 from "./profile_pic1.jpg"
import profile_pic2 from "./profile_pic2.jpg"
import profile_pic3 from "./profile_pic3.jpg"

export const assets = {
    upload_area, hero_model_img,
    hero_product_img1, hero_product_img2, gs_logo,
    product_img1, product_img2, product_img3, product_img4,
    product_img5, product_img6, product_img7, product_img8,
    product_img9, product_img10, product_img11, product_img12,
}

// Danh mục sản phẩm Hồng Gai
export const categories = [
    "Chợ Tươi", "Hải Sản Khô", "Đặc Sản", "Quà Lưu Niệm",
    "Trà & Thảo Mộc", "Thủ Công Mỹ Nghệ",
]

export const dummyRatingsData = [
    { id: "rat_1", rating: 4.2, review: "Tôm hùm tươi ngon, giao hàng đúng giờ. Sẽ mua lại lần sau!", user: { name: 'Nguyễn Thị Lan', image: profile_pic1 }, productId: "prod_1", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', product: { name: 'Tôm Hùm Tươi', category: 'Chợ Tươi', id: 'prod_1' } },
    { id: "rat_2", rating: 5.0, review: "Chả mực Hạ Long thơm ngon, đóng gói cẩn thận. Đặc sản chính gốc!", user: { name: 'Trần Văn Nam', image: profile_pic2 }, productId: "prod_2", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', product: { name: 'Chả Mực Hạ Long', category: 'Đặc Sản', id: 'prod_2' } },
    { id: "rat_3", rating: 4.1, review: "Trà hoa vàng rất thơm, uống vào buổi sáng rất tốt cho sức khỏe.", user: { name: 'Lê Thị Hoa', image: profile_pic3 }, productId: "prod_3", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', product: { name: 'Trà Hoa Vàng', category: 'Trà & Thảo Mộc', id: 'prod_3' } },
    { id: "rat_4", rating: 5.0, review: "Cua biển tươi, thịt chắc. Dịch vụ tốt, giao hàng nhanh.", user: { name: 'Phạm Minh Tuấn', image: profile_pic1 }, productId: "prod_4", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', product: { name: 'Cua Biển Tươi', category: 'Chợ Tươi', id: 'prod_4' } },
    { id: "rat_5", rating: 4.3, review: "Mực khô chất lượng tốt, vị đậm đà. Mua về làm quà rất ý nghĩa.", user: { name: 'Hoàng Thị Mai', image: profile_pic2 }, productId: "prod_5", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', product: { name: 'Mực Khô Loại 1', category: 'Hải Sản Khô', id: 'prod_5' } },
    { id: "rat_6", rating: 5.0, review: "Nước mắm Cái Rồng thơm ngon, chính gốc. Gia đình dùng rất hài lòng!", user: { name: 'Vũ Đức Thắng', image: profile_pic3 }, productId: "prod_6", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0700', product: { name: 'Nước Mắm Cái Rồng', category: 'Đặc Sản', id: 'prod_6' } },
]

export const dummyStoreData = {
    id: "store_1",
    userId: "user_1",
    name: "Gian Hàng Hải Sản Hồng Gai",
    description: "Gian hàng chuyên cung cấp hải sản tươi sống, hải sản khô và đặc sản Quảng Ninh chính gốc từ phường Hồng Gai, Quảng Ninh.",
    username: "honggai",
    address: "Phường Hồng Gai, Quảng Ninh",
    status: "approved",
    isActive: true,
    logo: happy_store,
    email: "chosohonggai@example.com",
    contact: "+84 123 456 789",
    createdAt: "2025-09-04T09:04:16.189Z",
    updatedAt: "2025-09-04T09:04:44.273Z",
    user: {
        id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
        name: "Chợ Số Hồng Gai",
        email: "chosohonggai@example.com",
        image: gs_logo,
    }
}

export const productDummyData = [
    {
        id: "prod_1",
        name: "Tôm Hùm Tươi",
        description: "Tôm hùm tươi đánh bắt từ vùng biển Hạ Long. Thịt chắc, ngọt, giàu dinh dưỡng. Giao trong ngày, đảm bảo tươi sống khi đến tay khách hàng.",
        mrp: 650000,
        price: 580000,
        images: [product_img1, product_img2, product_img3],
        category: "Chợ Tươi",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 29 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 29 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_2",
        name: "Cua Biển Tươi",
        description: "Cua biển Hạ Long tươi sống, mai đầy, gạch nhiều. Được đánh bắt hằng ngày từ ngư dân địa phương phường Hồng Gai.",
        mrp: 450000,
        price: 390000,
        images: [product_img2],
        category: "Chợ Tươi",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 28 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 28 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_3",
        name: "Cá Song Tươi",
        description: "Cá song (cá mú) tươi nuôi lồng bè vùng biển Hạ Long. Thịt trắng, ngọt, ít xương. Thích hợp hấp, nướng hoặc lẩu.",
        mrp: 350000,
        price: 290000,
        images: [product_img3],
        category: "Chợ Tươi",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 27 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 27 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_4",
        name: "Mực Tươi Hạ Long",
        description: "Mực ống và mực nang tươi đánh từ vịnh Hạ Long. Da bóng mịn, màu trắng ngà. Phù hợp chiên, xào, nhúng lẩu hoặc nướng than.",
        mrp: 280000,
        price: 240000,
        images: [product_img4],
        category: "Chợ Tươi",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 26 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 26 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_5",
        name: "Chả Mực Hạ Long",
        description: "Chả mực truyền thống Hạ Long, được làm từ mực tươi 100%, giã tay theo phương pháp truyền thống. Đặc sản nổi tiếng nhất của Quảng Ninh.",
        mrp: 220000,
        price: 180000,
        images: [product_img5],
        category: "Đặc Sản",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_6",
        name: "Hải Sản Khô Hồng Gai",
        description: "Bộ hải sản khô tổng hợp gồm mực khô, tôm khô, cá khô phơi nắng tự nhiên. Hộp quà đẹp, phù hợp biếu tặng.",
        mrp: 380000,
        price: 320000,
        images: [product_img6],
        category: "Hải Sản Khô",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_7",
        name: "Trà Hoa Vàng",
        description: "Trà hoa vàng Quảng Ninh — loại trà quý hiếm, được thu hái từ rừng nguyên sinh Ba Chẽ. Giàu chất chống oxy hóa, tốt cho tim mạch và sức khỏe.",
        mrp: 450000,
        price: 380000,
        images: [product_img7],
        category: "Trà & Thảo Mộc",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 24 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 24 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_8",
        name: "Nước Mắm Cái Rồng",
        description: "Nước mắm truyền thống Cái Rồng — Vân Đồn, được ủ từ cá cơm biển Quảng Ninh trong 12–18 tháng. Vị ngọt dịu, hương thơm đặc trưng.",
        mrp: 95000,
        price: 75000,
        images: [product_img8],
        category: "Đặc Sản",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 23 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 23 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_9",
        name: "Mực Khô Loại 1",
        description: "Mực khô loại 1 phơi nắng tự nhiên, không chất bảo quản. Mực dày, trắng vàng, thơm đặc trưng. Thích hợp nướng than hoặc làm snack.",
        mrp: 320000,
        price: 280000,
        images: [product_img9],
        category: "Hải Sản Khô",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 22 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 22 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_10",
        name: "Ruốc Tôm Biển",
        description: "Ruốc tôm biển Quảng Ninh — làm từ tôm biển tươi, xay nhuyễn và sấy khô giữ nguyên hương vị. Dùng ăn cơm, cháo hoặc làm gia vị.",
        mrp: 130000,
        price: 110000,
        images: [product_img10],
        category: "Đặc Sản",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 21 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 21 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_11",
        name: "Đồ Thủ Công Mỹ Nghệ",
        description: "Sản phẩm thủ công từ vỏ sò, san hô và đá quý Quảng Ninh. Mỗi sản phẩm là tác phẩm độc đáo của nghệ nhân địa phương, phù hợp trang trí và làm quà.",
        mrp: 185000,
        price: 150000,
        images: [product_img11],
        category: "Thủ Công Mỹ Nghệ",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 20 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 20 2025 14:51:25 GMT+0700',
    },
    {
        id: "prod_12",
        name: "Rượu Ba Kích",
        description: "Rượu ba kích Quảng Ninh — ngâm từ củ ba kích tím tự nhiên vùng Đông Triều. Bổ thận, tráng gân cốt, tăng cường sinh lực. Quà tặng ý nghĩa cho người thân.",
        mrp: 280000,
        price: 230000,
        images: [product_img12],
        category: "Đặc Sản",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700',
        updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0700',
    }
]

// title/description là mảng [vi, en, zh] — dịch tại chỗ hiển thị bằng t(...) trong OurSpec.jsx
export const ourSpecsData = [
    {
        title: ["Miễn Phí Vận Chuyển", "Free Shipping", "免费配送"],
        description: [
            "Giao hàng miễn phí toàn quốc cho đơn từ 200.000đ. Hải sản tươi giao trong ngày tại Hồng Gai và lân cận.",
            "Free nationwide delivery on orders from 200,000đ. Fresh seafood delivered same-day in Hong Gai and nearby areas.",
            "订单满 200,000đ 全国免费配送。鸿基及周边地区新鲜海鲜当日送达。",
        ],
        icon: SendIcon, accent: '#05DF72'
    },
    {
        title: ["Đổi Trả 7 Ngày", "7-Day Returns", "7天退换"],
        description: [
            "Không hài lòng? Đổi trả dễ dàng trong vòng 7 ngày kể từ ngày nhận hàng. Cam kết hoàn tiền 100%.",
            "Not satisfied? Easy returns within 7 days of delivery. 100% money-back guarantee.",
            "不满意？收货后 7 天内可轻松退换。承诺 100% 退款。",
        ],
        icon: ClockFadingIcon, accent: '#FF8904'
    },
    {
        title: ["Hỗ Trợ 24/7", "24/7 Support", "24/7 支持"],
        description: [
            "Đội ngũ tư vấn sẵn sàng phục vụ mọi lúc. Liên hệ Zalo, điện thoại hoặc chat trực tiếp.",
            "Our support team is ready anytime. Reach us via Zalo, phone or live chat.",
            "客服团队随时待命。可通过 Zalo、电话或在线聊天联系我们。",
        ],
        icon: HeadsetIcon, accent: '#A684FF'
    },
]

export const addressDummyData = {
    id: "addr_1",
    userId: "user_1",
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    street: "45 Lê Thánh Tông",
    city: "Hạ Long",
    state: "Quảng Ninh",
    zip: "200000",
    country: "Việt Nam",
    phone: "0912345678",
    createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0700',
}

export const couponDummyData = [
    { code: "HONGGAI20", description: "Giảm 20% cho khách hàng mới", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
    { code: "HONGGAI10", description: "Giảm 10% cho khách hàng mới", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:50.653Z" },
    { code: "GIAMGIA20", description: "Giảm 20% cho tất cả", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:00.811Z" },
    { code: "GIAMGIA10", description: "Giảm 10% cho tất cả", discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:21.811Z" },
    { code: "THANHVIEN", description: "Giảm 10% cho thành viên", discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: "2027-03-06T00:00:00.000Z", createdAt: "2025-08-22T11:38:20.194Z" },
]

export const dummyUserData = {
    id: "user_31dQbH27HVtovbs13X2cmqefddM",
    name: "Khách Hàng",
    email: "khachhang@example.com",
    image: gs_logo,
    cart: {}
}

export const orderDummyData = [
    {
        id: "cmemm75h5001jtat89016h1p3",
        total: 1160000,
        status: "DELIVERED",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        storeId: "cmemkqnzm000htat8u7n8cpte",
        addressId: "cmemm6g95001ftat8omv9b883",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:15:03.929Z",
        updatedAt: "2025-08-22T09:15:50.723Z",
        isCouponUsed: true,
        coupon: dummyRatingsData[2],
        orderItems: [
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "prod_1", quantity: 1, price: 580000, product: productDummyData[0] },
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "prod_5", quantity: 1, price: 580000, product: productDummyData[4] },
        ],
        address: addressDummyData,
        user: dummyUserData
    },
    {
        id: "cmemm6jv7001htat8vmm3gxaf",
        total: 960000,
        status: "DELIVERED",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        storeId: "cmemkqnzm000htat8u7n8cpte",
        addressId: "cmemm6g95001ftat8omv9b883",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:14:35.923Z",
        updatedAt: "2025-08-22T09:15:52.535Z",
        isCouponUsed: true,
        coupon: couponDummyData[0],
        orderItems: [
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_2", quantity: 1, price: 390000, product: productDummyData[1] },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_7", quantity: 1, price: 380000, product: productDummyData[6] },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_9", quantity: 1, price: 280000, product: productDummyData[8] },
        ],
        address: addressDummyData,
        user: dummyUserData
    }
]

export const storesDummyData = [
    {
        id: "cmemkb98v0001tat8r1hiyxhn",
        userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
        name: "Gian Hàng Hải Sản Hồng Gai",
        description: "Chuyên cung cấp hải sản tươi, hải sản khô và đặc sản Quảng Ninh chính gốc",
        username: "honggai",
        address: "Phường Hồng Gai, Quảng Ninh",
        status: "approved",
        isActive: true,
        logo: gs_logo,
        email: "chosohonggai@example.com",
        contact: "+84 123 456 789",
        createdAt: "2025-08-22T08:22:16.189Z",
        updatedAt: "2025-08-22T08:22:44.273Z",
        user: dummyUserData,
    },
    {
        id: "cmemkqnzm000htat8u7n8cpte",
        userId: "user_31dQbH27HVtovbs13X2cmqefddM",
        name: "Đặc Sản Quảng Ninh",
        description: "Chuyên quà tặng đặc sản Quảng Ninh: trà hoa vàng, rượu ba kích, đồ thủ công mỹ nghệ.",
        username: "dacsan-qn",
        address: "Phường Hồng Gai, Quảng Ninh",
        status: "approved",
        isActive: true,
        logo: happy_store,
        email: "dacsanqn@example.com",
        contact: "+84 987 654 321",
        createdAt: "2025-08-22T08:34:15.155Z",
        updatedAt: "2025-08-22T08:34:47.162Z",
        user: dummyUserData,
    }
]

export const dummyAdminDashboardData = {
    "orders": 6,
    "stores": 2,
    "products": 12,
    "revenue": "7250000",
    "allOrders": [
        { "createdAt": "2025-08-20T08:46:58.239Z", "total": 580000 },
        { "createdAt": "2025-08-22T08:46:21.818Z", "total": 390000 },
        { "createdAt": "2025-08-22T08:45:59.587Z", "total": 180000 },
        { "createdAt": "2025-08-23T09:15:03.929Z", "total": 1160000 },
        { "createdAt": "2025-08-23T09:14:35.923Z", "total": 960000 },
        { "createdAt": "2025-08-23T11:44:29.713Z", "total": 230000 },
        { "createdAt": "2025-08-24T09:15:03.929Z", "total": 580000 },
        { "createdAt": "2025-08-24T09:14:35.923Z", "total": 390000 },
        { "createdAt": "2025-08-24T11:44:29.713Z", "total": 280000 },
        { "createdAt": "2025-08-24T11:56:29.713Z", "total": 150000 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 110000 },
        { "createdAt": "2025-08-25T09:15:03.929Z", "total": 450000 },
        { "createdAt": "2025-08-25T09:14:35.923Z", "total": 320000 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 240000 },
        { "createdAt": "2025-08-25T11:56:29.713Z", "total": 185000 },
        { "createdAt": "2025-08-25T11:30:29.713Z", "total": 380000 }
    ]
}

export const dummyStoreDashboardData = {
    "ratings": dummyRatingsData,
    "totalOrders": 2,
    "totalEarnings": 2120000,
    "totalProducts": 12
}
