
import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Upload, Database, RefreshCcw, AlertTriangle } from "lucide-react";

export default function DataManagement() {
  const [exporting, setExporting] = useState(false);
  const [selectedTable, setSelectedTable] = useState("leads");
  const [logClearing, setLogClearing] = useState(false);

  const tables = [
    { name: "leads", label: "Leads" },
    { name: "opportunities", label: "Opportunities" },
    { name: "tasks", label: "Tasks" },
    { name: "meetings", label: "Meetings" },
    { name: "profiles", label: "User Profiles" },
  ];

  const handleExportTable = async () => {
    try {
      setExporting(true);
      
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*');
      
      if (error) throw error;
      
      // Convert data to CSV
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      // Create download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${data.length} records from ${selectedTable}`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || `Failed to export ${selectedTable}`);
    } finally {
      setExporting(false);
    }
  };

  const handleClearAuditLogs = async () => {
    if (!confirm("Are you sure you want to clear all audit logs? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLogClearing(true);
      
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Older than 30 days
      
      if (error) throw error;
      
      toast.success('Cleared audit logs older than 30 days');
    } catch (error: any) {
      console.error('Error clearing logs:', error);
      toast.error(error.message || 'Failed to clear audit logs');
    } finally {
      setLogClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">
          Import, export, and manage system data
        </p>
      </div>
      
      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="maintenance">System Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="export" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Table Data</CardTitle>
              <CardDescription>
                Export data from any table in CSV format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="table-select" className="text-sm font-medium">
                  Select Table to Export
                </label>
                <select
                  id="table-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  {tables.map(table => (
                    <option key={table.name} value={table.name}>
                      {table.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                onClick={handleExportTable} 
                disabled={exporting}
                className="w-full sm:w-auto"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export {selectedTable}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Import data into the system from CSV files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Data import functionality will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Maintenance</CardTitle>
              <CardDescription>
                Perform maintenance tasks on the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border p-4 rounded-md">
                <div className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-amber-500" />
                  <h3 className="text-base font-medium">Clean Audit Logs</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Remove old audit logs to improve system performance.
                  This will delete logs older than 30 days.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleClearAuditLogs}
                  disabled={logClearing}
                  className="mt-2"
                >
                  {logClearing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4 mr-2" />
                  )}
                  Clear Old Audit Logs
                </Button>
              </div>
              
              <div className="space-y-2 border p-4 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                  <h3 className="text-base font-medium">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  These actions are potentially destructive and cannot be undone.
                </p>
                <div className="grid gap-2 mt-2">
                  <Button variant="destructive" disabled>
                    Reset System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
