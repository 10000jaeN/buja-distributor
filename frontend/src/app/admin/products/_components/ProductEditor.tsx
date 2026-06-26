"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Palette,
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
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded p-1.5 transition-colors disabled:opacity-30 ${
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

const PRESET_COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#1285ff",
  "#8b5cf6",
];

export function ProductEditor({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef<string>(value);

  const [linkInput, setLinkInput] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        inline: false,
        HTMLAttributes: { class: "max-w-full mx-auto block" },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-brand-blue underline cursor-pointer" },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ],
    content: value,
    onTransaction: () => {
      forceUpdate((v) => v + 1);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      prevValueRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "min-h-[300px] px-4 py-3 focus:outline-none",
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
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !editor) return;
    try {
      const urls = await Promise.all(files.map(uploadToS3));
      editor
        .chain()
        .focus()
        .insertContent(urls.map((src) => ({ type: "image", attrs: { src } })))
        .run();
    } catch {
      // 이미지 업로드 실패 시 무시
    }
    e.target.value = "";
  };

  const handleLinkButtonClick = () => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const existingHref = editor.getAttributes("link").href ?? "";
    setLinkInput(existingHref);
  };

  const handleLinkSubmit = () => {
    if (!editor || linkInput === null) return;
    if (linkInput.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkInput.trim() })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkInput(null);
  };

  const currentColor = editor?.getAttributes("textStyle").color ?? "#000000";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {/* 실행 취소 / 다시 실행 */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          title="실행 취소"
          disabled={!editor?.can().undo()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          title="다시 실행"
          disabled={!editor?.can().redo()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* 텍스트 스타일 */}
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
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline")}
          title="밑줄"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive("strike")}
          title="취소선"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* 제목 */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive("heading") && editor.getAttributes("heading").level === 2}
          title="제목 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive("heading") && editor.getAttributes("heading").level === 3}
          title="제목 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* 텍스트 정렬 */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          active={editor?.isActive({ textAlign: "left" })}
          title="왼쪽 정렬"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          active={editor?.isActive({ textAlign: "center" })}
          title="가운데 정렬"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          active={editor?.isActive({ textAlign: "right" })}
          title="오른쪽 정렬"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* 목록 */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          title="순서 없는 목록"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          title="번호 목록"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* 인용구 / 구분선 */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
          title="인용구"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* 링크 */}
        <ToolbarButton
          onClick={handleLinkButtonClick}
          active={editor?.isActive("link")}
          title="링크 삽입"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* 이미지 */}
        <ToolbarButton
          onClick={() => fileRef.current?.click()}
          title="이미지 삽입 (여러 장 선택 가능)"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        <Divider />

        {/* 글자 색상 */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColorPicker((v) => !v)}
            title="글자 색상"
          >
            <div className="flex flex-col items-center gap-0.5">
              <Palette className="h-4 w-4" />
              <div
                className="h-1 w-4 rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </div>
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-2.5 shadow-md">
              <div className="flex gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => {
                      editor?.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    className="h-5 w-5 rounded-full border border-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  ref={colorInputRef}
                  type="color"
                  defaultValue={currentColor}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                  onChange={(e) => {
                    editor?.chain().focus().setColor(e.target.value).run();
                  }}
                />
                <span className="text-xs text-gray-400">직접 선택</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="text-left text-xs text-gray-400 hover:text-gray-600"
              >
                색상 초기화
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 링크 입력 바 */}
      {linkInput !== null && (
        <div className="flex items-center gap-2 border-b border-gray-200 bg-blue-50 px-3 py-2">
          <LinkIcon className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
          <input
            type="url"
            autoFocus
            placeholder="https://example.com"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLinkSubmit();
              if (e.key === "Escape") setLinkInput(null);
            }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="rounded px-2 py-0.5 text-xs font-medium text-brand-blue hover:bg-blue-100"
          >
            확인
          </button>
          <button
            type="button"
            onClick={() => setLinkInput(null)}
            className="rounded px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-100"
          >
            취소
          </button>
        </div>
      )}

      {/* 에디터 */}
      <div
        className="h-[80vh] overflow-y-auto"
        onClick={() => setShowColorPicker(false)}
      >
        <EditorContent editor={editor} className="product-editor" />
      </div>
    </div>
  );
}
