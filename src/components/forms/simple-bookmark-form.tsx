"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SimpleBookmarkFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SimpleBookmarkForm({ onSuccess, onCancel }: SimpleBookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      alert("URL is required");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.startsWith('http') ? url : `https://${url}`,
          title: title || url,
          categoryId: 'temp', // We'll need a category ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bookmark');
      }

      alert('Bookmark created successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating bookmark:', error);
      alert('Failed to create bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Bookmark title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Bookmark"}
        </Button>
      </div>
    </form>
  );
}