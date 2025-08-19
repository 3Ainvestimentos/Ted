
"use client";

import type { ContentItem, ContentStatus } from '@/types';
import { MOCK_CONTENT_ITEMS } from '@/lib/constants';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ContentCalendarContextType {
  contentItems: ContentItem[];
  addContentItem: (item: Omit<ContentItem, 'id' | 'lastUpdate'>) => void;
  updateContentItemStatus: (itemId: string, newStatus: ContentStatus) => void;
}

const ContentCalendarContext = createContext<ContentCalendarContextType | undefined>(undefined);

export const ContentCalendarProvider = ({ children }: { children: ReactNode }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(MOCK_CONTENT_ITEMS);

  const addContentItem = useCallback((itemData: Omit<ContentItem, 'id' | 'lastUpdate'>) => {
    setContentItems(prev => {
        const newItem: ContentItem = {
            ...itemData,
            id: `content-${Date.now()}`,
            lastUpdate: new Date().toISOString(),
        };
        return [...prev, newItem];
    });
  }, []);

  const updateContentItemStatus = useCallback((itemId: string, newStatus: ContentStatus) => {
    setContentItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, status: newStatus, lastUpdate: new Date().toISOString() } : item
      )
    );
  }, []);

  return (
    <ContentCalendarContext.Provider value={{ contentItems, addContentItem, updateContentItemStatus }}>
      {children}
    </ContentCalendarContext.Provider>
  );
};

export const useContentCalendar = () => {
  const context = useContext(ContentCalendarContext);
  if (context === undefined) {
    throw new Error('useContentCalendar must be used within a ContentCalendarProvider');
  }
  return context;
};
