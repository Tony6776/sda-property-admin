import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { checkParticipantAuth } from "@/lib/participantAuth";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText, CheckCircle2, Circle, AlertCircle } from "lucide-react";

export default function ParticipantDocuments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [participantId, setParticipantId] = useState('');
  const [uploadingNDIS, setUploadingNDIS] = useState(false);
  const [uploadingID, setUploadingID] = useState(false);
  const [uploadingIncome, setUploadingIncome] = useState(false);
  const [documents, setDocuments] = useState({
    ndis_plan_uploaded: false,
    id_uploaded: false,
    income_proof_uploaded: false
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { isAuthenticated, participant } = await checkParticipantAuth();

      if (!isAuthenticated) {
        navigate('/participant/login');
        return;
      }

      setParticipantId(participant.id);
      setDocuments({
        ndis_plan_uploaded: participant.ndis_plan_uploaded || false,
        id_uploaded: participant.id_uploaded || false,
        income_proof_uploaded: participant.income_proof_uploaded || false
      });

    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'ndis' | 'id' | 'income'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = {
      ndis: setUploadingNDIS,
      id: setUploadingID,
      income: setUploadingIncome
    }[docType];

    const fieldName = {
      ndis: 'ndis_plan_uploaded',
      id: 'id_uploaded',
      income: 'income_proof_uploaded'
    }[docType];

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${participantId}/${docType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('participant-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update participant record
      const { error: updateError } = await supabase
        .from('participants')
        .update({
          [fieldName]: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('lead_activities').insert({
        participant_id: participantId,
        activity_type: 'document_uploaded',
        activity_data: { document_type: docType }
      });

      // Update lead score
      await supabase.rpc('calculate_participant_lead_score', { participant_id: participantId });

      toast.success('Document uploaded successfully!');
      loadDocuments();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading documents...</p>
      </div>
    );
  }

  const documentsComplete = documents.ndis_plan_uploaded && documents.id_uploaded && documents.income_proof_uploaded;
  const documentsProgress = Object.values(documents).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/participant/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">My Documents</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        {/* Progress Banner */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Document Upload Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {documentsProgress} of 3 required documents uploaded
                </p>
              </div>
              {documentsComplete ? (
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {3 - documentsProgress} remaining
                </Badge>
              )}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(documentsProgress / 3) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* NDIS Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {documents.ndis_plan_uploaded ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle>NDIS Plan</CardTitle>
                    <CardDescription>
                      Upload your current NDIS plan document
                    </CardDescription>
                  </div>
                </div>
                {documents.ndis_plan_uploaded && (
                  <Badge variant="default">Uploaded</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We need your NDIS plan to verify your SDA funding level and category. This helps us match you with suitable properties.
                </p>
                <div>
                  <Label htmlFor="ndis-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      {uploadingNDIS ? (
                        <p className="text-sm">Uploading...</p>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">
                            {documents.ndis_plan_uploaded ? 'Replace NDIS Plan' : 'Upload NDIS Plan'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG, or PNG (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="ndis-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'ndis')}
                      disabled={uploadingNDIS}
                    />
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Document */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {documents.id_uploaded ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle>Photo ID</CardTitle>
                    <CardDescription>
                      Driver's license, passport, or government ID
                    </CardDescription>
                  </div>
                </div>
                {documents.id_uploaded && (
                  <Badge variant="default">Uploaded</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Photo ID is required for identity verification and property applications.
                </p>
                <div>
                  <Label htmlFor="id-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      {uploadingID ? (
                        <p className="text-sm">Uploading...</p>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">
                            {documents.id_uploaded ? 'Replace ID Document' : 'Upload ID Document'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG, or PNG (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="id-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'id')}
                      disabled={uploadingID}
                    />
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income Proof */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {documents.income_proof_uploaded ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle>Income Proof</CardTitle>
                    <CardDescription>
                      Bank statement, Centrelink statement, or payslip
                    </CardDescription>
                  </div>
                </div>
                {documents.income_proof_uploaded && (
                  <Badge variant="default">Uploaded</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Income verification helps us ensure you can afford the rent portion not covered by your NDIS funding.
                </p>
                <div>
                  <Label htmlFor="income-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      {uploadingIncome ? (
                        <p className="text-sm">Uploading...</p>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">
                            {documents.income_proof_uploaded ? 'Replace Income Proof' : 'Upload Income Proof'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG, or PNG (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="income-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'income')}
                      disabled={uploadingIncome}
                    />
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {documentsComplete && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">All documents uploaded!</h3>
                  <p className="text-sm text-green-700">
                    Your profile is complete. You'll receive better property matches now.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
