"use client";

import type { ProjectComment } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from './auth-context';

interface ProjectCommentsContextType {
  comments: ProjectComment[];
  addComment: (comment: Omit<ProjectComment, 'id' | 'timestamp' | 'readByAdmin' | 'readAt'>) => Promise<void>;
  markAsRead: (commentId: string) => Promise<void>;
  getUnreadCount: (projectId: string, itemId?: string, subItemId?: string) => number;
  getCommentsForEntity: (projectId: string, itemId?: string, subItemId?: string) => ProjectComment[];
  isLoading: boolean;
}

const ProjectCommentsContext = createContext<ProjectCommentsContextType | undefined>(undefined);

export const ProjectCommentsProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const commentsCollectionRef = collection(db, 'projectComments');

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(commentsCollectionRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectComment));
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments: ", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (commentData: Omit<ProjectComment, 'id' | 'timestamp' | 'readByAdmin' | 'readAt'>) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    const newComment = {
      ...commentData,
      timestamp: Timestamp.now(),
      readByAdmin: false,
    };
    
    await addDoc(commentsCollectionRef, newComment);
    fetchComments();
  };

  const markAsRead = async (commentId: string) => {
    if (!isAdmin) {
      throw new Error("Apenas administradores podem marcar comentários como lidos");
    }
    
    const commentDocRef = doc(db, 'projectComments', commentId);
    await updateDoc(commentDocRef, {
      readByAdmin: true,
      readAt: Timestamp.now(),
    });
    fetchComments();
  };

  const getUnreadCount = (projectId: string, itemId?: string, subItemId?: string): number => {
    return comments.filter(comment => {
      const matchesProject = comment.projectId === projectId;
      const matchesItem = itemId ? comment.itemId === itemId : !comment.itemId;
      const matchesSubItem = subItemId ? comment.subItemId === subItemId : !comment.subItemId;
      
      return matchesProject && matchesItem && matchesSubItem && !comment.readByAdmin;
    }).length;
  };

  const getCommentsForEntity = (projectId: string, itemId?: string, subItemId?: string): ProjectComment[] => {
    return comments.filter(comment => {
      const matchesProject = comment.projectId === projectId;
      const matchesItem = itemId ? comment.itemId === itemId : !comment.itemId;
      const matchesSubItem = subItemId ? comment.subItemId === subItemId : !comment.subItemId;
      
      return matchesProject && matchesItem && matchesSubItem;
    }).sort((a, b) => {
      // Ordenar por timestamp (mais recentes primeiro)
      const aTime = a.timestamp?.seconds || 0;
      const bTime = b.timestamp?.seconds || 0;
      return bTime - aTime;
    });
  };

  return (
    <ProjectCommentsContext.Provider value={{ 
      comments, 
      addComment, 
      markAsRead, 
      getUnreadCount, 
      getCommentsForEntity,
      isLoading 
    }}>
      {children}
    </ProjectCommentsContext.Provider>
  );
};

export const useProjectComments = () => {
  const context = useContext(ProjectCommentsContext);
  if (context === undefined) {
    throw new Error('useProjectComments must be used within a ProjectCommentsProvider');
  }
  return context;
};


