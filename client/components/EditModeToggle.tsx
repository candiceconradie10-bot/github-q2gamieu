import React from "react";
import { Button } from "./ui/button";
import { useEditing } from "@/contexts/EditingContext";
import { Edit3, EyeOff, Crown } from "lucide-react";

export function EditModeToggle() {
  const { isEditMode, toggleEditMode, isAdmin } = useEditing();

  if (!isAdmin) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={toggleEditMode}
        className={`${
          isEditMode
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20"
            : "bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
        } text-white font-bold px-4 py-2 rounded-xl backdrop-blur-lg border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95`}
        size="sm"
      >
        <Crown className="h-4 w-4 mr-2" />
        {isEditMode ? (
          <>
            <EyeOff className="h-4 w-4 mr-2" />
            Exit Edit Mode
          </>
        ) : (
          <>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Mode
          </>
        )}
      </Button>
      
      {isEditMode && (
        <div className="mt-2 p-3 bg-black/90 backdrop-blur-lg rounded-xl border border-brand-red/30 text-white text-xs max-w-xs">
          <p className="font-medium mb-1">🎨 Edit Mode Active</p>
          <p className="text-white/70">
            Click on any text or background to edit it. Changes are saved automatically and sync across all browsers.
          </p>
        </div>
      )}
    </div>
  );
}