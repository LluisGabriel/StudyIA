'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Folder, File, Upload, Trash2, Edit, X, Check, FileImage, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/hooks/use-locale';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  lastModified: string;
  previewUrl?: string;
  isImage: boolean;
  content?: string; // For text files from writing canvas
}

const initialFiles: FileItem[] = [
  { id: 'folder-1', name: 'Proyecto de Física', type: 'folder', size: '3.2 MB', lastModified: '2024-07-20', isImage: false },
  { id: 'file-1', name: 'Ensayo_Final.docx', type: 'file', size: '1.5 MB', lastModified: '2024-07-18', isImage: false },
  { id: 'file-2', name: 'Datos de Laboratorio.csv', type: 'file', size: '500 KB', lastModified: '2024-07-15', isImage: false },
  { id: 'file-3', name: 'Diagrama_Celular.png', type: 'file', size: '750 KB', lastModified: '2024-07-12', isImage: true, previewUrl: 'https://placehold.co/400x300.png' },
];

function FilesManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem('files-data-v3');
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      } else {
        setFiles(initialFiles);
      }
    } catch (e) {
      console.error("Failed to parse files from localStorage", e);
      toast({
        variant: 'destructive',
        title: t('toast.error'),
        description: t('toast.fileLoadError'),
      });
      setFiles(initialFiles);
    }
  }, [toast, t]);

  useEffect(() => {
    try {
      localStorage.setItem('files-data-v3', JSON.stringify(files));
    } catch (e) {
      console.error("Failed to save files to localStorage", e);
      toast({
        variant: 'destructive',
        title: t('toast.error'),
        description: t('toast.fileSaveError'),
      });
    }
  }, [files, toast, t]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const newFilesPromises: Promise<FileItem>[] = Array.from(uploadedFiles).map(file => {
        const isImage = file.type.startsWith('image/');
        const isText = file.type === 'text/plain';

        return new Promise((resolve) => {
            const fileItem: FileItem = {
                id: `file-${Date.now()}-${Math.random()}`,
                name: file.name,
                type: 'file',
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                lastModified: new Date().toISOString().split('T')[0],
                isImage: isImage,
                content: ''
            };
            if (isImage) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    fileItem.previewUrl = reader.result as string;
                    resolve(fileItem);
                };
                reader.readAsDataURL(file);
            } else if (isText) {
                 const reader = new FileReader();
                 reader.onloadend = () => {
                    fileItem.content = reader.result as string;
                    resolve(fileItem);
                 };
                 reader.readAsText(file);
            }
            else {
                resolve(fileItem);
            }
        });
      });
      
      Promise.all(newFilesPromises).then(newFiles => {
          setFiles(prev => [...prev, ...newFiles]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
      })
    }
  };
  
  const createNewFolder = () => {
    const folderName = prompt(t('files.newFolderNamePrompt'));
    if (folderName && folderName.trim()) {
      const trimmedName = folderName.trim();
      if (files.some(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.nameDuplicated') });
        return;
      }
      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name: trimmedName,
        type: 'folder',
        size: '0 KB',
        lastModified: new Date().toISOString().split('T')[0],
        isImage: false,
      };
      setFiles(prev => [...prev, newFolder]);
    } else if (folderName !== null) {
      toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.folderNameInvalid') });
    }
  }

  const deleteFile = (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;

    if (confirm(t('toast.deleteConfirm', { itemName: fileToDelete.name }))) {
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    }
  };

  const startEditing = (file: FileItem) => {
    setEditingId(file.id);
    setNewName(file.name);
    setOriginalName(file.name);
  };
  
  const saveNewName = (fileId: string) => {
    const trimmedName = newName.trim();
    if (trimmedName === originalName) {
        setEditingId(null);
        return;
    }
    if (!trimmedName) {
        toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.nameInvalid') });
        return;
    }
    if (files.some(f => f.id !== fileId && f.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.nameDuplicated') });
        return;
    }
    setFiles(files.map(file => (file.id === fileId ? { ...file, name: trimmedName } : file)));
    setEditingId(null);
    setNewName('');
    setOriginalName('');
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'file' && file.name.endsWith('.txt')) {
      try {
        localStorage.setItem('writing-canvas-content', file.content || '');
        localStorage.setItem('writing-canvas-fileId', file.id);
        localStorage.setItem('writing-canvas-fileName', file.name);
        router.push('/dashboard/writing-canvas');
      } catch (e) {
          console.error("Could not write to localStorage", e);
          toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.fileLoadError') });
      }
    }
    // Could add other file type handlers here
  };
  
  const query = searchParams.get('q');
  const filteredFiles = files.filter(file => !query || file.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" />
            <div>
                <CardTitle className="font-headline">{t('files.title')}</CardTitle>
                {query && <CardDescription>{t('files.description', { query: query })}</CardDescription>}
            </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewFolder} variant="outline">
            <Folder className="mr-2 h-4 w-4" /> {t('files.newFolder')}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> {t('files.uploadFile')}
          </Button>
          <Input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*,text/plain,.csv,.doc,.docx,.pdf" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>{t('files.tableHeaderName')}</TableHead>
                <TableHead>{t('files.tableHeaderSize')}</TableHead>
                <TableHead>{t('files.tableHeaderModified')}</TableHead>
                <TableHead className="text-right">{t('files.tableHeaderActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.length > 0 ? filteredFiles.map(file => (
                <TableRow key={file.id} onDoubleClick={() => handleFileClick(file)} className={file.name.endsWith('.txt') ? 'cursor-pointer hover:bg-accent' : ''}>
                  <TableCell>
                    {file.type === 'folder' ? <Folder className="text-primary" /> : (
                        file.name.endsWith('.txt') ? <FileText /> : (
                            file.isImage && file.previewUrl && typeof file.previewUrl === 'string' ? (
                                <div className="relative h-8 w-8">
                                    <Image src={file.previewUrl} alt={file.name} layout="fill" objectFit="cover" className="rounded-sm" />
                                </div>
                            ) : (
                                <File />
                            )
                        )
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {editingId === file.id ? (
                       <Input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveNewName(file.id)} onBlur={() => saveNewName(file.id)} className="h-8"/>
                    ) : (
                      file.name
                    )}
                  </TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.lastModified}</TableCell>
                  <TableCell className="text-right">
                    {editingId === file.id ? (
                        <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onMouseDown={() => saveNewName(file.id)}>
                                <Check className="h-4 w-4 text-green-600"/>
                            </Button>
                             <Button variant="ghost" size="icon" onMouseDown={() => setEditingId(null)}>
                                <X className="h-4 w-4 text-red-600"/>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => startEditing(file)}>
                                <Edit className="h-4 w-4 text-muted-foreground hover:text-primary"/>
                            </Button>
                             <Button variant="ghost" size="icon" onClick={() => deleteFile(file.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                            </Button>
                        </div>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Search className="w-10 h-10 text-muted-foreground"/>
                            <p className="font-semibold">{t('files.noFilesFound')}</p>
                            <p className="text-muted-foreground text-sm">{query ? t('files.noFilesHint') : t('files.noFilesInitial')}</p>
                        </div>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FilesPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <FilesManager />
        </Suspense>
    );
}