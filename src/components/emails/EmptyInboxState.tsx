
import React from "react";
import { Mail } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface EmptyInboxStateProps {
  message: string;
}

export function EmptyInboxState({ message }: EmptyInboxStateProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-center text-foreground">{message}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <Mail className="h-24 w-24 text-muted-foreground/30" />
      </CardContent>
    </Card>
  );
}
