
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowLeft, 
  CreditCard, 
  FileText, 
  RefreshCcw, 
  Calendar, 
  User 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AnimatedButton } from "@/components/ui-custom/AnimatedButton";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  isCustomerSubscribed, 
  getCustomerLoans, 
  getLoanById, 
  getLatestLoan, 
  addMockLoans,
  hasActiveLoan,
  LoanStatus as LoanStatusEnum,
  Loan
} from "@/services/loan";
import { getMockCustomerKYC } from "@/services/kycService";

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date function
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const LoanStatusPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get customer number and loan ID from location state if available
  const initialCustomerNumber = location.state?.customerNumber || "";
  const initialLoanId = location.state?.loanId || "";
  
  const [customerNumber, setCustomerNumber] = useState(initialCustomerNumber);
  const [isValidCustomerId, setIsValidCustomerId] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  
  // Validate customer ID format
  const validateCustomerId = (id: string) => {
    const isValid = /^\d+$/.test(id) && id.length >= 9 && id.length <= 12;
    setIsValidCustomerId(isValid || id === "");
    return isValid;
  };
  
  // Handle customer number input change
  const handleCustomerNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerNumber(value);
    validateCustomerId(value);
    setHasSubscription(false);
    setLoans([]);
    setActiveLoan(null);
  };
  
  // Check loan status
  const checkLoanStatus = () => {
    if (!validateCustomerId(customerNumber)) {
      toast.error("Please enter a valid customer number");
      return;
    }
    
    setIsChecking(true);
    
    try {
      // Check if customer is subscribed
      const isSubscribed = isCustomerSubscribed(customerNumber);
      setHasSubscription(isSubscribed);
      
      if (!isSubscribed) {
        toast.error("Customer is not subscribed to the lending service");
        return;
      }
      
      // Get customer loans
      const customerLoans = getCustomerLoans(customerNumber);
      
      // For demo purposes, add mock loans if none exist
      if (customerLoans.length === 0) {
        addMockLoans(customerNumber);
        const updatedLoans = getCustomerLoans(customerNumber);
        setLoans(updatedLoans);
      } else {
        setLoans(customerLoans);
      }
      
      // Find active loan
      const active = customerLoans.find(loan => 
        [LoanStatusEnum.PENDING, LoanStatusEnum.PROCESSING, LoanStatusEnum.APPROVED, LoanStatusEnum.DISBURSED].includes(loan.status)
      );
      
      if (active) {
        setActiveLoan(active);
      } else if (initialLoanId) {
        const specificLoan = getLoanById(initialLoanId);
        if (specificLoan) {
          setActiveLoan(specificLoan);
        }
      } else if (customerLoans.length > 0) {
        // Default to the latest loan
        setActiveLoan(customerLoans[0]);
      }
      
      toast.success("Loan information retrieved successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to check loan status";
      toast.error(errorMessage);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Refresh loan status
  const refreshLoanStatus = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      const updatedLoans = getCustomerLoans(customerNumber);
      setLoans(updatedLoans);
      
      if (activeLoan) {
        const updatedLoan = getLoanById(activeLoan.id);
        if (updatedLoan) {
          setActiveLoan(updatedLoan);
        }
      }
      
      toast.success("Loan status refreshed");
      setIsRefreshing(false);
    }, 1500);
  };
  
  // View loan details
  const viewLoanDetails = (loan: Loan) => {
    setActiveLoan(loan);
  };
  
  // Initialize from location state
  useEffect(() => {
    if (initialCustomerNumber) {
      validateCustomerId(initialCustomerNumber);
      checkLoanStatus();
    }
  }, []);
  
  // Get status badge color
  const getStatusBadgeColor = (status: LoanStatusEnum) => {
    switch (status) {
      case LoanStatusEnum.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case LoanStatusEnum.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case LoanStatusEnum.APPROVED:
        return "bg-emerald-100 text-emerald-800";
      case LoanStatusEnum.DISBURSED:
        return "bg-primary/10 text-primary";
      case LoanStatusEnum.COMPLETED:
        return "bg-slate-100 text-slate-800";
      case LoanStatusEnum.REJECTED:
        return "bg-red-100 text-red-800";
      case LoanStatusEnum.CANCELED:
        return "bg-slate-100 text-slate-800";
      case LoanStatusEnum.ERROR:
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: LoanStatusEnum) => {
    switch (status) {
      case LoanStatusEnum.PENDING:
      case LoanStatusEnum.PROCESSING:
        return <Clock size={16} />;
      case LoanStatusEnum.APPROVED:
      case LoanStatusEnum.DISBURSED:
      case LoanStatusEnum.COMPLETED:
        return <CheckCircle2 size={16} />;
      case LoanStatusEnum.REJECTED:
      case LoanStatusEnum.CANCELED:
      case LoanStatusEnum.ERROR:
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <Button
                variant="outline"
                size="sm"
                className="mb-4"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              
              <h1 className="text-3xl font-bold">Loan Status</h1>
              <p className="text-slate-600">Check the status of your loan applications and view details.</p>
            </div>
            
            {/* Customer lookup section */}
            {!hasSubscription && (
              <Card className="p-6 border border-slate-200 mb-8 animate-slide-up">
                <h2 className="text-xl font-semibold mb-4">Enter Your Customer Number</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="text"
                    value={customerNumber}
                    onChange={handleCustomerNumberChange}
                    placeholder="Enter your customer number"
                    className={`flex-grow ${!isValidCustomerId ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <AnimatedButton
                    onClick={checkLoanStatus}
                    loading={isChecking}
                    disabled={!customerNumber || !isValidCustomerId || isChecking}
                    className="whitespace-nowrap"
                  >
                    Check Status
                  </AnimatedButton>
                </div>
                
                {!isValidCustomerId && customerNumber && (
                  <p className="text-red-500 text-sm mt-2">
                    Please enter a valid customer number (9-12 digits)
                  </p>
                )}
              </Card>
            )}
            
            {/* Active loan section */}
            {hasSubscription && activeLoan && (
              <div className="space-y-8 animate-slide-up">
                <GlassCard className="p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Loan Details</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${getStatusBadgeColor(activeLoan.status)}`}>
                        {getStatusIcon(activeLoan.status)}
                        <span className="ml-1">{activeLoan.status}</span>
                      </span>
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={refreshLoanStatus}
                        disabled={isRefreshing}
                        loading={isRefreshing}
                        className="h-8"
                        icon={<RefreshCcw size={14} />}
                      >
                        Refresh
                      </AnimatedButton>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                          <FileText size={16} className="mr-1" /> Loan ID
                        </h3>
                        <p className="font-mono text-sm">{activeLoan.id}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                          <User size={16} className="mr-1" /> Customer Number
                        </h3>
                        <p className="font-mono text-sm">{activeLoan.customerNumber}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                          <CreditCard size={16} className="mr-1" /> Loan Amount
                        </h3>
                        <p className="text-xl font-semibold text-primary">{formatCurrency(activeLoan.amount)}</p>
                      </div>
                      
                      {(activeLoan.status === LoanStatusEnum.APPROVED || activeLoan.status === LoanStatusEnum.DISBURSED) && (
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-1">Repayment Amount</h3>
                          <p className="font-semibold">{formatCurrency(activeLoan.amount * 1.1)}</p>
                          <p className="text-xs text-slate-500">Due in 30 days from disbursement</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                          <Calendar size={16} className="mr-1" /> Application Date
                        </h3>
                        <p>{formatDate(activeLoan.createdAt)}</p>
                      </div>
                      
                      {activeLoan.disbursedAt && (
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                            <Calendar size={16} className="mr-1" /> Disbursement Date
                          </h3>
                          <p>{formatDate(activeLoan.disbursedAt)}</p>
                        </div>
                      )}
                      
                      {activeLoan.completedAt && (
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                            <Calendar size={16} className="mr-1" /> Completion Date
                          </h3>
                          <p>{formatDate(activeLoan.completedAt)}</p>
                        </div>
                      )}
                      
                      {activeLoan.score !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-1">Credit Score</h3>
                          <div className="flex items-center">
                            <div className="flex-grow bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  activeLoan.score > 600 ? 'bg-green-500' : 
                                  activeLoan.score > 500 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${(activeLoan.score / 850) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 font-semibold">{activeLoan.score}</span>
                          </div>
                        </div>
                      )}
                      
                      {activeLoan.limit !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-1">Credit Limit</h3>
                          <p className="font-semibold">{formatCurrency(activeLoan.limit)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {activeLoan.exclusionReason && activeLoan.status === LoanStatusEnum.REJECTED && (
                    <div className="mt-6 p-4 bg-red-50 text-red-800 rounded-md">
                      <h3 className="font-medium mb-1 flex items-center">
                        <XCircle size={16} className="mr-1" /> Rejection Reason
                      </h3>
                      <p>{activeLoan.exclusionReason}</p>
                    </div>
                  )}
                  
                  {activeLoan.status === LoanStatusEnum.DISBURSED && (
                    <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md">
                      <h3 className="font-medium mb-1 flex items-center">
                        <CheckCircle2 size={16} className="mr-1" /> Loan Disbursed
                      </h3>
                      <p>The loan has been successfully disbursed to your account.</p>
                    </div>
                  )}
                  
                  {(activeLoan.status === LoanStatusEnum.PENDING || activeLoan.status === LoanStatusEnum.PROCESSING) && (
                    <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-md">
                      <h3 className="font-medium mb-1 flex items-center">
                        <Clock size={16} className="mr-1" /> Processing
                      </h3>
                      <p>Your loan application is being processed. Please check back soon for updates.</p>
                    </div>
                  )}
                </GlassCard>
                
                {/* Previous loans */}
                {loans.length > 1 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Loan History</h2>
                    <Card className="divide-y">
                      {loans
                        .filter(loan => loan.id !== activeLoan.id)
                        .map(loan => (
                          <div 
                            key={loan.id} 
                            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => viewLoanDetails(loan)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{formatCurrency(loan.amount)}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(loan.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${getStatusBadgeColor(loan.status)}`}>
                                  {getStatusIcon(loan.status)}
                                  <span className="ml-1">{loan.status}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </Card>
                  </div>
                )}
                
                {/* Apply for a new loan button */}
                {!hasActiveLoan(customerNumber) && (
                  <div className="mt-8 text-center">
                    <p className="text-slate-600 mb-4">Ready to apply for a new loan?</p>
                    <AnimatedButton 
                      onClick={() => navigate("/loan-application", { state: { customerNumber } })}
                      animateOnHover={true}
                    >
                      Apply Now
                    </AnimatedButton>
                  </div>
                )}
              </div>
            )}
            
            {/* No loans found */}
            {hasSubscription && loans.length === 0 && (
              <GlassCard className="p-6 text-center animate-slide-up">
                <div className="my-8">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-slate-400" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Loan History Found</h3>
                  <p className="text-slate-600 mb-6">
                    You haven't applied for any loans yet. Apply now to get started.
                  </p>
                  <AnimatedButton 
                    onClick={() => navigate("/loan-application", { state: { customerNumber } })}
                    animateOnHover={true}
                  >
                    Apply for a Loan
                  </AnimatedButton>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoanStatusPage;
