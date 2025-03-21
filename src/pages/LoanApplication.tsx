
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { 
  CircleDollarSign, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { AnimatedButton } from "@/components/ui-custom/AnimatedButton";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  isCustomerSubscribed, 
  hasActiveLoan, 
  subscribeCustomer, 
  requestLoan 
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

const LoanApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get customer number from location state if available
  const initialCustomerNumber = location.state?.customerNumber || "";
  
  const [step, setStep] = useState(1);
  const [customerNumber, setCustomerNumber] = useState(initialCustomerNumber);
  const [loanAmount, setLoanAmount] = useState(5000);
  const [minAmount] = useState(1000);
  const [maxAmount] = useState(50000);
  const [isValidCustomerId, setIsValidCustomerId] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingLoan, setHasExistingLoan] = useState(false);
  
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
    setIsVerified(false);
    setHasExistingLoan(false);
  };
  
  // Handle loan amount change
  const handleLoanAmountChange = (value: number[]) => {
    setLoanAmount(value[0]);
  };
  
  // Verify customer
  const verifyCustomer = async () => {
    if (!validateCustomerId(customerNumber)) {
      toast.error("Please enter a valid customer number");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Check if customer is subscribed
      let isSubscribed = isCustomerSubscribed(customerNumber);
      
      // If not subscribed, try to subscribe
      if (!isSubscribed) {
        isSubscribed = await subscribeCustomer(customerNumber);
        
        if (!isSubscribed) {
          toast.error("Failed to verify customer. Please try again.");
          return;
        }
      }
      
      // Check if customer has an active loan
      const hasLoan = hasActiveLoan(customerNumber);
      setHasExistingLoan(hasLoan);
      
      if (hasLoan) {
        toast.error("You already have an active loan. Please complete it before applying for a new one.");
      } else {
        setIsVerified(true);
        toast.success("Customer verified successfully!");
        
        // Move to next step after verification
        setTimeout(() => {
          setStep(2);
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to verify customer";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Submit loan application
  const submitLoanApplication = async () => {
    if (!isVerified || hasExistingLoan) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const loan = await requestLoan(customerNumber, loanAmount);
      
      if (loan) {
        toast.success("Loan application submitted successfully!");
        
        // Navigate to loan status page
        setTimeout(() => {
          navigate("/loan-status", { state: { customerNumber, loanId: loan.id } });
        }, 1500);
      } else {
        toast.error("Failed to submit loan application. Please try again.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit loan application";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Initialize from location state
  useEffect(() => {
    if (initialCustomerNumber) {
      validateCustomerId(initialCustomerNumber);
    }
  }, [initialCustomerNumber]);
  
  // Customer verification step
  const renderStep1 = () => (
    <div className="max-w-xl mx-auto animate-slide-up">
      <Card className="p-6 md:p-8 border border-slate-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Verify Your Customer ID</h2>
          <p className="text-slate-600">Enter your customer number to get started with your loan application.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="customerNumber" className="block text-sm font-medium text-slate-700 mb-1">
              Customer Number
            </label>
            <Input
              id="customerNumber"
              type="text"
              value={customerNumber}
              onChange={handleCustomerNumberChange}
              placeholder="Enter your customer number"
              className={`w-full ${!isValidCustomerId ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {!isValidCustomerId && customerNumber && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid customer number (9-12 digits)
              </p>
            )}
          </div>
          
          <AnimatedButton
            onClick={verifyCustomer}
            disabled={!customerNumber || !isValidCustomerId || isProcessing || isVerified && hasExistingLoan}
            loading={isProcessing}
            className="w-full"
            icon={isVerified ? <CheckCircle size={16} /> : <ArrowRight size={16} />}
            iconPosition="right"
          >
            {isVerified ? (hasExistingLoan ? "Active Loan Exists" : "Verified") : "Verify & Continue"}
          </AnimatedButton>
          
          {isVerified && hasExistingLoan && (
            <div className="flex items-start p-4 bg-amber-50 text-amber-800 rounded-md">
              <AlertCircle className="shrink-0 mt-0.5 mr-2" size={18} />
              <div>
                <p className="font-medium">You have an active loan</p>
                <p className="text-sm">Please complete your current loan before applying for a new one.</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate("/loan-status", { state: { customerNumber } })}
                >
                  Check loan status
                </Button>
              </div>
            </div>
          )}
          
          {isVerified && !hasExistingLoan && (
            <div className="flex items-start p-4 bg-green-50 text-green-800 rounded-md">
              <ShieldCheck className="shrink-0 mt-0.5 mr-2" size={18} />
              <div>
                <p className="font-medium">Identity Verified</p>
                <p className="text-sm">Your customer identity has been verified successfully.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
  
  // Loan amount selection step
  const renderStep2 = () => {
    // Get mock customer data for demo
    const customer = getMockCustomerKYC(customerNumber);
    
    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <Card className="p-6 md:p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Loan Application</h2>
            <p className="text-slate-600">Select your desired loan amount and review the details.</p>
          </div>
          
          <div className="space-y-8">
            {/* Customer Info */}
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="flex items-center mb-4">
                <User className="mr-2 text-slate-500" size={20} />
                <h3 className="text-lg font-medium">Customer Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Customer ID</p>
                  <p className="font-medium">{customerNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">Name</p>
                  <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Phone Number</p>
                  <p className="font-medium">{customer.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">ID Number</p>
                  <p className="font-medium">{customer.idNumber}</p>
                </div>
              </div>
            </div>
            
            {/* Loan Amount Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="loanAmount" className="block text-sm font-medium text-slate-700">
                  Loan Amount
                </label>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              
              <Slider
                id="loanAmount"
                defaultValue={[loanAmount]}
                max={maxAmount}
                min={minAmount}
                step={1000}
                onValueChange={handleLoanAmountChange}
                className="my-6"
              />
              
              <div className="flex justify-between text-sm text-slate-500">
                <span>{formatCurrency(minAmount)}</span>
                <span>{formatCurrency(maxAmount)}</span>
              </div>
            </div>
            
            {/* Loan Summary */}
            <GlassCard className="p-5 mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CircleDollarSign className="mr-2 text-primary" size={20} />
                Loan Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Principal Amount</span>
                  <span className="font-medium">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Interest Rate</span>
                  <span className="font-medium">10% p.a.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Loan Duration</span>
                  <span className="font-medium">30 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Processing Fee</span>
                  <span className="font-medium">{formatCurrency(loanAmount * 0.01)}</span>
                </div>
                
                <div className="border-t border-slate-200 my-2 pt-2"></div>
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Repayment</span>
                  <span className="text-primary">{formatCurrency(loanAmount * 1.1)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Repayment Date</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </GlassCard>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <AnimatedButton
                onClick={submitLoanApplication}
                loading={isSubmitting}
                className="flex-1"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Submit Application
              </AnimatedButton>
            </div>
          </div>
        </Card>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Need help? Contact our support team at{" "}
            <a href="mailto:support@credable.com" className="text-primary hover:underline">
              support@credable.com
            </a>
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Progress steps */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  1
                </div>
                <span className="text-sm mt-1">Verification</span>
              </div>
              
              <div className="flex-1 h-1 mx-4 rounded-full overflow-hidden bg-slate-200">
                <div className={`h-full bg-primary transition-all duration-500 ease-in-out ${
                  step >= 2 ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  2
                </div>
                <span className="text-sm mt-1">Application</span>
              </div>
            </div>
          </div>
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoanApplication;
