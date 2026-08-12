'use client'
import { Suspense } from "react";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
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
            {/* Thanh tiến trình cuộn + nút lên đầu trang (góc trái) */}
            <LenDauTrang />
        </>
    );
}
