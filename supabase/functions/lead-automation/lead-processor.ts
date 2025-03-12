
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import { Database } from '../_shared/database.types.ts';

export interface LeadAutomationConfig {
  highPriorityTaskDays: number;
  inactiveNotificationDays: number;
  archiveAfterDays: number;
}

// Default configuration
const DEFAULT_CONFIG: LeadAutomationConfig = {
  highPriorityTaskDays: 3,
  inactiveNotificationDays: 30,
  archiveAfterDays: 90
};

export class LeadProcessor {
  private supabase;
  private config: LeadAutomationConfig;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: Partial<LeadAutomationConfig> = {}
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async processHighPriorityLeads(): Promise<number> {
    const { data: highPriorityLeads, error } = await this.supabase
      .from('leads')
      .select('id, name, assigned_to')
      .eq('priority', 'high')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching high priority leads:', error);
      return 0;
    }

    let tasksCreated = 0;

    for (const lead of highPriorityLeads) {
      // Check if a task already exists for this lead
      const { data: existingTasks } = await this.supabase
        .from('tasks')
        .select('id')
        .eq('related_entity_id', lead.id)
        .eq('related_entity_type', 'lead')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingTasks && existingTasks.length > 0) {
        continue; // Skip if a pending task already exists
      }

      // Create a task with a deadline in 3 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + this.config.highPriorityTaskDays);

      const { error: insertError } = await this.supabase
        .from('tasks')
        .insert([
          {
            title: `Follow up with high priority lead: ${lead.name}`,
            description: 'This task was automatically created because the lead is marked as high priority.',
            assigned_to: lead.assigned_to, // Assign to the lead owner
            assigned_by: lead.assigned_to, // System created
            status: 'pending',
            priority: 'high',
            due_date: dueDate.toISOString(),
            related_entity_id: lead.id,
            related_entity_type: 'lead'
          }
        ]);

      if (insertError) {
        console.error('Error creating task for high priority lead:', insertError);
      } else {
        tasksCreated++;
      }
    }

    return tasksCreated;
  }

  async processInactiveLeads(): Promise<number> {
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - this.config.inactiveNotificationDays);
    
    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - this.config.archiveAfterDays);

    // Get inactive leads that need notification
    const { data: inactiveLeads, error: inactiveError } = await this.supabase
      .from('leads')
      .select('id, name, assigned_to, updated_at')
      .eq('status', 'active')
      .lt('updated_at', inactiveDate.toISOString())
      .gte('updated_at', archiveDate.toISOString());

    if (inactiveError) {
      console.error('Error fetching inactive leads:', inactiveError);
      return 0;
    }

    let notificationsCreated = 0;

    // Create notifications for inactive leads
    for (const lead of inactiveLeads) {
      // Check if a notification already exists for this lead's inactivity
      const { data: existingNotifications } = await this.supabase
        .from('notifications')
        .select('id')
        .eq('related_entity_id', lead.id)
        .eq('related_entity_type', 'lead')
        .eq('type', 'lead_inactive')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Within the last week
        .limit(1);

      if (existingNotifications && existingNotifications.length > 0) {
        continue; // Skip if a notification was already sent recently
      }

      const daysInactive = Math.floor(
        (Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Create notification for inactive lead
      const { error: notifError } = await this.supabase
        .from('notifications')
        .insert([
          {
            user_id: lead.assigned_to,
            title: 'Inactive Lead Reminder',
            content: `Lead "${lead.name}" has been inactive for ${daysInactive} days.`,
            type: 'lead_inactive',
            is_read: false,
            related_entity_id: lead.id,
            related_entity_type: 'lead'
          }
        ]);

      if (notifError) {
        console.error('Error creating notification for inactive lead:', notifError);
      } else {
        notificationsCreated++;
      }
    }

    return notificationsCreated;
  }

  async archiveOldLeads(): Promise<number> {
    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - this.config.archiveAfterDays);

    // Get leads that should be archived (inactive for 3+ months)
    const { data: archiveLeads, error: archiveError } = await this.supabase
      .from('leads')
      .select('id, name, assigned_to')
      .eq('status', 'active')
      .lt('updated_at', archiveDate.toISOString());

    if (archiveError) {
      console.error('Error fetching leads to archive:', archiveError);
      return 0;
    }

    let leadsArchived = 0;

    // Update leads to archived status
    for (const lead of archiveLeads) {
      const { error: updateError } = await this.supabase
        .from('leads')
        .update({ status: 'archived' })
        .eq('id', lead.id);

      if (updateError) {
        console.error('Error archiving lead:', updateError);
      } else {
        leadsArchived++;

        // Create notification about archiving
        await this.supabase
          .from('notifications')
          .insert([
            {
              user_id: lead.assigned_to,
              title: 'Lead Archived',
              content: `Lead "${lead.name}" was automatically archived due to inactivity.`,
              type: 'lead_archived',
              is_read: false,
              related_entity_id: lead.id,
              related_entity_type: 'lead'
            }
          ]);
      }
    }

    return leadsArchived;
  }

  async processAll(): Promise<{
    tasksCreated: number;
    notificationsCreated: number;
    leadsArchived: number;
  }> {
    const tasksCreated = await this.processHighPriorityLeads();
    const notificationsCreated = await this.processInactiveLeads();
    const leadsArchived = await this.archiveOldLeads();

    return {
      tasksCreated,
      notificationsCreated,
      leadsArchived
    };
  }
}
