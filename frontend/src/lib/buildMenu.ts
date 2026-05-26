import { Category } from "@/types/product";
import { MenuItem } from "@/types/menu";

export const buildMenu = (categories: Category[]): MenuItem[] => [
  {
    label: "카테고리",
    children: categories.map((cat) => ({
      label: cat.parent,
      href: `/products?category=${cat.parent}`,
      children: cat.children.map((child) => ({
        label: child,
        href: `/products?category=${cat.parent}&sub=${child}`,
      })),
    })),
  },
  { label: "베스트 상품", href: "/best" },
  { label: "무료배송", href: "/free-shipping" },
];
