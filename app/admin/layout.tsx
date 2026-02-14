import "@/components/Admin/admin.css";
import AdminLayout from "@/components/Admin/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
