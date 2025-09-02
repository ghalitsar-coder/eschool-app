"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eschool } from "@/types/api";
import { Trash2, AlertTriangle } from "lucide-react";

interface DialogDeleteEschoolProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eschool: Eschool | null;
  onDelete: () => void;
  isDeleting: boolean;
}

const DialogDeleteEschool: React.FC<DialogDeleteEschoolProps> = ({
  isOpen,
  onOpenChange,
  eschool,
  onDelete,
  isDeleting,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete this eschool? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {eschool && (
          <div className="rounded-lg border bg-muted p-4">
            <h4 className="font-medium">{eschool.name}</h4>
            <p className="text-sm text-muted-foreground">{eschool.description || "-"}</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span>ID: {eschool.id}</span>
              <span>•</span>
              <span>{eschool.members_count} members</span>
            </div>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogDeleteEschool;