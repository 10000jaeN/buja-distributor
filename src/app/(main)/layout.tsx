export const dynamic = "force-dynamic";

import AuthProvider from "@/components/provider/AuthProvider";
import Footer from "@/components/common/Footer";
import Nav from "@/components/common/Nav";
import SideBar from "@/components/common/SideBar";
import { categoryService } from "@/api/categoryService";
import { buildMenu } from "@/lib/buildMenu";
import { Toaster } from "sonner";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await categoryService.getCategories().catch(() => []);
  const menu = buildMenu(categories);

  return (
    <div className="flex min-h-screen flex-col">
      <AuthProvider>
        <Nav menu={menu} />
        <SideBar menu={menu} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}
