import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  created_at?: string;
  size?: number;
  contentType?: string | null;
}

export function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [bucket, setBucket] = useState<string>("media");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });
      if (error) throw error;
      const mapped: MediaFile[] = (data || []).map((f) => {
        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(f.name);
        return {
          name: f.name,
          path: f.name,
          url: publicData.publicUrl,
          created_at: (f as any).created_at,
          size: f.metadata?.size,
          contentType: f.metadata?.mimetype ?? f.metadata?.contentType ?? null,
        };
      });
      setFiles(mapped);
    } catch (err: any) {
      console.error("Error listing files:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to list media files.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const uploadSelected = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const uploads = Array.from(selectedFiles).map(async (file) => {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { upsert: false, contentType: file.type });
        if (error) throw error;
        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        // Best-effort: record in media_files table if present
        try {
          await supabase.from("media_files").insert({
            filename: fileName,
            url: publicData.publicUrl,
            bucket,
          });
        } catch {}
      });
      await Promise.all(uploads);
      setSelectedFiles(null);
      if (inputRef.current) inputRef.current.value = "";
      toast({ title: "Uploaded", description: "Files uploaded successfully." });
      await fetchFiles();
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Could not upload files.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (path: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      try {
        await supabase.from("media_files").delete().eq("filename", path);
      } catch {}
      toast({ title: "Deleted", description: "File removed." });
      await fetchFiles();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "Could not delete file.",
        variant: "destructive",
      });
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied",
        description: "Public URL copied to clipboard.",
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Media Library</h2>
        <div className="flex gap-2">
          <Button
            onClick={fetchFiles}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button
            onClick={handleUploadClick}
            className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
          >
            <UploadCloud className="h-4 w-4 mr-2" /> Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {selectedFiles && selectedFiles.length > 0 && (
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Ready to upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Array.from(selectedFiles).map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-sm">{f.name}</span>
                  <Badge className="bg-white/10 text-white/80 border-white/20">
                    {Math.round(f.size / 1024)} KB
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                disabled={uploading}
                onClick={uploadSelected}
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
              >
                {uploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/20">
              <CardContent className="p-6">
                <div className="animate-pulse h-40 bg-white/10 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <Card
              key={file.path}
              className="bg-white/5 border-white/20 hover:bg-white/10 transition-colors"
            >
              <CardContent className="p-0">
                <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-black/20">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="p-4 space-y-2 text-white">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-medium" title={file.name}>
                      {file.name}
                    </div>
                    <Badge className="bg-white/10 text-white/80 border-white/20">
                      {file.size ? Math.round(file.size / 1024) : "?"} KB
                    </Badge>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyUrl(file.url)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" /> Copy URL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.path)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
