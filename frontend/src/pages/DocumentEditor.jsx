import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, Link as LinkIcon, Image as ImageIcon, 
  Table as TableIcon, Undo, Redo, Save, Download, FileText,
  Eye, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

// Toolbar button
const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors ${
      isActive 
        ? 'bg-primary/20 text-primary' 
        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={title}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export default function DocumentEditor() {
  const [documentName, setDocumentName] = useState('Document nou');
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: `
      <h1>Document nou</h1>
      <p>Bun venit la editorul E-DocPDF. Poți să scrii, să formatezi text, să adaugi imagini, tabele și multe altele.</p>
      <p>Acest editor este compatibil cu <strong>Microsoft Word</strong> – poți exporta documentul ca <strong>HTML</strong> (deschis direct în Word) sau ca <strong>PDF</strong>.</p>
      <ul>
        <li>Listă neordonată</li>
        <li>Text <em>italic</em> și <u>subliniat</u></li>
      </ul>
      <h2>Exemplu de tabel</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">Nume</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Funcție</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Ion Popescu</td>
            <td style="border: 1px solid #ccc; padding: 8px;">Manager</td>
          </tr>
        </tbody>
      </table>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Funcții pentru toolbar
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const setTextAlign = (align) => editor?.chain().focus().setTextAlign(align).run();
  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();

  const addImage = () => {
    const url = window.prompt('Introdu URL-ul imaginii:');
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Export ca HTML
  const exportAsHTML = () => {
    const htmlContent = editor?.getHTML();
    const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${documentName}</title></head>
<body>${htmlContent}</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName.replace(/[^a-z0-9]/gi, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document exportat ca HTML (poate fi deschis în Microsoft Word)');
  };

  // Export ca PDF via backend
  const exportAsPDF = async () => {
    if (!editor) return;
    setIsExporting(true);
    try {
      const htmlContent = editor.getHTML();
      const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${documentName}</title>
<style>body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.5; } 
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #ccc; padding: 8px; }</style>
</head>
<body>${htmlContent}</body>
</html>`;
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const file = new File([blob], 'document.html', { type: 'text/html' });
      const pdfBlob = await apiService.convertToPDF(file);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Document exportat ca PDF');
    } catch (error) {
      console.error(error);
      toast.error('Eroare la exportul PDF. Verifică backend-ul.');
    } finally {
      setIsExporting(false);
    }
  };

  // Încărcare fișier HTML
  const loadHTMLFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : content;
      editor?.commands.setContent(bodyContent);
      setDocumentName(file.name.replace(/\.html$/, ''));
      toast.success('Document încărcat cu succes');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="text-xl font-semibold w-64 bg-transparent border-none focus:ring-0 px-2"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
              Încarcă HTML
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".html,.htm" onChange={loadHTMLFile} />
            <Button variant="outline" size="sm" onClick={exportAsHTML}>
              <Save className="w-4 h-4 mr-2" /> Salvare HTML
            </Button>
            <Button variant="default" size="sm" onClick={exportAsPDF} disabled={isExporting}>
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} title="Previzualizare">
              {showPreview ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Card className="mb-4 sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-2 flex flex-wrap gap-1 border-b">
            <ToolbarButton onClick={undo} icon={Undo} title="Undo" />
            <ToolbarButton onClick={redo} icon={Redo} title="Redo" />
            <div className="w-px h-6 bg-border mx-1" />
            <ToolbarButton onClick={toggleBold} isActive={editor?.isActive('bold')} icon={Bold} title="Bold" />
            <ToolbarButton onClick={toggleItalic} isActive={editor?.isActive('italic')} icon={Italic} title="Italic" />
            <ToolbarButton onClick={toggleUnderline} isActive={editor?.isActive('underline')} icon={UnderlineIcon} title="Underline" />
            <ToolbarButton onClick={toggleStrike} isActive={editor?.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
            <div className="w-px h-6 bg-border mx-1" />
            <ToolbarButton onClick={toggleBulletList} isActive={editor?.isActive('bulletList')} icon={List} title="Bullet List" />
            <ToolbarButton onClick={toggleOrderedList} isActive={editor?.isActive('orderedList')} icon={ListOrdered} title="Numbered List" />
            <div className="w-px h-6 bg-border mx-1" />
            <ToolbarButton onClick={() => setTextAlign('left')} isActive={editor?.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Align Left" />
            <ToolbarButton onClick={() => setTextAlign('center')} isActive={editor?.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Center" />
            <ToolbarButton onClick={() => setTextAlign('right')} isActive={editor?.isActive({ textAlign: 'right' })} icon={AlignRight} title="Align Right" />
            <ToolbarButton onClick={() => setTextAlign('justify')} isActive={editor?.isActive({ textAlign: 'justify' })} icon={AlignJustify} title="Justify" />
            <div className="w-px h-6 bg-border mx-1" />
            <ToolbarButton onClick={addImage} icon={ImageIcon} title="Insert Image" />
            <ToolbarButton onClick={addTable} icon={TableIcon} title="Insert Table" />
            <ToolbarButton onClick={() => editor?.chain().focus().setLink({ href: 'https://' }).run()} icon={LinkIcon} title="Insert Link" />
          </CardContent>
        </Card>

        {/* Editor content / preview */}
        <div className="grid grid-cols-1 gap-4">
          {!showPreview ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm min-h-[600px]">
              <EditorContent editor={editor} className="prose max-w-none p-4" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-8 min-h-[600px] overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Editor compatibil cu Microsoft Word. Exportă ca HTML și deschide fișierul în Word pentru editare avansată.
        </p>
      </div>
    </div>
  );
}