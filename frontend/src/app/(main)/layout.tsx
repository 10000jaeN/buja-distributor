export const dynamic = "force-dynamic";

import AuthProvider from "@/components/provider/AuthProvider";
import Footer from "@/components/common/Footer";
import Nav from "@/components/common/Nav";
import SideBar from "@/components/common/SideBar";
import ScrollToTop from "@/components/common/ScrollToTop";
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
        <ScrollToTop />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              success: "!bg-blue-50 !border-brand-blue !text-brand-blue [&_[data-icon]]:text-brand-blue",
            },
          }}
        />
      </AuthProvider>
    </div>
  );
}
