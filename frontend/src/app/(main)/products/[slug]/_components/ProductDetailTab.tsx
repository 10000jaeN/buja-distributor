import Image from "next/image";
import { FileText } from "lucide-react";
import { EmptyState } from "./EmptyState";

type ContentBlock = {
  type: "text" | "image";
  value: string;
};

type Props = {
  content?: string;
  contentBlock: ContentBlock[];
};

export function ProductDetailTab({ content, contentBlock }: Props) {
  if (content) {
    return (
      <div
        className="product-content px-4 py-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  if (contentBlock?.length) {
    return (
      <>
        {contentBlock.map((block, index) => {
          if (block.type === "image") {
            return (
              <Image
                key={index}
                src={block.value}
                alt={`상세페이지 이미지 ${index + 1}`}
                width={800}
                height={800}
                className="w-full"
              />
            );
          }
          return (
            <div
              key={index}
              className="px-4 py-5 text-sm leading-relaxed text-gray-700"
            >
              {block.value}
            </div>
          );
        })}
      </>
    );
  }

  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-gray-300" />}
      title="상세 정보가 아직 등록되지 않았습니다."
      description="상품 문의는 Q&A를 이용해 주세요."
    />
  );
}
