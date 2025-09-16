"use client";

import { BookmarkFormDialog } from "@/components/forms";

export default function TestFormPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Test Bookmark Form</h1>
      
      <div className="space-y-4">
        <BookmarkFormDialog />
        
        <div className="text-sm text-muted-foreground">
          <p>This page is for testing the bookmark form implementation.</p>
          <p>Click the button above to open the form dialog.</p>
        </div>
      </div>
    </div>
  );
}