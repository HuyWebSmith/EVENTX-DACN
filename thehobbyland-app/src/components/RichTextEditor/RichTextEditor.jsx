import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  LinkOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import "./RichTextEditor.css"; // Tạo CSS riêng cho toolbar

const RichTextEditor = ({ value = "", onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rte-content-area",
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Nhập URL ảnh:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="rte-container">
      <div className="rte-toolbar">
        <BoldOutlined
          className={`rte-icon ${editor.isActive("bold") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Đậm"
        />
        <ItalicOutlined
          className={`rte-icon ${editor.isActive("italic") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Nghiêng"
        />
        <UnderlineOutlined
          className={`rte-icon ${editor.isActive("underline") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Gạch chân"
        />
        <StrikethroughOutlined
          className={`rte-icon ${editor.isActive("strike") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Gạch ngang"
        />
        <UnorderedListOutlined
          className={`rte-icon ${
            editor.isActive("bulletList") ? "active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Danh sách không thứ tự"
        />
        <OrderedListOutlined
          className={`rte-icon ${
            editor.isActive("orderedList") ? "active" : ""
          }`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Danh sách có thứ tự"
        />
        <LinkOutlined
          className="rte-icon"
          onClick={() => {
            const url = window.prompt(
              "Nhập URL:",
              editor.getAttributes("link").href || "https://"
            );
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().setLink({ href: url }).run();
          }}
          title="Chèn link"
        />
        <PictureOutlined
          className="rte-icon"
          onClick={addImage}
          title="Chèn ảnh"
        />
        <UndoOutlined
          className="rte-icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác"
        />
        <RedoOutlined
          className="rte-icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại"
        />
      </div>

      <EditorContent editor={editor} className="rte-editor" />
    </div>
  );
};

export default RichTextEditor;
