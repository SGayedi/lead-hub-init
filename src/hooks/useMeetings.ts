
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting, MeetingType } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database meeting to frontend Meeting type
const convertDbMeetingToMeeting = (dbMeeting: any): Meeting => ({
  id: dbMeeting.id,
  title: dbMeeting.title,
  description: dbMeeting.description,
  meetingType: dbMeeting.meeting_type,
  startTime: dbMeeting.start_time,
  endTime: dbMeeting.end_time,
  location: dbMeeting.location,
  leadId: dbMeeting.lead_id,
  createdBy: dbMeeting.created_by,
  outcome: dbMeeting.outcome,
  createdAt: dbMeeting.created_at,
  updatedAt: dbMeeting.updated_at
});

interface MeetingFilter {
  type?: MeetingType;
  leadId?: string;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useMeetings(filter: MeetingFilter = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState(filter.searchTerm || '');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['meetings', filter, searchTerm, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase.from('meetings').select('*');
      
      if (filter.type) {
        query = query.eq('meeting_type', filter.type);
      }
      
      if (filter.leadId) {
        query = query.eq('lead_id', filter.leadId);
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (filter.startDate) {
        query = query.gte('start_time', filter.startDate.toISOString());
      }
      
      if (filter.endDate) {
        query = query.lte('start_time', filter.endDate.toISOString());
      }
      
      const { data, error } = await query.order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return data.map(convertDbMeetingToMeeting);
    },
    enabled: !!user
  });

  const createMeeting = useMutation({
    mutationFn: async (newMeeting: Omit<Meeting, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('meetings')
        .insert([{
          title: newMeeting.title,
          description: newMeeting.description,
          meeting_type: newMeeting.meetingType,
          start_time: newMeeting.startTime,
          end_time: newMeeting.endTime,
          location: newMeeting.location,
          lead_id: newMeeting.leadId,
          created_by: user.id,
          outcome: newMeeting.outcome
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create meeting: ${error.message}`);
    }
  });

  const updateMeeting = useMutation({
    mutationFn: async (meeting: Partial<Meeting> & { id: string }) => {
      const { id, ...updateFields } = meeting;
      
      // Convert camelCase to snake_case for database
      const dbFields: any = {};
      for (const [key, value] of Object.entries(updateFields)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        dbFields[snakeKey] = value;
      }
      
      const { error } = await supabase
        .from('meetings')
        .update(dbFields)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update meeting: ${error.message}`);
    }
  });

  const deleteMeeting = useMutation({
    mutationFn: async (meetingId: string) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete meeting: ${error.message}`);
    }
  });

  return {
    meetings: data || [],
    isLoading,
    error,
    refetch,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    searchTerm,
    setSearchTerm
  };
}
