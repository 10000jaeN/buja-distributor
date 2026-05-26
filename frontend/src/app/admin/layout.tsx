import AuthProvider from "@/components/provider/AuthProvider";
import { Toaster } from "sonner";
import AdminShell from "./AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
