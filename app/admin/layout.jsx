import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Khám Phá Hồng Gai - Quản Trị",
    description: "Trang quản trị Khám Phá Hồng Gai",
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
