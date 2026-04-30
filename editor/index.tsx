'use client';
import type { Content, Editor } from '@tiptap/react';
import { forwardRef, useCallback } from 'react';
import type { UseTiptapEditorOptions } from './hooks/useTiptapEditor';
import ExtensionKit from './kit';
import MenuBar from './MenuBar';
import LinkMenu from './menus/LinkMenu';
import TableMenu from './menus/TableMenu';
import TiptapProvider from './Provider';
import Resizer from './Resizer';
import StatusBar from './StatusBar';
import { throttle } from './utils/throttle';
export type TiptapEditorRef = {
  getInstance: () => Editor | null;
};

interface TiptapEditorProps {
  ssr?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  initialContent?: Content;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  output?: 'html' | 'json';
  hideMenuBar?: boolean;
  hideStatusBar?: boolean;
  hideBubbleMenu?: boolean;
  containerClass?: string;
  menuBarClass?: string;
  contentClass?: string;
  onContentChange?: (value: Content) => void;
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  (
    {
      ssr = false,
      output = 'html',
      readonly = false,
      disabled = false,
      initialContent,
      placeholder,
      hideMenuBar = false,
      hideStatusBar = false,
      hideBubbleMenu = true,
      onContentChange,
    },
    ref,
  ) => {
    const isEditable = !readonly && !disabled;
    const displayBubbleMenu = isEditable && hideBubbleMenu;

    const throttledUpdate = throttle(
      (value: Content) => onContentChange?.(value),
      1500,
    );

    const handleUpdate = useCallback(
      (editor: Editor) => {
        const content =
          output === 'html'
            ? editor.isEmpty
              ? ''
              : editor.getHTML()
            : editor.getJSON();
        throttledUpdate(content);
      },
      [throttledUpdate, output],
    );

    const editorOptions: UseTiptapEditorOptions = {
      ref,
      placeholder,
      extensions: ExtensionKit,
      content: initialContent,
      editable: isEditable,
      immediatelyRender: !ssr,
      shouldRerenderOnTransaction: false,
      autofocus: false,
      onUpdate: ({ editor }) => handleUpdate(editor),
      editorProps: {
        attributes: {
          class:
            'prose relative w-full flex-1 whitespace-pre-wrap py-7 outline-hidden dark:prose-invert *:mt-5 [&>*:first-child]:mt-0 h-96',
        },
      },
    };

    const menus = displayBubbleMenu && (
      <>
        <LinkMenu />
        <TableMenu />
      </>
    );

    return (
      <TiptapProvider
        editorOptions={editorOptions}
        slotBefore={!hideMenuBar && <MenuBar />}
        slotAfter={!hideStatusBar && <StatusBar />}
      >
        {menus}
        <Resizer />
      </TiptapProvider>
    );
  },
);

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;
