import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  key: string;
  type: "text" | "image" | "html" | "json";
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface EditingContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  content: Record<string, ContentItem>;
  updateContent: (key: string, value: string, type?: ContentItem["type"]) => Promise<void>;
  getContent: (key: string, defaultValue?: string) => string;
  isAdmin: boolean;
  loading: boolean;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export function EditingProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState<Record<string, ContentItem>>({});
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const isAdmin = profile?.role === "admin" || profile?.is_admin === true;

  // Fetch all content from database
  const fetchContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*");

      if (error) throw error;

      const contentMap = (data || []).reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {} as Record<string, ContentItem>);

      setContent(contentMap);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time subscription to content changes
  useEffect(() => {
    fetchContent();

    // Set up real-time subscription
    const subscription = supabase
      .channel("site_content_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_content",
        },
        (payload) => {
          console.log("Content changed:", payload);
          
          if (payload.eventType === "DELETE") {
            setContent((prev) => {
              const newContent = { ...prev };
              delete newContent[payload.old.key];
              return newContent;
            });
          } else {
            // INSERT or UPDATE
            const newItem = payload.new as ContentItem;
            setContent((prev) => ({
              ...prev,
              [newItem.key]: newItem,
            }));
            
            // Show toast notification for real-time updates
            if (payload.eventType === "UPDATE") {
              toast({
                title: "Content Updated",
                description: `"${newItem.key}" has been updated in real-time`,
                duration: 2000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchContent, toast]);

  const toggleEditMode = () => {
    if (!isAdmin) return;
    setIsEditMode(!isEditMode);
    toast({
      title: isEditMode ? "Edit Mode Disabled" : "Edit Mode Enabled",
      description: isEditMode 
        ? "You can no longer edit content directly on the page" 
        : "Click on any text to edit it directly",
      duration: 3000,
    });
  };

  const updateContent = async (key: string, value: string, type: ContentItem["type"] = "text") => {
    try {
      const existingItem = content[key];
      
      if (existingItem) {
        // Update existing content
        const { error } = await supabase
          .from("site_content")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key);

        if (error) throw error;
      } else {
        // Create new content
        const { error } = await supabase
          .from("site_content")
          .insert({
            key,
            type,
            value,
            description: `Auto-generated content for ${key}`,
          });

        if (error) throw error;
      }

      toast({
        title: "Content Saved",
        description: `"${key}" has been updated successfully`,
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error updating content:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save content",
        variant: "destructive",
      });
    }
  };

  const getContent = (key: string, defaultValue: string = "") => {
    return content[key]?.value || defaultValue;
  };

  return (
    <EditingContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        content,
        updateContent,
        getContent,
        isAdmin,
        loading,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
}

export function useEditing() {
  const context = useContext(EditingContext);
  if (context === undefined) {
    throw new Error("useEditing must be used within an EditingProvider");
  }
  return context;
}