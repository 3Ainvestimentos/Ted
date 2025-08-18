
"use client";

import type { Initiative, InitiativeStatus } from '@/types';
import { MOCK_INITIATIVES } from '@/lib/constants';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface InitiativesContextType {
  initiatives: Initiative[];
  addInitiative: (initiative: Omit<Initiative, 'id' | 'lastUpdate' | 'topicNumber'>) => void;
  updateInitiativeStatus: (initiativeId: string, newStatus: InitiativeStatus) => void;
}

const InitiativesContext = createContext<InitiativesContextType | undefined>(undefined);

export const InitiativesProvider = ({ children }: { children: ReactNode }) => {
  const [initiatives, setInitiatives] = useState<Initiative[]>(MOCK_INITIATIVES);

  const addInitiative = useCallback((initiativeData: Omit<Initiative, 'id' | 'lastUpdate' | 'topicNumber'>) => {
    setInitiatives(prev => {
        // Simple logic to find the next main topic number
        const mainTopics = prev.filter(i => !i.topicNumber.includes('.'));
        const nextTopicNumber = mainTopics.length > 0 ? (Math.max(...mainTopics.map(i => parseInt(i.topicNumber))) + 1).toString() : '1';
        
        const newInitiative: Initiative = {
            ...initiativeData,
            id: `task-${Date.now()}`,
            lastUpdate: new Date().toISOString(),
            topicNumber: nextTopicNumber,
            progress: 0, // Initiatives start with 0 progress
            keyMetrics: [], // Start with no metrics
        };
        return [...prev, newInitiative];
    });
  }, []);

  const updateInitiativeStatus = useCallback((initiativeId: string, newStatus: InitiativeStatus) => {
    setInitiatives(prev => 
      prev.map(init => 
        init.id === initiativeId ? { ...init, status: newStatus, lastUpdate: new Date().toISOString() } : init
      )
    );
  }, []);

  return (
    <InitiativesContext.Provider value={{ initiatives, addInitiative, updateInitiativeStatus }}>
      {children}
    </InitiativesContext.Provider>
  );
};

export const useInitiatives = () => {
  const context = useContext(InitiativesContext);
  if (context === undefined) {
    throw new Error('useInitiatives must be used within an InitiativesProvider');
  }
  return context;
};
