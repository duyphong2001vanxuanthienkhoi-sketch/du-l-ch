import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Chợ Số Hồng Gai - Gian Hàng",
    description: "Quản lý gian hàng trên Chợ Số Hồng Gai",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
