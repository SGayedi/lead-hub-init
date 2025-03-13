
import React from "react";
import { format } from "date-fns";
import { TableRow, TableCell } from "@/components/ui/table";
import { OutlookEmail } from "@/hooks/useOutlookEmails";

interface EmailRowProps {
  email: OutlookEmail;
}

export function EmailRow({ email }: EmailRowProps) {
  return (
    <TableRow 
      className={`cursor-pointer ${!email.read ? 'font-medium' : ''}`}
    >
      <TableCell className="font-medium">{email.sender_name}</TableCell>
      <TableCell>{email.subject}</TableCell>
      <TableCell className="text-right">
        {format(new Date(email.received_at), 'MMM d')}
      </TableCell>
    </TableRow>
  );
}
