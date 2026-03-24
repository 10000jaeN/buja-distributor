"use client";

import { CancelIcon, Logo } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import useMenuStore from "@/store/useMenuStore";
import Link from "next/link";
import { useEffect, useState } from "react";

const category = [
  { name: "기름", categoryDeps: ["참기름", "들기름"] },
  { name: "김", categoryDeps: ["도시락 김", "전장 김", "돌자반", "가루김"] },
  { name: "과자", categoryDeps: ["스낵"] },
  { name: "장류", categoryDeps: ["간장", "고추장", "된장", "쌈장"] },
  { name: "조미료", categoryDeps: ["고춧가루"] },
];

const SideBar = () => {
  const { isOpen, closeMenu } = useMenuStore();
  const [openCategory, setOpenCategory] = useState<boolean>(false);
  const { isLoggedIn, logout, user } = useAuthStore();

  console.log(user);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleClickLogout = () => {
    logout();
    closeMenu();
  };

  const onClickOpenCategory = () => {
    setOpenCategory(!openCategory);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-100 bg-black/50 transition-opacity duration-1000 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeMenu}
      />

      <aside
        className={`fixed top-0 left-0 z-100 h-full w-[80vw] bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Link href={"/"}>
            <Logo className="flex" />
          </Link>

          <CancelIcon className="h-5 w-5 cursor-pointer" onClick={closeMenu} />
        </div>
        {isLoggedIn && (
          <div className="mt-10 flex justify-between">
            <p>
              {user?.nickName} <br /> 여기에 어떤 정보를 넣을까요
            </p>
            <button onClick={handleClickLogout}>로그아웃(임시)</button>
          </div>
        )}
        <ul className="mt-10 flex cursor-pointer flex-col gap-1 font-bold">
          <li className="">
            <div className="flex justify-between hover:bg-gray-300">
              <p>카테고리</p>
              <p onClick={onClickOpenCategory} className="cursor-pointer">
                {openCategory ? "-" : "+"}
              </p>
            </div>
            <ul className="ml-3 font-medium">
              {openCategory &&
                category.map((cat) => (
                  <li>
                    <Link href={`/products?category=${cat.name}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </li>
          <li>베스트 상품</li>
          <li>무료배송</li>
        </ul>
      </aside>
    </>
  );
};

export default SideBar;
