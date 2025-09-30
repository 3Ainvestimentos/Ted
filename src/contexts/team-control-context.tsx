
"use client";

import type { Collaborator, RemunerationHistory, PositionHistory } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { MOCK_COLLABORATORS } from '@/lib/constants';

type CollaboratorData = Omit<Collaborator, 'id'>;

interface TeamControlContextType {
  collaborators: Collaborator[];
  isLoading: boolean;
  refetch: () => void;
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => Promise<void>;
  updateCollaborator: (id: string, collaborator: Partial<Omit<Collaborator, 'id'>>) => Promise<void>;
  deleteCollaborator: (id: string, email: string) => Promise<void>;
  updateCollaboratorPermissions: (id: string, permissionKey: string, value: boolean) => Promise<void>;
  updateCollaboratorHistory: (collaboratorId: string, historyType: 'remunerationHistory' | 'positionHistory', data: any[]) => Promise<void>;
  addHistoryEntry: (collaboratorId: string, historyType: 'remunerationHistory' | 'positionHistory', entry: RemunerationHistory | PositionHistory) => Promise<void>;
  bulkUpdateRemuneration: (csvData: any[]) => Promise<void>;
  bulkUpdatePositions: (csvData: any[]) => Promise<void>;
}

const TeamControlContext = createContext<TeamControlContextType | undefined>(undefined);

export const TeamControlProvider = ({ children }: { children: ReactNode }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(MOCK_COLLABORATORS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCollaborators = useCallback(async () => {
    setIsLoading(true);
    // Simulate async fetch
    setTimeout(() => {
        setCollaborators(MOCK_COLLABORATORS);
        setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  // The following functions now operate on the in-memory state for demonstration purposes.
  // In a real application, they would interact with a database.

  const addCollaborator = async (collaboratorData: CollaboratorData) => {
    console.log("Adding collaborator (local state):", collaboratorData);
    const newCollaborator = { 
        ...collaboratorData, 
        id: `mock-${Date.now()}`,
        permissions: {}, 
        remunerationHistory: [], 
        positionHistory: [] 
    };
    setCollaborators(prev => [...prev, newCollaborator]);
  };

  const updateCollaborator = async (id: string, collaboratorData: Partial<CollaboratorData>) => {
    console.log(`Updating collaborator ${id} (local state):`, collaboratorData);
    setCollaborators(prev => prev.map(c => c.id === id ? { ...c, ...collaboratorData } : c));
  };

  const deleteCollaborator = async (id: string, email: string) => {
    console.log(`Deleting collaborator ${id} (local state)`);
    setCollaborators(prev => prev.filter(c => c.id !== id));
  };

  const updateCollaboratorPermissions = useCallback(async (id: string, permissionKey: string, value: boolean) => {
    const validPermissionKey = permissionKey.startsWith('/') ? permissionKey.substring(1) : permissionKey;
    setCollaborators(prev => 
        prev.map(c => 
            c.id === id 
                ? { ...c, permissions: { ...(c.permissions || {}), [validPermissionKey]: value } }
                : c
        )
    );
  }, []);

  const updateCollaboratorHistory = async (collaboratorId: string, historyType: 'remunerationHistory' | 'positionHistory', data: any[]) => {
      setCollaborators(prev => prev.map(c => c.id === collaboratorId ? { ...c, [historyType]: data } : c));
  };

  const addHistoryEntry = async (collaboratorId: string, historyType: 'remunerationHistory' | 'positionHistory', entry: RemunerationHistory | PositionHistory) => {
    setCollaborators(prev => prev.map(c => {
        if (c.id === collaboratorId) {
            const history = c[historyType] || [];
            return { ...c, [historyType]: [...history, entry] };
        }
        return c;
    }));
  }
  
  const bulkUpdateRemuneration = async (csvData: any[]) => {
    // This is a mock implementation
    console.log("Bulk updating remuneration with CSV data:", csvData);
  }
  
  const bulkUpdatePositions = async (csvData: any[]) => {
    // This is a mock implementation
    console.log("Bulk updating positions with CSV data:", csvData);
  }


  return (
    <TeamControlContext.Provider value={{ 
        collaborators, 
        isLoading, 
        refetch: fetchCollaborators, 
        addCollaborator, 
        updateCollaborator, 
        deleteCollaborator, 
        updateCollaboratorPermissions, 
        updateCollaboratorHistory, 
        addHistoryEntry, 
        bulkUpdateRemuneration, 
        bulkUpdatePositions 
    }}>
      {children}
    </TeamControlContext.Provider>
  );
};

export const useTeamControl = () => {
  const context = useContext(TeamControlContext);
  if (context === undefined) {
    throw new Error('useTeamControl must be used within a TeamControlProvider');
  }
  return context;
};
