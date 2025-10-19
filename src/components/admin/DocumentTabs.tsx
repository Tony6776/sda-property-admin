import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { SmartFileUpload } from "./SmartFileUpload";
import { toast } from "sonner";
import { format } from "date-fns";

interface DocumentTabsProps {
  entityType: "property" | "participant" | "landlord" | "investor" | "job";
  entityId: string;
  entityName?: string;
}

interface FileUpload {
  id: string;
  original_filename: string;
  storage_path: string;
  file_category: string;
  ai_detected_type: string | null;
  ai_confidence: number | null;
  ai_processed: boolean;
  approval_status: "pending" | "approved" | "rejected" | null;
  uploaded_by: string | null;
  created_at: string;
  file_size: number | null;
  mime_type: string | null;
}

export function DocumentTabs({ entityType, entityId, entityName }: DocumentTabsProps) {
  const [documents, setDocuments] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [entityId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("file_uploads")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (error) {
        // Handle table not existing gracefully
        if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
          console.log("file_uploads table not yet created - apply migration");
          setDocuments([]);
          return;
        }
        throw error;
      }

      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error loading documents:", error);
      if (!error.message?.includes("relation")) {
        toast.error("Failed to load documents");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: FileUpload) => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(doc.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Document downloaded");
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("file_uploads")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Document deleted");
      loadDocuments();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("file_uploads")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Document approved");
      loadDocuments();
    } catch (error: any) {
      toast.error("Failed to approve document");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("file_uploads")
        .update({
          approval_status: "rejected",
          rejected_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Document rejected");
      loadDocuments();
    } catch (error: any) {
      toast.error("Failed to reject document");
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (["pdf"].includes(ext || "")) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      lease_agreement: "Lease Agreement",
      ndis_plan: "NDIS Plan",
      participant_id: "ID Document",
      income_proof: "Income Proof",
      investment_brief: "Investment Brief",
      contract: "Contract",
      property_photo: "Property Photo",
      floor_plan: "Floor Plan",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getApprovalBadge = (status: string | null) => {
    if (!status || status === "pending") {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
    if (status === "approved") {
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
    }
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload Documents</TabsTrigger>
        <TabsTrigger value="download">
          View Documents ({documents.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload files for {entityName || `this ${entityType}`}. AI will automatically categorize and extract data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SmartFileUpload
              entityType={entityType}
              entityId={entityId}
              onUploadComplete={loadDocuments}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="download">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              All documents uploaded for {entityName || `this ${entityType}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
                <p className="text-sm text-muted-foreground">
                  Use the Upload tab to add documents
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>AI Detection</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.original_filename)}
                            <span className="font-medium truncate max-w-[200px]">
                              {doc.original_filename}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getCategoryLabel(doc.file_category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {doc.ai_processed ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {doc.ai_detected_type || "Processed"}
                              </Badge>
                              {doc.ai_confidence && (
                                <span className="text-xs text-muted-foreground">
                                  {doc.ai_confidence}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Not processed</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getApprovalBadge(doc.approval_status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {doc.approval_status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(doc.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(doc.id)}
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(doc.id, doc.storage_path)}
                              disabled={deletingId === doc.id}
                            >
                              {deletingId === doc.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
