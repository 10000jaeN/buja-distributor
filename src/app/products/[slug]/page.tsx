import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

const productsDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

  console.log("현재 슬러그: ", slug);

  if (!slug || slug === "undefined") {
    redirect("/error404");
  }

  return (
    <main>
      <div aria-label="ToolBar" className="sticky flex justify-between px-4">
        <button>상세정보</button>
        <button>Q&A</button>
        <button>+ 장바구니</button>
        <button>구매하기</button>
      </div>
      gg
    </main>
  );
};

export default productsDetailPage;
