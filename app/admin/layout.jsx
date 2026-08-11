import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Chợ Số Hồng Gai - Quản Trị",
    description: "Trang quản trị Chợ Số Hồng Gai",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
