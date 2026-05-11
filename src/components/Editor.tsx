import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
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
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6 space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6 space-y-2',
          },
        },
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
    content,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
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

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
