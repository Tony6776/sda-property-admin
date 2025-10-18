import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator as CalcIcon, Home, DollarSign, TrendingUp, PieChart, ArrowRight, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";

const calculatorStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "SDA Homeownership Calculator",
  "description": "Calculate your SDA homeownership options including deposits, payments, and pathways"
};

interface CalculatorInputs {
  propertyValue: number;
  currentSavings: number;
  sdaFunding: number;
  location: string;
  suburb: string;
  sdaPropertyType: string;
  propertyType: string;
  pathway: string;
  loanTerm: number;
  interestRate: number;
}

const Calculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    propertyValue: 500000,
    currentSavings: 50000,
    sdaFunding: 1200,
    location: "",
    suburb: "",
    sdaPropertyType: "",
    propertyType: "",
    pathway: "",
    loanTerm: 25,
    interestRate: 7.2
  });

  const [showResults, setShowResults] = useState(false);

  const updateInput = (key: keyof CalculatorInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const calculateResults = () => {
    const depositRequired = inputs.propertyValue * 0.1; // 10% deposit
    const loanAmount = inputs.propertyValue - Math.min(inputs.currentSavings, depositRequired);
    const monthlyPayment = calculateMonthlyPayment(loanAmount, inputs.interestRate, inputs.loanTerm);
    const weeklyPayment = monthlyPayment / 4.33;
    const totalWeeklyIncome = inputs.sdaFunding; // Only SDA funding as income
    const affordabilityRatio = (weeklyPayment / totalWeeklyIncome) * 100;
    
    return {
      depositRequired,
      depositShortfall: Math.max(0, depositRequired - inputs.currentSavings),
      loanAmount,
      monthlyPayment,
      weeklyPayment,
      totalWeeklyIncome,
      affordabilityRatio,
      canAfford: affordabilityRatio <= 30 // 30% of income is affordable
    };
  };

  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const calculateRentToBuyOption = () => {
    const weeklyRent = inputs.propertyValue * 0.00015; // Rough estimate
    const depositContribution = weeklyRent * 0.3; // 30% goes to deposit
    const yearsToOwnership = Math.ceil(inputs.propertyValue * 0.1 / (depositContribution * 52));
    
    return {
      weeklyRent,
      depositContribution,
      yearsToOwnership: Math.min(yearsToOwnership, 7)
    };
  };

  const calculateEquityShareOption = () => {
    const yourShare = 0.7; // 70% ownership
    const yourDeposit = inputs.propertyValue * 0.1 * yourShare;
    const yourLoanAmount = (inputs.propertyValue * yourShare) - yourDeposit;
    const yourMonthlyPayment = calculateMonthlyPayment(yourLoanAmount, inputs.interestRate, inputs.loanTerm);
    
    return {
      yourShare: yourShare * 100,
      yourDeposit,
      yourLoanAmount,
      yourMonthlyPayment,
      partnerShare: (1 - yourShare) * 100
    };
  };

  const results = showResults ? calculateResults() : null;
  const rentToBuy = showResults ? calculateRentToBuyOption() : null;
  const equityShare = showResults ? calculateEquityShareOption() : null;

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={calculatorStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">
                  <CalcIcon className="h-4 w-4 mr-2" />
                  Free Calculator
                </Badge>
                <h1 className="text-4xl font-bold mb-6">
                  SDA Homeownership Calculator
                </h1>
                <p className="text-xl text-muted-foreground">
                  Calculate your options across all three homeownership pathways
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <Card className="card-elegant">
                  <CardHeader>
                    <CardTitle>Your Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="property-value" className="flex items-center justify-between">
                        <span>Target Property Value</span>
                        <Badge variant="outline">${inputs.propertyValue.toLocaleString()}</Badge>
                      </Label>
                      <Slider
                        id="property-value"
                        min={300000}
                        max={800000}
                        step={10000}
                        value={[inputs.propertyValue]}
                        onValueChange={(value) => updateInput('propertyValue', value[0])}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>$300k</span>
                        <span>$800k</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="savings">Current Savings</Label>
                        <Input
                          id="savings"
                          type="number"
                          placeholder="50000"
                          value={inputs.currentSavings}
                          onChange={(e) => updateInput('currentSavings', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sda-property-type">Type of SDA Property</Label>
                        <Select onValueChange={(value) => updateInput('sdaPropertyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select SDA property type" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="improved-liveability">Improved Liveability</SelectItem>
                            <SelectItem value="robust">Robust</SelectItem>
                            <SelectItem value="fully-accessible">Fully Accessible</SelectItem>
                            <SelectItem value="high-physical-support">High Physical Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sda-funding">Weekly SDA Funding</Label>
                        <Input
                          id="sda-funding"
                          type="number"
                          placeholder="1200"
                          value={inputs.sdaFunding}
                          onChange={(e) => updateInput('sdaFunding', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Select onValueChange={(value) => updateInput('location', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="sydney">Sydney, NSW</SelectItem>
                            <SelectItem value="melbourne">Melbourne, VIC</SelectItem>
                            <SelectItem value="brisbane">Brisbane, QLD</SelectItem>
                            <SelectItem value="perth">Perth, WA</SelectItem>
                            <SelectItem value="adelaide">Adelaide, SA</SelectItem>
                            <SelectItem value="canberra">Canberra, ACT</SelectItem>
                            <SelectItem value="hobart">Hobart, TAS</SelectItem>
                            <SelectItem value="darwin">Darwin, NT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="suburb">Suburb</Label>
                        <Input
                          id="suburb"
                          type="text"
                          placeholder="Enter suburb"
                          value={inputs.suburb}
                          onChange={(e) => updateInput('suburb', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="property-type">Type of Property</Label>
                        <Select onValueChange={(value) => updateInput('propertyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="loan-term" className="flex items-center justify-between">
                          <span>Loan Term</span>
                          <Badge variant="outline">25 years (fixed)</Badge>
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Standard loan term for SDA properties
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="interest-rate" className="flex items-center justify-between">
                          <span>Interest Rate</span>
                          <Badge variant="outline">7.2% (current rate)</Badge>
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Based on current market rates
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full btn-bounce" 
                      size="lg"
                      onClick={() => setShowResults(true)}
                    >
                      Calculate My Options
                      <CalcIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Results */}
                {showResults && results && (
                  <div className="space-y-6">
                    {/* Pathway Results */}
                    <Card className="card-elegant">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Home className="h-5 w-5 text-primary" />
                          <span>Deposit Ready Ownership</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Required Deposit (10%)</span>
                            <Badge variant={results.depositShortfall > 0 ? "destructive" : "default"}>
                              ${results.depositRequired.toLocaleString()}
                            </Badge>
                          </div>
                          {results.depositShortfall > 0 && (
                            <div className="flex justify-between">
                              <span>Deposit Shortfall</span>
                              <Badge variant="destructive">
                                ${results.depositShortfall.toLocaleString()}
                              </Badge>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Monthly Payment</span>
                            <Badge>${results.monthlyPayment.toLocaleString()}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Affordability Ratio</span>
                            <Badge variant={results.canAfford ? "default" : "destructive"}>
                              {results.affordabilityRatio.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className={`p-3 rounded-lg ${results.canAfford && results.depositShortfall === 0 ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                            <div className="font-medium">
                              {results.canAfford && results.depositShortfall === 0 
                                ? "✓ You can afford this pathway!" 
                                : "⚠ This pathway may need adjustments"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rent-to-Buy Results */}
                    {rentToBuy && (
                      <Card className="card-elegant">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-secondary" />
                            <span>Rent-to-Buy Program</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>Weekly Rent</span>
                              <Badge>${Math.round(rentToBuy.weeklyRent)}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Weekly Deposit Contribution</span>
                              <Badge>${Math.round(rentToBuy.depositContribution)}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Years to Ownership</span>
                              <Badge>{rentToBuy.yearsToOwnership} years</Badge>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                              <div className="font-medium">
                                ✓ Build your deposit while living in your home
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Equity Share Results */}
                    {equityShare && (
                      <Card className="card-elegant">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <PieChart className="h-5 w-5 text-accent" />
                            <span>Equity Share Ownership</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>Your Share</span>
                              <Badge>{equityShare.yourShare}%</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Your Deposit</span>
                              <Badge>${equityShare.yourDeposit.toLocaleString()}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Your Monthly Payment</span>
                              <Badge>${Math.round(equityShare.yourMonthlyPayment).toLocaleString()}</Badge>
                            </div>
                            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                              <div className="font-medium">
                                ✓ Reduced risk with shared ownership
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Next Steps */}
                    <Card className="card-elegant bg-gradient-to-br from-primary/5 to-secondary/5">
                      <CardContent className="p-6">
                        <h3 className="font-bold mb-4">Ready to Move Forward?</h3>
                        <div className="space-y-3">
                          <Button 
                            className="w-full btn-bounce"
                            onClick={() => window.location.href = '/consultation'}
                          >
                            Book Free Consultation
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.location.href = '/pathways'}
                          >
                            Explore Pathway Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Information Card when no results */}
                {!showResults && (
                  <Card className="card-elegant">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Info className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-4">
                        Personalized Calculations
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Enter your financial details to see customized results for all three homeownership pathways.
                      </p>
                      <ul className="text-left text-sm space-y-2 max-w-xs mx-auto">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span>Compare all pathway options</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-secondary rounded-full" />
                          <span>Calculate affordability</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span>Plan your timeline</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Calculator;