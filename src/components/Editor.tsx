import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
// Image import করার দরকার নেই যদি ResizableImage ব্যবহার করেন
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { MathExtension } from '@/src/lib/MathExtension';
import { ResizableImage } from '@/src/lib/ResizableImage';

interface EditorProps {
  content: string;
  onChange?: (html: string) => void;
  className?: string;
  editorClass?: string;
  onInit?: (editor: any) => void;
  editable?: boolean;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, className, editorClass, onInit, editable = true }) => {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        // ডুপ্লিকেট এরর এড়াতে StarterKit থেকে এগুলো অফ করা হলো
        history: true,
        heading: { levels: [1, 2, 3] },
        horizontalRule: false,
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      ResizableImage.configure({
        allowBase64: true,
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-12 border-t-2 border-stone-200 border-dashed',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-stone-600 underline underline-offset-4 decoration-stone-300 hover:text-stone-900 transition-colors',
        },
      }),
      Placeholder.configure({
        placeholder: 'Begin your legacy on Papyrus...',
      }),
      MathExtension,
    ],
    content, // Initial content
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: editorClass || 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[700px] font-serif text-lg leading-[1.5] antialiased',
      },
    }
  });

  React.useEffect(() => {
    if (editor && onInit) {
      onInit(editor);
    }
  }, [editor, onInit]);

  // কন্টেন্ট আপডেট হ্যান্ডলার (এটি শুধু তখনই চলবে যখন কন্টেন্ট বাইরে থেকে পরিবর্তিত হবে)
  React.useEffect(() => {
    if (!editor) return;
    
    const isSame = editor.getHTML() === content;
    if (!isSame) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
