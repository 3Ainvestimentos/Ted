
"use client";

import { useEffect, useCallback } from 'react';
import { useNotes } from '@/contexts/notes-context';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

export function NotesEditor() {
  const { noteContent, setNoteContent, saveNote, isLoading, isSaving } = useNotes();
  const { toast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(() => {
        saveNote().then(() => {
            toast({
              title: "Salvo!",
              description: "Suas anotações foram salvas.",
              duration: 2000,
            });
        });
    }, 1500), // 1.5 seconds debounce delay
    [saveNote, toast]
  );
  
  useEffect(() => {
    if (!isLoading) {
        debouncedSave();
    }
    // Cleanup function to cancel any pending saves on unmount
    return () => {
        debouncedSave.cancel();
    };
  }, [noteContent, isLoading, debouncedSave]);

  if (isLoading) {
    return <Skeleton className="w-full flex-grow rounded-lg" />;
  }

  return (
    <div className="relative flex-grow">
      <Textarea
        placeholder="Comece a digitar suas anotações aqui..."
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        className="w-full h-full resize-none text-base p-6"
      />
      {isSaving && (
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          Salvando...
        </div>
      )}
    </div>
  );
}
