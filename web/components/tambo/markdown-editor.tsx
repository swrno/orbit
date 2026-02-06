"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Copy, 
  Check, 
  PenLine, 
  Eye,
  Maximize2,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  initialContent?: string;
  title?: string;
}

export function MarkdownEditor({ initialContent = "", title }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<'edit' | 'preview'>(initialContent ? 'preview' : 'edit'); // Edit if empty, Preview if content exists
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync state with prop updates (handles streaming/late content)
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      if (mode === 'edit' && initialContent.length > 0 && content.length === 0) {
         setMode('preview'); // Switch to preview if content arrives and we were empty
      }
    }
  }, [initialContent]);

  // Simple copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // Basic Markdown Renderer (since we lack a heavy parser lib)
  // Handles logic: Headers, Bold, Italic, Lists, Code Blocks
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-muted-foreground italic">No content</p>;

    const lines = text.split('\n');
    let inCodeBlock = false;
    
    return lines.map((line, idx) => {
      // Code Blocks
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (inCodeBlock) return <div key={idx} className="bg-slate-950 text-slate-50 p-3 rounded-t-md mt-4 font-mono text-xs overflow-x-auto border-b border-slate-800">{line.replace('```', '')}</div>;
        return <div key={idx} className="bg-slate-950 h-2 rounded-b-md mb-4"></div>;
      }
      if (inCodeBlock) {
        return <div key={idx} className="bg-slate-950 text-slate-300 px-3 font-mono text-xs leading-relaxed whitespace-pre">{line}</div>;
      }

      // Headers
      if (line.startsWith('# ')) return <h1 key={idx} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={idx} className="text-lg font-bold mt-3 mb-2">{line.substring(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={idx} className="text-base font-bold mt-2 mb-1">{line.substring(4)}</h3>;

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm my-1">
            {formatInline(line.trim().substring(2))}
          </li>
        );
      }
      if (/^\d+\. /.test(line.trim())) {
         return (
          <li key={idx} className="ml-4 list-decimal text-sm my-1">
            {formatInline(line.trim().replace(/^\d+\. /, ''))}
          </li>
        );
      }

      // Blockquote
      if (line.startsWith('> ')) {
        return <blockquote key={idx} className="border-l-4 border-primary/30 pl-3 italic text-muted-foreground my-2">{formatInline(line.substring(2))}</blockquote>;
      }

      // Horizontal Rule
      if (line.trim() === '---') return <hr key={idx} className="my-4 border-border" />;

      // Empty lines
      if (!line.trim()) return <div key={idx} className="h-2"></div>;

      // Paragraphs
      return <p key={idx} className="text-sm leading-relaxed mb-1">{formatInline(line)}</p>;
    });
  };

  // Helper for inline formatting (Bold, Italic, Code)
  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg shadow-sm w-full overflow-hidden flex flex-col transition-all duration-300",
      isExpanded ? "fixed inset-4 z-50 h-[calc(100vh-2rem)] shadow-2xl" : "max-h-[500px]"
    )}>
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between p-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 px-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{title || "AI Document Editor"}</span>
        </div>
        
        <div className="flex items-center gap-1 bg-background rounded-md border p-0.5 shadow-sm">
           <button
             onClick={() => setMode('preview')}
             className={cn(
               "px-2 py-1 text-xs rounded-sm transition-colors flex items-center gap-1.5 font-medium",
               mode === 'preview' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
             )}
           >
             <Eye className="h-3.5 w-3.5" /> Preview
           </button>
           <button
             onClick={() => setMode('edit')}
             className={cn(
               "px-2 py-1 text-xs rounded-sm transition-colors flex items-center gap-1.5 font-medium",
               mode === 'edit' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
             )}
           >
             <PenLine className="h-3.5 w-3.5" /> Edit
           </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy Content"
            aria-label="Copy to Clipboard"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          
          <div className="h-4 w-px bg-border mx-1" />

          <button
             onClick={() => setIsExpanded(!isExpanded)}
             className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
             title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto min-h-[300px] relative">
        {mode === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 text-sm font-mono leading-relaxed bg-background resize-none focus:outline-none"
            placeholder="Type your markdown here..."
            autoFocus
          />
        ) : (
          <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
             {renderMarkdown(content)}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="p-2 bg-muted/10 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground px-4">
         <div>
            {content.length} chars
         </div>
         <div>
            Markdown Supported
         </div>
      </div>
    </div>
  );
}
