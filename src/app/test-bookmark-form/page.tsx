"use client";

import { useState } from "react";
import { BookmarkFormDialog } from "@/components/forms";
import { SimpleBookmarkForm } from "@/components/forms/simple-bookmark-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TestBookmarkFormPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimpleOpen, setIsSimpleOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Test Bookmark Form</h1>
      
      <div className="space-y-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
        >
          Open Full Bookmark Form
        </button>
        
        <button 
          onClick={() => setIsSimpleOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Open Simple Form
        </button>
      </div>
      
      <BookmarkFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />
      
      <Dialog open={isSimpleOpen} onOpenChange={setIsSimpleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simple Bookmark Form</DialogTitle>
            <DialogDescription>
              Test the basic bookmark creation functionality.
            </DialogDescription>
          </DialogHeader>
          <SimpleBookmarkForm
            onSuccess={() => setIsSimpleOpen(false)}
            onCancel={() => setIsSimpleOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <div className="mt-8 text-sm text-gray-600">
        <p>This is a test page for the bookmark form.</p>
        <p>Try both forms to see which one works.</p>
      </div>
    </div>
  );
}