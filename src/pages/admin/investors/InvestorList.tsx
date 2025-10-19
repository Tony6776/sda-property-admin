import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Investor {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  available_capital: number;
  preferred_property_types: string[];
  preferred_locations: string[];
  risk_tolerance: string;
  created_at: string;
}

interface InvestorWithJobs extends Investor {
  active_jobs_count?: number;
}

export default function InvestorList() {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<InvestorWithJobs[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const { data: investorsData, error: investorsError } = await supabase
        .from('investors')
        .select('*')
        .order('created_at', { ascending: false });

      if (investorsError) {
        console.error('Error fetching investors:', investorsError);
        toast.error("Failed to load investors");
        return;
      }

      // Fetch job counts for each investor
      const investorsWithJobs = await Promise.all(
        (investorsData || []).map(async (investor) => {
          const { count } = await supabase
            .from('job_investors')
            .select('*', { count: 'exact', head: true })
            .eq('investor_id', investor.id)
            .in('status', ['invited', 'committed']);

          return {
            ...investor,
            active_jobs_count: count || 0,
          };
        })
      );

      setInvestors(investorsWithJobs);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Failed to load investors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const getRiskBadge = (risk: string) => {
    const riskConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
      low: { variant: "secondary", label: "Low Risk" },
      medium: { variant: "outline", label: "Medium Risk" },
      high: { variant: "destructive", label: "High Risk" },
    };

    const config = riskConfig[risk] || { variant: "secondary" as const, label: risk || "Unknown" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardHeader>
            <CardTitle>Investors</CardTitle>
            <CardDescription>Loading investors...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Investors Management</CardTitle>
              <CardDescription>
                {investors.length} total investors
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={fetchInvestors}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => navigate('/admin/investors/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Investor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {investors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No investors found</p>
              <p className="text-sm mt-2">Add your first investor</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Available Capital</TableHead>
                    <TableHead>Preferred Types</TableHead>
                    <TableHead>Risk Tolerance</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investors.map((investor) => (
                    <TableRow
                      key={investor.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/investors/${investor.id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">{investor.full_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{investor.email}</div>
                        {investor.phone && (
                          <div className="text-sm text-muted-foreground">{investor.phone}</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${investor.available_capital?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(investor.preferred_property_types || []).slice(0, 2).map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {(investor.preferred_property_types || []).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{investor.preferred_property_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(investor.risk_tolerance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {investor.active_jobs_count || 0} jobs
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/investors/${investor.id}`);
                          }}
                          title="View profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
