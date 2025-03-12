
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processHighPriorityLeads() {
  // Get high priority leads that don't have tasks
  const { data: highPriorityLeads, error: leadsError } = await supabase
    .from('leads')
    .select('id, name, priority, created_at')
    .eq('priority', 'high')
    .eq('status', 'active');
  
  if (leadsError) {
    console.error('Error fetching high priority leads:', leadsError);
    return;
  }
  
  for (const lead of highPriorityLeads) {
    // Check if a task already exists for this lead
    const { data: existingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .eq('related_entity_id', lead.id)
      .eq('related_entity_type', 'lead');
    
    if (tasksError) {
      console.error('Error checking existing tasks:', tasksError);
      continue;
    }
    
    // If no task exists, create one with a 3-day deadline
    if (existingTasks.length === 0) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      
      // Get a user with investor_services role to assign the task
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'investor_services')
        .limit(1);
      
      if (usersError || !users.length) {
        console.error('Error finding a user to assign task:', usersError);
        continue;
      }
      
      const assignedTo = users[0].id;
      
      // Create the task
      const { error: createTaskError } = await supabase
        .from('tasks')
        .insert([{
          title: `Follow up on high priority lead: ${lead.name}`,
          description: 'This task was automatically created for a high priority lead.',
          assigned_to: assignedTo,
          assigned_by: assignedTo, // System-assigned
          status: 'pending',
          priority: 'high',
          due_date: dueDate.toISOString(),
          related_entity_id: lead.id,
          related_entity_type: 'lead'
        }]);
      
      if (createTaskError) {
        console.error('Error creating task:', createTaskError);
        continue;
      }
      
      // Create a notification for the assigned user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: assignedTo,
          title: 'High Priority Lead Assigned',
          message: `A task has been created for high priority lead: ${lead.name}`,
          type: 'lead_high_priority',
          related_entity_id: lead.id,
          related_entity_type: 'lead'
        }]);
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
      
      console.log(`Created task and notification for lead: ${lead.name}`);
    }
  }
}

async function processInactiveLeads() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Get leads that haven't been updated in 30 days and are still active
  const { data: inactiveLeads, error: leadsError } = await supabase
    .from('leads')
    .select('id, name, updated_at')
    .eq('status', 'active')
    .lt('updated_at', thirtyDaysAgo.toISOString());
  
  if (leadsError) {
    console.error('Error fetching inactive leads:', leadsError);
    return;
  }
  
  for (const lead of inactiveLeads) {
    // Get a user with investor_services role to notify
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'investor_services')
      .limit(1);
    
    if (usersError || !users.length) {
      console.error('Error finding a user to notify:', usersError);
      continue;
    }
    
    const userId = users[0].id;
    
    // Create a notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: 'Inactive Lead Alert',
        message: `Lead "${lead.name}" has been inactive for 30 days.`,
        type: 'lead_inactive',
        related_entity_id: lead.id,
        related_entity_type: 'lead'
      }]);
    
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
    
    console.log(`Created inactivity notification for lead: ${lead.name}`);
  }
}

async function archiveOldLeads() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // Get leads that haven't been updated in 3 months and are still active
  const { data: oldLeads, error: leadsError } = await supabase
    .from('leads')
    .select('id, name, updated_at')
    .eq('status', 'active')
    .lt('updated_at', threeMonthsAgo.toISOString());
  
  if (leadsError) {
    console.error('Error fetching old leads:', leadsError);
    return;
  }
  
  for (const lead of oldLeads) {
    // Update lead status to archived
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'archived' })
      .eq('id', lead.id);
    
    if (updateError) {
      console.error('Error archiving lead:', updateError);
      continue;
    }
    
    // Get users with investor_services role to notify
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'investor_services');
    
    if (usersError) {
      console.error('Error finding users to notify:', usersError);
      continue;
    }
    
    // Create notifications for each user
    for (const user of users) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title: 'Lead Archived',
          message: `Lead "${lead.name}" has been automatically archived due to 3 months of inactivity.`,
          type: 'lead_archived',
          related_entity_id: lead.id,
          related_entity_type: 'lead'
        }]);
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }
    
    console.log(`Archived lead: ${lead.name}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    console.log('Running lead automation tasks...');
    
    await processHighPriorityLeads();
    await processInactiveLeads();
    await archiveOldLeads();
    
    console.log('Lead automation tasks completed successfully');
    
    return new Response(
      JSON.stringify({ message: 'Lead automation completed successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in lead automation:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
