
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LockInfo {
  locked: boolean;
  locked_by?: {
    id: string;
    name: string;
    email: string;
  };
  locked_at?: string;
  expires_at?: string;
}

export function useRecordLocks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const acquireLock = useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      lockDuration = 15
    }: { 
      entityType: string; 
      entityId: string; 
      lockDuration?: number;
    }) => {
      const { data, error } = await supabase
        .rpc('acquire_record_lock', {
          entity_type_param: entityType,
          entity_id_param: entityId,
          lock_duration_minutes: lockDuration
        });
      
      if (error) throw error;
      
      // Return true if lock was acquired, false otherwise
      return data as boolean;
    },
    onSuccess: (acquired, { entityType, entityId }) => {
      if (acquired) {
        queryClient.invalidateQueries({ queryKey: ['recordLock', entityType, entityId] });
      }
    },
    onError: (error) => {
      console.error('Error acquiring lock:', error);
      toast.error('Failed to acquire record lock');
    }
  });

  const releaseLock = useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId 
    }: { 
      entityType: string; 
      entityId: string;
    }) => {
      const { data, error } = await supabase
        .rpc('release_record_lock', {
          entity_type_param: entityType,
          entity_id_param: entityId
        });
      
      if (error) throw error;
      
      // Return true if lock was released, false otherwise
      return data as boolean;
    },
    onSuccess: (released, { entityType, entityId }) => {
      if (released) {
        queryClient.invalidateQueries({ queryKey: ['recordLock', entityType, entityId] });
      }
    },
    onError: (error) => {
      console.error('Error releasing lock:', error);
      toast.error('Failed to release record lock');
    }
  });

  const checkLock = (entityType: string, entityId: string) => {
    return useQuery({
      queryKey: ['recordLock', entityType, entityId],
      queryFn: async () => {
        const { data, error } = await supabase
          .rpc('is_record_locked_by_other', {
            entity_type_param: entityType,
            entity_id_param: entityId
          });
        
        if (error) throw error;
        
        // Cast to LockInfo with type assertion to handle JSON response
        return data as unknown as LockInfo;
      },
      enabled: !!entityType && !!entityId && !!user,
      refetchInterval: 30000, // Refetch every 30 seconds
    });
  };

  return {
    acquireLock,
    releaseLock,
    checkLock
  };
}
