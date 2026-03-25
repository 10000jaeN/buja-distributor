import AuthProvider from "@/components/provider/AuthProvider";
import Footer from "@/components/common/Footer";
import Nav from "@/components/common/Nav";
import SideBar from "@/components/common/SideBar";
import { productService } from "@/api/productService";
import { buildMenu } from "@/lib/buildMenu";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await productService.getCategories().catch(() => []);
  const menu = buildMenu(categories);

  return (
    <div className="flex min-h-screen flex-col">
      <AuthProvider>
        <Nav menu={menu} />
        <SideBar menu={menu} />
        <main className="flex-1">{children}</main>
        <Footer />
      </AuthProvider>
    </div>
  );
}
