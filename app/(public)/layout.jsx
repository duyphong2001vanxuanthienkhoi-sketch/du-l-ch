'use client'
import { Suspense } from "react";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import BongBongChat from "@/components/BongBongChat";
import LenDauTrang from "@/components/LenDauTrang";

export default function PublicLayout({ children }) {

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
            {/* Chừa chỗ cho thanh dưới (điện thoại + máy tính bảng) để không che nội dung cuối trang */}
            <div className="h-14 lg:hidden" />
            <Suspense fallback={null}>
                <BottomNav />
            </Suspense>
            {/* Bong bóng chat nổi kiểu Messenger — gộp cả khách lẫn chủ quán */}
            <BongBongChat />
            {/* Thanh tiến trình cuộn + nút lên đầu trang (góc trái) */}
            <LenDauTrang />
        </>
    );
}
