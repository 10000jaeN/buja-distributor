"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Image as ImageIcon,
  Eye,
  PenLine,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadToS3 } from "./ProductForm";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active ? "bg-brand-blue text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-gray-200" />;
}

export function ProductEditor({ value, onChange }: Props) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const fileRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        inline: false,
        HTMLAttributes: { class: "max-w-full mx-auto block" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      prevValueRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const url = await uploadToS3(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // 이미지 업로드 실패 시 무시
    }
    e.target.value = "";
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* 툴바 */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {mode === "edit" && (
          <>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive("bold")}
              title="굵게"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive("italic")}
              title="기울임"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor?.isActive("heading", { level: 2 })}
              title="제목 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor?.isActive("heading", { level: 3 })}
              title="제목 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
              title="목록"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() => fileRef.current?.click()}
              title="이미지 삽입"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </>
        )}

        <button
          type="button"
          onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
          className={`ml-auto flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            mode === "preview"
              ? "bg-brand-blue text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {mode === "edit" ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              미리보기
            </>
          ) : (
            <>
              <PenLine className="h-3.5 w-3.5" />
              편집
            </>
          )}
        </button>
      </div>

      {/* 에디터 / 미리보기 */}
      {mode === "edit" ? (
        <EditorContent editor={editor} className="product-editor" />
      ) : (
        <div
          className="product-content min-h-[200px] px-4 py-3"
          dangerouslySetInnerHTML={{
            __html: value || '<p class="empty-preview">내용이 없습니다.</p>',
          }}
        />
      )}
    </div>
  );
}
