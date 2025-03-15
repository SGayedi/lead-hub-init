
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Plus, Mail, Pencil, Trash2, Copy, Loader2,
  ArrowUpDown, Search, Filter 
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { format } from "date-fns";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplates() {
  const { adminUser } = useAdminAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    variables: "{}"
  });

  useEffect(() => {
    if (adminUser) {
      fetchTemplates();
    }
  }, [adminUser]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTemplates(
        templates.filter(template => 
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          template.subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTemplates(templates);
    }
  }, [templates, searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setTemplates(data || []);
      setFilteredTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      body: "",
      variables: "{}"
    });
    setCurrentTemplate(null);
    setFormMode('create');
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      variables: JSON.stringify(template.variables || {}, null, 2)
    });
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      
      toast.success('Email template deleted');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUser) return;
    
    try {
      setIsSubmitting(true);
      
      let variables: Record<string, string>;
      try {
        variables = JSON.parse(formData.variables);
      } catch (error) {
        toast.error('Invalid JSON in variables field');
        return;
      }
      
      if (formMode === 'create') {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: formData.name,
            subject: formData.subject,
            body: formData.body,
            variables,
            created_by: adminUser.id
          });
        
        if (error) throw error;
        
        toast.success('Email template created');
      } else {
        // Update existing template
        if (!currentTemplate) return;
        
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            body: formData.body,
            variables
          })
          .eq('id', currentTemplate.id);
        
        if (error) throw error;
        
        toast.success('Email template updated');
      }
      
      resetForm();
      setDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body: template.body,
      variables: JSON.stringify(template.variables || {}, null, 2)
    });
    setFormMode('create');
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage email templates used throughout the system
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        {format(new Date(template.updated_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(template)}
                            title="Edit Template"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDuplicateTemplate(template)}
                            title="Duplicate Template"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteTemplate(template.id)}
                            title="Delete Template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {searchTerm ? 'No templates found matching your search' : 'No email templates yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Create Email Template' : 'Edit Email Template'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'create' 
                ? 'Create a new email template for system notifications'
                : 'Update the existing email template'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  name="body"
                  required
                  rows={8}
                  value={formData.body}
                  onChange={handleInputChange}
                  placeholder="You can use variables like {{firstName}} that will be replaced when the email is sent."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="variables">Template Variables (JSON)</Label>
                <Textarea
                  id="variables"
                  name="variables"
                  rows={4}
                  value={formData.variables}
                  onChange={handleInputChange}
                  placeholder='{"firstName": "User first name", "companyName": "Company name"}'
                />
                <p className="text-xs text-muted-foreground">
                  Define variables that can be used in the template. Format: {"{"}"variableName": "description"{"}"}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {formMode === 'create' ? 'Create Template' : 'Update Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
