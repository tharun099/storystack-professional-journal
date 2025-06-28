import { useState, useCallback } from 'react';
import { CareerEntry, FilterOptions } from '../types';
import { useLocalStorage } from './useLocalStorage';

const defaultFilters: FilterOptions = {
  dateRange: { start: '', end: '' },
  tags: [],
  categories: [],
  projects: [],
  searchQuery: ''
};

export function useCareerEntries() {
  const [entries, setEntries] = useLocalStorage<CareerEntry[]>('career-entries', []);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const addEntry = useCallback((entry: Omit<CareerEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: CareerEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, [setEntries]);

  const updateEntry = useCallback((id: string, updates: Partial<CareerEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    ));
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    setSelectedEntries(prev => prev.filter(entryId => entryId !== id));
  }, [setEntries]);

  const filteredEntries = entries.filter(entry => {
    if (filters.searchQuery && !entry.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !entry.impact.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.categories.length > 0 && !filters.categories.includes(entry.category)) {
      return false;
    }
    
    if (filters.tags.length > 0 && !filters.tags.some(tag => entry.tags.includes(tag))) {
      return false;
    }
    
    if (filters.projects.length > 0 && !filters.projects.includes(entry.project)) {
      return false;
    }
    
    if (filters.dateRange.start && entry.date < filters.dateRange.start) {
      return false;
    }
    
    if (filters.dateRange.end && entry.date > filters.dateRange.end) {
      return false;
    }
    
    return true;
  });

  return {
    entries: filteredEntries,
    allEntries: entries,
    filters,
    setFilters,
    selectedEntries,
    setSelectedEntries,
    addEntry,
    updateEntry,
    deleteEntry
  };
}