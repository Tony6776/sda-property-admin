import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Image,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface SmartFileUploadProps {
  entityType?: 'property' | 'participant' | 'landlord' | 'investor' | 'job';
  entityId?: string;
  onUploadComplete?: (fileId: string) => void;
  acceptedFileTypes?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  aiDetectedType?: string;
  aiConfidence?: number;
  extractedData?: Record<string, any>;
  storagePath?: string;
  category?: string;
}

const FILE_CATEGORIES = [
  { value: 'lease_agreement', label: 'Lease Agreement', icon: FileText },
  { value: 'compliance_certificate', label: 'Compliance Certificate', icon: FileText },
  { value: 'title_deed', label: 'Title Deed', icon: FileText },
  { value: 'ndis_plan', label: 'NDIS Plan', icon: FileText },
  { value: 'participant_id', label: 'Participant ID', icon: Image },
  { value: 'income_proof', label: 'Income Proof', icon: FileText },
  { value: 'investment_brief', label: 'Investment Brief', icon: FileText },
  { value: 'contract', label: 'Contract', icon: FileText },
  { value: 'property_photo', label: 'Property Photo', icon: Image },
  { value: 'floor_plan', label: 'Floor Plan', icon: Image },
  { value: 'inspection_report', label: 'Inspection Report', icon: FileText },
  { value: 'other', label: 'Other', icon: FileText },
];

export function SmartFileUpload({
  entityType,
  entityId,
  onUploadComplete,
  acceptedFileTypes = "image/*,application/pdf,.doc,.docx"
}: SmartFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status === 'uploading' || f.status === 'processing'));
  };

  // Simulate AI file categorization (replace with real AI later)
  // Sanitize filename for storage (remove special characters)
  const sanitizeFilename = (filename: string): string => {
    // Get file extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
    const ext = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';

    // Remove or replace special characters
    const sanitized = name
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[[\](){}]/g, '')      // Remove brackets and parentheses
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace other special chars with underscores
      .replace(/_+/g, '_')            // Replace multiple underscores with single
      .replace(/^_|_$/g, '');         // Remove leading/trailing underscores

    return sanitized + ext;
  };

  const categorizeFile = (filename: string, fileType: string): { category: string; confidence: number; extractedData?: any } => {
    const lowerName = filename.toLowerCase();

    // Simulate AI detection based on filename and content
    if (lowerName.includes('lease') || lowerName.includes('rental')) {
      return {
        category: 'lease_agreement',
        confidence: 92,
        extractedData: {
          detected: 'Lease Agreement',
          suggestedFields: ['landlord_name', 'tenant_name', 'property_address', 'lease_start', 'lease_end', 'monthly_rent']
        }
      };
    }

    if (lowerName.includes('ndis') || lowerName.includes('plan')) {
      return {
        category: 'ndis_plan',
        confidence: 95,
        extractedData: {
          detected: 'NDIS Plan',
          suggestedFields: ['ndis_number', 'participant_name', 'plan_start', 'plan_end', 'sda_funding', 'plan_manager']
        }
      };
    }

    if (lowerName.includes('id') || lowerName.includes('license') || lowerName.includes('passport')) {
      return {
        category: 'participant_id',
        confidence: 88,
        extractedData: {
          detected: 'Photo ID',
          suggestedFields: ['id_type', 'id_number', 'full_name', 'dob', 'expiry_date']
        }
      };
    }

    if (lowerName.includes('income') || lowerName.includes('payslip') || lowerName.includes('bank')) {
      return {
        category: 'income_proof',
        confidence: 85,
        extractedData: {
          detected: 'Income Proof',
          suggestedFields: ['income_type', 'amount', 'frequency', 'employer']
        }
      };
    }

    if (lowerName.includes('compliance') || lowerName.includes('certificate') || lowerName.includes('cert')) {
      return {
        category: 'compliance_certificate',
        confidence: 90,
        extractedData: {
          detected: 'Compliance Certificate',
          suggestedFields: ['certificate_type', 'issue_date', 'expiry_date', 'issuer']
        }
      };
    }

    if (lowerName.includes('brief') || lowerName.includes('investment') || lowerName.includes('proposal')) {
      return {
        category: 'investment_brief',
        confidence: 87,
        extractedData: {
          detected: 'Investment Brief',
          suggestedFields: ['project_name', 'investment_required', 'expected_roi', 'timeline']
        }
      };
    }

    if (fileType.startsWith('image/')) {
      return {
        category: 'property_photo',
        confidence: 75,
        extractedData: {
          detected: 'Property Photo',
          suggestedFields: ['photo_type', 'room_type']
        }
      };
    }

    return {
      category: 'other',
      confidence: 50,
      extractedData: {
        detected: 'Unknown Document Type',
        suggestedFields: []
      }
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Create upload entries for each file
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const uploadFile of newFiles) {
      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress: i } : f
          ));
        }

        // AI Categorization (simulated)
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'processing' } : f
        ));

        const aiResult = categorizeFile(uploadFile.file.name, uploadFile.file.type);

        // Upload to Supabase Storage
        const sanitizedName = sanitizeFilename(uploadFile.file.name);
        const fileName = `${Date.now()}_${sanitizedName}`;
        const storagePath = `${entityType || 'general'}/${entityId || 'uncategorized'}/${aiResult.category}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, uploadFile.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'error' } : f
          ));

          // Check if it's a bucket not found error
          if (uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
            toast.error('Storage bucket "documents" not found. Please create it in Supabase Dashboard.');
          } else {
            toast.error(`Failed to upload ${uploadFile.file.name}: ${uploadError.message}`);
          }
          continue;
        }

        // Save to file_uploads table
        const { data: fileRecord, error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            original_filename: uploadFile.file.name,
            stored_filename: fileName,
            file_size: uploadFile.file.size,
            mime_type: uploadFile.file.type,
            storage_path: storagePath,
            storage_bucket: 'documents',
            file_category: aiResult.category,
            entity_type: entityType,
            entity_id: entityId,
            ai_detected_type: aiResult.category,
            ai_confidence: aiResult.confidence,
            ai_processed: true,
            processed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'error' } : f
          ));

          // Check if it's a table missing error
          if (dbError.message?.includes('relation') || dbError.message?.includes('does not exist')) {
            toast.error('Database tables not ready. Please apply migration first.');
          } else {
            toast.error(`Failed to save file metadata: ${dbError.message}`);
          }
          continue;
        }

        // Save extraction data (optional - don't fail upload if this fails)
        if (aiResult.extractedData) {
          const { error: extractionError } = await supabase
            .from('document_extractions')
            .insert({
              file_upload_id: fileRecord.id,
              document_type: aiResult.category,
              extracted_fields: aiResult.extractedData,
              validation_status: 'pending',
            });

          if (extractionError) {
            console.warn('Failed to save extraction data:', extractionError);
            // Don't fail the upload - extraction data is optional
          }
        }

        // Update file status
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? {
            ...f,
            status: 'completed',
            aiDetectedType: aiResult.category,
            aiConfidence: aiResult.confidence,
            extractedData: aiResult.extractedData,
            storagePath,
          } : f
        ));

        toast.success(`✨ ${uploadFile.file.name} uploaded and categorized`);

        if (onUploadComplete) {
          onUploadComplete(fileRecord.id);
        }

      } catch (error: any) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'error' } : f
        ));
        toast.error(`Error: ${error.message}`);
      }
    }
  }, [entityType, entityId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? { [acceptedFileTypes]: [] } : undefined,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category?: string) => {
    const cat = FILE_CATEGORIES.find(c => c.value === category);
    return cat?.label || category || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Smart File Upload</CardTitle>
        </div>
        <CardDescription>
          Upload files and AI will automatically categorize and extract data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium">Drop files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-1">
                Drag & drop files here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button type="button" variant="secondary" size="sm">
                Select Files
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Supports: PDF, Images, Word documents (max 10MB)
          </p>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Uploaded Files ({files.length})
              </h4>
              {files.some(f => f.status === 'completed' || f.status === 'error') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                >
                  Clear Completed
                </Button>
              )}
            </div>

            {files.map((uploadFile) => (
              <Card key={uploadFile.id} className="p-4">
                <div className="space-y-3">
                  {/* File Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(uploadFile.status)}
                        <p className="font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(uploadFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'completed' && uploadFile.aiDetectedType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {getCategoryLabel(uploadFile.aiDetectedType)}
                        </Badge>
                      )}
                      {(uploadFile.status === 'completed' || uploadFile.status === 'error') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          className="h-6 w-6 p-0"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                    <div className="space-y-1">
                      <Progress value={uploadFile.progress} />
                      <p className="text-xs text-muted-foreground">
                        {uploadFile.status === 'uploading' ? 'Uploading...' : '🤖 AI Processing...'}
                      </p>
                    </div>
                  )}

                  {/* AI Detection Results */}
                  {uploadFile.status === 'completed' && uploadFile.extractedData && (
                    <Alert>
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              AI Detected: {uploadFile.extractedData.detected}
                            </span>
                            <Badge variant="outline">
                              {uploadFile.aiConfidence}% confidence
                            </Badge>
                          </div>
                          {uploadFile.extractedData.suggestedFields?.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Suggested fields to extract:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {uploadFile.extractedData.suggestedFields.map((field: string) => (
                                  <Badge key={field} variant="secondary" className="text-xs">
                                    {field.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error */}
                  {uploadFile.status === 'error' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to upload file. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
