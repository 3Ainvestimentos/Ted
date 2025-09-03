
"use client";

import type { Note } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';

interface NotesContextType {
  noteContent: string;
  setNoteContent: (content: string) => void;
  saveNote: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  lastUpdated: Date | null;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getNoteDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'notes', user.uid);
  }, [user]);

  const fetchNote = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const noteDocRef = getNoteDocRef();
    if (!noteDocRef) return;

    try {
      const docSnap = await getDoc(noteDocRef);
      if (docSnap.exists()) {
        const noteData = docSnap.data() as Note;
        setNoteContent(noteData.content);
        if (noteData.lastUpdated) {
             setLastUpdated((noteData.lastUpdated as Timestamp).toDate());
        }
      } else {
        setNoteContent('');
        setLastUpdated(null);
      }
    } catch (error) {
      console.error("Error fetching note: ", error);
      toast({ variant: 'destructive', title: "Erro ao carregar anotações" });
    } finally {
      setIsLoading(false);
    }
  }, [user, getNoteDocRef, toast]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const saveNote = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    const noteDocRef = getNoteDocRef();
    if (!noteDocRef) {
        setIsSaving(false);
        return;
    }
    
    // Create a new date object for the current time
    const newLastUpdated = new Date();

    const noteData: Omit<Note, 'lastUpdated'> & { lastUpdated: any } = {
        userId: user.uid,
        content: noteContent,
        lastUpdated: serverTimestamp(),
    };
    
    try {
      await setDoc(noteDocRef, noteData, { merge: true });
      // On success, update the local state with the new timestamp
      setLastUpdated(newLastUpdated);
    } catch (error) {
      console.error("Error saving note: ", error);
      toast({ variant: 'destructive', title: "Erro ao salvar anotação" });
    } finally {
      setIsSaving(false);
    }
  }, [user, noteContent, getNoteDocRef, toast]);

  return (
    <NotesContext.Provider value={{ noteContent, setNoteContent, saveNote, isLoading, isSaving, lastUpdated }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
