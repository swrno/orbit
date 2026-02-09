import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { 
  Bold, Italic, Strikethrough, Code, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote,
  Undo, Redo, SeparatorHorizontal, CheckSquare, Underline as UnderlineIcon
} from 'lucide-react';
import { ToggleButton, ToggleButtonGroup, Paper, Divider, Box } from "@mui/material";

interface TiptapEditorProps {
  workspaceId: string;
  pageId: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <Paper 
        elevation={0}
        sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.paper',
            p: 1
        }}
    >
      <ToggleButtonGroup
        size="small"
        aria-label="history"
        sx={{ flexWrap: 'wrap', gap: 0.5, border: 'none' }}
      >
        <ToggleButton
          value="undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          aria-label="undo"
          sx={{ border: 'none', borderRadius: 1 }}
        >
          <Undo size={16} />
        </ToggleButton>
        <ToggleButton
          value="redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          aria-label="redo"
          sx={{ border: 'none', borderRadius: 1 }}
        >
          <Redo size={16} />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

      <ToggleButtonGroup
        size="small"
        aria-label="text formatting"
        sx={{ flexWrap: 'wrap', gap: 0.5, border: 'none' }}
      >
        <ToggleButton
          value="bold"
          selected={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="bold"
          sx={{ border: 'none', borderRadius: 1 }}
        >
          <Bold size={16} />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="italic"
          sx={{ border: 'none', borderRadius: 1 }}
        >
          <Italic size={16} />
        </ToggleButton>
        <ToggleButton
          value="underline"
          selected={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="underline"
          sx={{ border: 'none', borderRadius: 1 }}
        >
          <UnderlineIcon size={16} />
        </ToggleButton>
        <ToggleButton
          value="strike"
          selected={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="strike"
          sx={{ border: 'none', borderRadius: 1 }}
        >
          <Strikethrough size={16} />
        </ToggleButton>
        
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <ToggleButton
            value="h1"
            selected={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label="heading 1"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <Heading1 size={16} />
        </ToggleButton>
        <ToggleButton
            value="h2"
            selected={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="heading 2"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <Heading2 size={16} />
        </ToggleButton>
        <ToggleButton
            value="h3"
            selected={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label="heading 3"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <Heading3 size={16} />
        </ToggleButton>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <ToggleButton
            value="bulletList"
            selected={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="bullet list"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <List size={16} />
        </ToggleButton>
        <ToggleButton
            value="orderedList"
            selected={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="ordered list"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <ListOrdered size={16} />
        </ToggleButton>
        <ToggleButton
            value="taskList"
            selected={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            aria-label="task list"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <CheckSquare size={16} />
        </ToggleButton>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <ToggleButton
            value="codeBlock"
            selected={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            aria-label="code block"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <Code size={16} />
        </ToggleButton>
        <ToggleButton
            value="blockquote"
            selected={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="quote"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <Quote size={16} />
        </ToggleButton>
        <ToggleButton
            value="horizontalRule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            aria-label="horizontal rule"
            sx={{ border: 'none', borderRadius: 1 }}
        >
            <SeparatorHorizontal size={16} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  )
}

export function TiptapEditor({ workspaceId, pageId }: TiptapEditorProps) {
  const { workspaces, updatePage } = useAppStore();
  const { user } = useAuth();
  const workspace = workspaces.find((w) => w.id === workspaceId);
  
  // Computed values
  const group = workspace?.teams.find(g => g.pages.some(p => p.id === pageId));
  const page = group?.pages.find(p => p.id === pageId);

  // Refs for stable access in callbacks
  const userRef = useRef(user);
  const workspacesRef = useRef(workspaces);
  const updatePageRef = useRef(updatePage);

  useEffect(() => {
    userRef.current = user;
    workspacesRef.current = workspaces;
    updatePageRef.current = updatePage;
  }, [user, workspaces, updatePage]);

  // Debounced update function
  const debouncedUpdate = useDebouncedCallback((html: string) => {
    const currentUser = userRef.current;
    const currentWorkspaces = workspacesRef.current;
    const currentUpdatePage = updatePageRef.current;

    if (!currentUser) return; // Don't save if not logged in

    const ws = currentWorkspaces.find(w => w.id === workspaceId);
    const grp = ws?.teams.find(g => g.pages.some(p => p.id === pageId));
    const pg = grp?.pages.find(p => p.id === pageId);

    if (ws && grp && pg) {
       currentUpdatePage(workspaceId, grp.id, pg.id, { content: html }, currentUser.uid, currentUser.email);
    }
  }, 1000);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type '/' for commands…",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 mx-auto focus:outline-none min-h-[500px] max-w-[800px]',
      },
    },
    content: page?.content || '', 
    immediatelyRender: false, 
    onUpdate: ({ editor }) => {
       debouncedUpdate(editor.getHTML());
    },
  });

  // Local state for title to ensure smooth typing
  const [title, setTitle] = useState(page?.title || '');

  // Sync title from store if it changes externally
  useEffect(() => {
    if (page?.title !== undefined) {
      setTitle(page.title);
    }
  }, [page?.title]);

  // Effect to update content if page changes externally or on navigation
  useEffect(() => {
    if (editor && page && editor.getHTML() !== page.content) {
         // simple check to avoid loops, though risky with formatting. Only rely on initial key for strictness.
    }
  }, [pageId, editor]);

  if (!editor || !page) {
      return null;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
       {/* Menu Bar Fixed at Top */}
       <MenuBar editor={editor} />

       <div className="flex-1 overflow-y-auto" onClick={() => editor.chain().focus().run()}>
         <div className="max-w-4xl mx-auto py-10 px-6 relative z-0">
             <EditorContent editor={editor} />
         </div>
       </div>
    </div>
  );
}
