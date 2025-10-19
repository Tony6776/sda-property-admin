import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  ArrowLeft,
  Calendar,
  DollarSign,
  Loader2,
  Download,
  Send,
  CheckCircle,
  FileText
} from "lucide-react";

interface NDIABatch {
  id: string;
  batch_number: string;
  batch_date: string;
  payment_period_start: string;
  payment_period_end: string;
  status: string;
  total_properties: number;
  total_participants: number;
  total_amount: number;
  submission_date: string | null;
  ndia_approval_date: string | null;
  csv_file_url: string | null;
}

export default function NDIABatchList() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<NDIABatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ndia_payment_batches')
        .select('*')
        .order('batch_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load payment batches');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyBatch = async () => {
    try {
      setProcessing('generate');
      toast.info('Generating monthly payment batch...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ndia-payment-processor`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'auto_process_monthly',
            organization_id: 'homelander'
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`Batch created: ${result.result.batch.batch_number}`);
        fetchBatches();
      } else {
        throw new Error(result.error || 'Failed to generate batch');
      }
    } catch (error: any) {
      console.error('Error generating batch:', error);
      toast.error(error.message || 'Failed to generate monthly batch');
    } finally {
      setProcessing(null);
    }
  };

  const handleGenerateCSV = async (batchId: string) => {
    try {
      setProcessing(batchId);
      toast.info('Generating CSV file...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ndia-payment-processor`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'create_csv',
            batch_id: batchId
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('CSV generated successfully');
        fetchBatches();
      } else {
        throw new Error(result.error || 'Failed to generate CSV');
      }
    } catch (error: any) {
      console.error('Error generating CSV:', error);
      toast.error(error.message || 'Failed to generate CSV');
    } finally {
      setProcessing(null);
    }
  };

  const handleSubmitBatch = async (batchId: string) => {
    try {
      setProcessing(batchId);
      toast.info('Submitting batch to NDIA...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ndia-payment-processor`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'submit_batch',
            batch_id: batchId
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Batch submitted successfully');
        fetchBatches();
      } else {
        throw new Error(result.error || 'Failed to submit batch');
      }
    } catch (error: any) {
      console.error('Error submitting batch:', error);
      toast.error(error.message || 'Failed to submit batch');
    } finally {
      setProcessing(null);
    }
  };

  const handleReconcileBatch = async (batchId: string) => {
    try {
      setProcessing(batchId);
      toast.info('Reconciling batch...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ndia-payment-processor`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'reconcile_batch',
            batch_id: batchId
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Batch reconciled successfully');
        fetchBatches();
      } else {
        throw new Error(result.error || 'Failed to reconcile batch');
      }
    } catch (error: any) {
      console.error('Error reconciling batch:', error);
      toast.error(error.message || 'Failed to reconcile batch');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; color: string }> = {
      draft: { variant: "outline", label: "Draft", color: "text-gray-600" },
      ready: { variant: "secondary", label: "Ready", color: "text-blue-600" },
      submitted: { variant: "default", label: "Submitted", color: "text-yellow-600" },
      processing: { variant: "default", label: "Processing", color: "text-orange-600" },
      approved: { variant: "default", label: "Approved", color: "text-green-600" },
      paid: { variant: "default", label: "Paid", color: "text-green-700" },
      rejected: { variant: "destructive", label: "Rejected", color: "text-red-600" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status, color: "text-gray-600" };
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBatches = batches.filter(batch =>
    statusFilter === "all" || batch.status === statusFilter
  );

  const stats = {
    total: batches.length,
    draft: batches.filter(b => b.status === 'draft').length,
    submitted: batches.filter(b => b.status === 'submitted' || b.status === 'processing').length,
    paid: batches.filter(b => b.status === 'paid').length,
    totalAmount: batches.reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">NDIA Payment Batches</h1>
            </div>
            <Button onClick={handleGenerateMonthlyBatch} disabled={processing === 'generate'}>
              {processing === 'generate' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Monthly Batch
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Batches</CardTitle>
            <CardDescription>
              Showing {filteredBatches.length} of {batches.length} batches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No payment batches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <code className="font-mono text-sm">{batch.batch_number}</code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {formatDate(batch.payment_period_start)} - {formatDate(batch.payment_period_end)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{batch.total_properties}</TableCell>
                        <TableCell>{batch.total_participants}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(batch.total_amount)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(batch.submission_date)}</TableCell>
                        <TableCell>{getStatusBadge(batch.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {batch.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateCSV(batch.id)}
                                disabled={processing === batch.id}
                              >
                                {processing === batch.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 mr-1" />
                                    CSV
                                  </>
                                )}
                              </Button>
                            )}
                            {batch.status === 'ready' && (
                              <>
                                {batch.csv_file_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(batch.csv_file_url!, '_blank')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleSubmitBatch(batch.id)}
                                  disabled={processing === batch.id}
                                >
                                  {processing === batch.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-1" />
                                      Submit
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {(batch.status === 'submitted' || batch.status === 'approved') && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReconcileBatch(batch.id)}
                                disabled={processing === batch.id}
                              >
                                {processing === batch.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Reconcile
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
