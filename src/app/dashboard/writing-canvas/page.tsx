'use client';

import { useState, useEffect } from 'react';
import { PenSquare, Trash2, Download, Save, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/use-locale';

export default function WritingCanvasPage() {
  const [content, setContent] = useState('');
  const [fileId, setFileId] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('writing-canvas-content');
      const savedFileId = localStorage.getItem('writing-canvas-fileId');

      if (savedFileId && savedContent !== null) {
        setContent(savedContent);
        setOriginalContent(savedContent);
        setFileId(savedFileId);
      }
    } catch (e) {
      console.error("Could not read from localStorage", e);
      toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.fileLoadError') });
    }
  }, [toast, t]);

  const hasUnsavedChanges = content !== originalContent;

  const handleClear = () => {
    if (!content) return;
    if (confirm(t('toast.unsavedChanges'))) {
      setContent('');
       toast({
          title: t('toast.success'),
          description: t('toast.canvasCleared'),
        });
    }
  };

  const handleDownload = () => {
    if (!content.trim()) {
      toast({
        variant: 'destructive',
        title: t('toast.error'),
        description: t('toast.emptyContent'),
      });
      return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-t' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Use file name if available, otherwise default
    let fileName = 'documento.txt';
    try {
        fileName = localStorage.getItem('writing-canvas-fileName') || 'documento.txt';
    } catch(e) {
        console.error("Could not access filename from localStorage", e);
    }
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: t('toast.success'),
      description: t('toast.downloadStarted', { fileName: fileName }),
    });
  };

  const handleSave = () => {
    if (!fileId) return;

    try {
        const filesRaw = localStorage.getItem('files-data-v3');
        if (filesRaw) {
            const files = JSON.parse(filesRaw);
            const updatedFiles = files.map((file: any) => 
                file.id === fileId ? { ...file, content: content, lastModified: new Date().toISOString().split('T')[0] } : file
            );
            localStorage.setItem('files-data-v3', JSON.stringify(updatedFiles));
            setOriginalContent(content); // Update original content to reflect saved state
            toast({ title: t('toast.success'), description: t('toast.changesSaved') });
        } else {
            throw new Error('No se encontraron datos de archivos.');
        }
    } catch (e) {
        console.error("Could not save to localStorage", e);
        toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.fileSaveError') });
    }
  };
  
  const handleBackToFiles = () => {
    if (hasUnsavedChanges) {
      if (confirm(t('toast.unsavedChanges'))) {
        router.push('/dashboard/files');
      }
    } else {
      router.push('/dashboard/files');
    }
  }


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
         <div className="flex items-center gap-2">
            <PenSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold">{t('writing.title')}</h1>
            {hasUnsavedChanges && <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">{t('writing.unsavedChanges')}</span>}
        </div>
        <div className="flex items-center gap-2">
          {fileId && <Button onClick={handleSave} disabled={!hasUnsavedChanges}><Save className="mr-2 h-4 w-4" />{t('writing.saveButton')}</Button>}
          <Button variant="outline" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />{t('writing.downloadButton')}</Button>
          <Button variant="ghost" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4 text-red-500" />{t('writing.clearButton')}</Button>
          <Button variant="secondary" onClick={handleBackToFiles}><History className="mr-2 h-4 w-4" />{t('writing.backButton')}</Button>
        </div>
      </div>
       <div className="flex-grow w-full h-full">
         <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('writing.placeholder')}
            className="w-full h-full text-base resize-none"
         />
       </div>
    </div>
  );
}
