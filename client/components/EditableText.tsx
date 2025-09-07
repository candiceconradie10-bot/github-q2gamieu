import React, { useState, useRef, useEffect } from "react";
import { useEditing } from "@/contexts/EditingContext";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Save, X, Edit3 } from "lucide-react";

interface EditableTextProps {
  contentKey: string;
  defaultValue?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function EditableText({ 
  contentKey, 
  defaultValue = "", 
  as: Component = "span", 
  className = "",
  children,
  multiline = false,
  placeholder,
  maxLength
}: EditableTextProps) {
  const { isEditMode, getContent, updateContent, isAdmin } = useEditing();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const currentValue = getContent(contentKey, defaultValue);

  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue]);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      if (multiline && editRef.current instanceof HTMLTextAreaElement) {
        editRef.current.setSelectionRange(editRef.current.value.length, editRef.current.value.length);
      }
    }
  }, [isEditing, multiline]);

  const handleSave = async () => {
    if (editValue.trim() === currentValue.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateContent(contentKey, editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isAdmin) {
    return (
      <Component className={className}>
        {children || currentValue || defaultValue}
      </Component>
    );
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full max-w-full">
        <div className="flex flex-col gap-2 p-3 bg-black/80 backdrop-blur-lg rounded-lg border border-brand-red/50 shadow-lg">
          {multiline ? (
            <Textarea
              ref={editRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || `Edit ${contentKey}...`}
              maxLength={maxLength}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none min-h-[100px]"
              rows={4}
            />
          ) : (
            <Input
              ref={editRef as React.RefObject<HTMLInputElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || `Edit ${contentKey}...`}
              maxLength={maxLength}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/60">
              {multiline ? "Ctrl+Enter" : "Enter"} to save, Esc to cancel
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white h-8 px-2"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Component 
      className={`${className} ${
        isEditMode 
          ? "relative cursor-pointer group transition-all duration-200 hover:bg-brand-red/10 hover:shadow-lg rounded-md px-2 py-1 -mx-2 -my-1 border-2 border-transparent hover:border-brand-red/30"
          : ""
      }`}
      onClick={isEditMode ? () => setIsEditing(true) : undefined}
    >
      {children || currentValue || defaultValue}
      {isEditMode && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-brand-red text-white p-1 rounded-full shadow-lg">
            <Edit3 className="h-3 w-3" />
          </div>
        </div>
      )}
    </Component>
  );
}

interface EditableImageProps {
  contentKey: string;
  defaultValue?: string;
  className?: string;
  alt?: string;
}

export function EditableImage({ contentKey, defaultValue = "", className = "", alt }: EditableImageProps) {
  const { isEditMode, getContent, updateContent, isAdmin } = useEditing();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentValue = getContent(contentKey, defaultValue);

  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue]);

  const handleSave = async () => {
    if (editValue.trim() === currentValue.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateContent(contentKey, editValue.trim(), "image");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(currentValue);
    setIsEditing(false);
  };

  if (!isAdmin || !isEditMode) {
    return (
      <div
        className={`${className} ${
          isEditMode && isAdmin
            ? "relative cursor-pointer group transition-all duration-200 hover:shadow-lg rounded-md border-2 border-transparent hover:border-brand-red/30"
            : ""
        }`}
        style={{ backgroundImage: `url(${currentValue || defaultValue})` }}
        onClick={isEditMode ? () => setIsEditing(true) : undefined}
      >
        {isEditMode && isAdmin && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-brand-red text-white p-1 rounded-full shadow-lg">
              <Edit3 className="h-3 w-3" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`${className} relative`}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${currentValue || defaultValue})` }}
        />
        <div className="relative flex flex-col justify-center items-center p-6 bg-black/80 backdrop-blur-lg rounded-lg">
          <div className="w-full max-w-md space-y-3">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter image URL..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <div className="flex justify-center gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} relative cursor-pointer group transition-all duration-200 hover:shadow-lg rounded-md border-2 border-transparent hover:border-brand-red/30`}
      style={{ backgroundImage: `url(${currentValue || defaultValue})` }}
      onClick={() => setIsEditing(true)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-brand-red text-white p-1 rounded-full shadow-lg">
          <Edit3 className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}