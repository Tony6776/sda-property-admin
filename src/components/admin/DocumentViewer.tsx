import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
  rejectionReason?: string;
}

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (documentId: string) => Promise<void>;
  onReject: (documentId: string, reason: string) => Promise<void>;
}

export function DocumentViewer({
  document,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: DocumentViewerProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!document) return null;

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await onApprove(document.id);
      toast.success("Document approved successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to approve document");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setProcessing(true);
      await onReject(document.id, rejectionReason);
      toast.success("Document rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to reject document");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    window.open(document.url, '_blank');
    toast.success("Download started");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      pending: { variant: "secondary", label: "Pending Review", icon: FileText },
      approved: { variant: "default", label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
    };

    const config = variants[status] || { variant: "outline" as const, label: status, icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const renderDocumentPreview = () => {
    const fileExtension = document.name.split('.').pop()?.toLowerCase();

    // PDF Preview
    if (fileExtension === 'pdf') {
      return (
        <div className="w-full h-96 border rounded-lg overflow-hidden bg-muted">
          <iframe
            src={document.url}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      );
    }

    // Image Preview
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      return (
        <div className="w-full h-96 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <img
            src={document.url}
            alt={document.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    // Generic file preview
    return (
      <div className="w-full h-96 border rounded-lg bg-muted flex flex-col items-center justify-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">Preview not available</p>
        <p className="text-xs text-muted-foreground">{document.name}</p>
        <Button onClick={handleDownload} className="mt-4" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download to View
        </Button>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{document.name}</span>
              {getStatusBadge(document.status)}
            </DialogTitle>
            <DialogDescription>
              {document.type} - Uploaded on {new Date(document.uploadedAt).toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {renderDocumentPreview()}
          </div>

          {document.status === "rejected" && document.rejectionReason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
              <p className="text-sm text-muted-foreground">{document.rejectionReason}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={processing}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {document.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. This will be shared with the participant.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="rejection-reason" className="text-sm font-medium mb-2 block">
              Rejection Reason
            </Label>
            <Input
              id="rejection-reason"
              placeholder="e.g., Document is unclear, wrong document type, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={processing}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
