
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function MicrosoftCredentialsForm() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the Edge Function to update Microsoft credentials
      const { error } = await supabase.functions.invoke('update-microsoft-credentials', {
        method: 'POST',
        body: { 
          clientId,
          clientSecret,
          redirectUri
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Settings updated",
        description: "Microsoft credentials have been updated successfully.",
      });
      
      // Reset form
      setClientId("");
      setClientSecret("");
      setRedirectUri("");
    } catch (err: any) {
      console.error("Error updating credentials:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update Microsoft credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Update Microsoft Credentials</CardTitle>
        <CardDescription>
          Enter your new Microsoft App Registration credentials to enable both personal and organizational accounts
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input 
              id="client-id" 
              placeholder="Enter your Microsoft Client ID" 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The Application (client) ID from your Azure Portal App Registration
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input 
              id="client-secret" 
              type="password"
              placeholder="Enter your Microsoft Client Secret" 
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The secret value you created in Certificates & secrets section
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="redirect-uri">Redirect URI</Label>
            <Input 
              id="redirect-uri" 
              placeholder="https://afezcrm.com/inbox" 
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The redirect URI you configured in your app registration
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Credentials
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
