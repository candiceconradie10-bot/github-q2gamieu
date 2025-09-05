import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Image,
  Code,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";

interface ContentItem {
  id: string;
  key: string;
  type: "text" | "image" | "html" | "json";
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function ContentManager() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    key: "",
    type: "text" as ContentItem["type"],
    value: "",
    description: "",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch content items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from("site_content")
          .update({
            key: formData.key,
            type: formData.type,
            value: formData.value,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Content updated successfully.",
        });
      } else {
        // Create new item
        const { error } = await supabase.from("site_content").insert({
          key: formData.key,
          type: formData.type,
          value: formData.value,
          description: formData.description,
        });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Content created successfully.",
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ key: "", type: "text", value: "", description: "" });
      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save content.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      key: item.key,
      type: item.type,
      value: item.value,
      description: item.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content item?")) return;

    try {
      const { error } = await supabase
        .from("site_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Content deleted successfully.",
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "html":
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "html":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "json":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white/5 border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/4"></div>
                <div className="h-6 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <div className="flex space-x-2">
          <Button
            onClick={fetchContent}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ key: "", type: "text", value: "", description: "" });
                }}
                className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 backdrop-blur-xl border border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Content" : "Add New Content"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Content Key</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="hero_title"
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Content Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as ContentItem["type"] })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image URL</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this content"
                    className="bg-white/10 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Content Value</Label>
                  <Textarea
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter content value..."
                    rows={formData.type === "html" ? 8 : 4}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {content.map((item) => (
          <Card key={item.id} className="bg-white/5 border-white/20 hover:bg-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getTypeBadgeColor(item.type)} font-medium`}>
                      {getTypeIcon(item.type)}
                      <span className="ml-1">{item.type.toUpperCase()}</span>
                    </Badge>
                    <h3 className="font-semibold text-white text-lg">{item.key}</h3>
                  </div>
                  {item.description && (
                    <p className="text-white/60 text-sm">{item.description}</p>
                  )}
                  <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                    {item.type === "image" ? (
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.value}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-white/80 text-sm font-mono break-all">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/80 text-sm font-mono whitespace-pre-wrap line-clamp-3">
                        {item.value}
                      </p>
                    )}
                  </div>
                  <p className="text-white/40 text-xs">
                    Last updated: {new Date(item.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="outline"
                    size="sm"
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

      {content.length === 0 && (
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Content Items</h3>
            <p className="text-white/60 mb-6">
              Start by adding your first content item to manage your website content.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-brand-red"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Content Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}