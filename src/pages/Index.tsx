
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRightIcon, CheckCircle, ShieldIcon, BarChart4Icon, Clock3Icon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/ui-custom/AnimatedButton";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { subscribeCustomer, isCustomerSubscribed } from "@/services/loan";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Test customer IDs (for development/demo)
const TEST_CUSTOMER_IDS = [
  "234774784",
  "318411216",
  "340397370",
  "366585630",
  "397178638"
];

const Index = () => {
  const navigate = useNavigate();
  const [customerNumber, setCustomerNumber] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isValidCustomerId, setIsValidCustomerId] = useState(true);

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
  };

  // Handle subscription
  const handleSubscribe = async () => {
    if (!validateCustomerId(customerNumber)) {
      toast.error("Please enter a valid customer number");
      return;
    }

    setIsSubscribing(true);
    
    try {
      const success = await subscribeCustomer(customerNumber);
      
      if (success) {
        setSubscribed(true);
        setTimeout(() => {
          navigate("/loan-application", { state: { customerNumber } });
        }, 1500);
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  // Select a test customer ID
  const selectTestCustomerId = (id: string) => {
    setCustomerNumber(id);
    validateCustomerId(id);
  };

  // Check if the customer is already subscribed (for demo purposes)
  useEffect(() => {
    if (customerNumber) {
      setSubscribed(isCustomerSubscribed(customerNumber));
    }
  }, [customerNumber]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-10 mb-10 lg:mb-0 animate-slide-up">
                <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-primary/10 rounded-full">
                  Digital Banking Simplified
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  Quick Access to <span className="text-primary">Loans</span> When You Need Them
                </h1>
                <p className="text-slate-600 mb-8 text-lg">
                  Experience seamless digital lending with our platform. Enter your customer number to get started and access funds quickly.
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                  <Input
                    type="text"
                    value={customerNumber}
                    onChange={handleCustomerNumberChange}
                    placeholder="Enter your customer number"
                    className={`flex-grow px-4 py-3 ${!isValidCustomerId ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <AnimatedButton
                    onClick={handleSubscribe}
                    loading={isSubscribing}
                    disabled={!customerNumber || !isValidCustomerId || isSubscribing || subscribed}
                    icon={subscribed ? <CheckCircle size={16} /> : <ArrowRightIcon size={16} />}
                    iconPosition="right"
                    className="whitespace-nowrap"
                  >
                    {subscribed ? "Subscribed" : "Get Started"}
                  </AnimatedButton>
                </div>
                
                {!isValidCustomerId && customerNumber && (
                  <p className="text-red-500 text-sm mt-2">
                    Please enter a valid customer number (9-12 digits)
                  </p>
                )}
                
                {/* Test customer IDs for demo */}
                <div className="mt-6">
                  <p className="text-sm text-slate-500 mb-2">For demo purposes, try one of these customer IDs:</p>
                  <div className="flex flex-wrap gap-2">
                    {TEST_CUSTOMER_IDS.map(id => (
                      <button
                        key={id}
                        onClick={() => selectTestCustomerId(id)}
                        className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded-md transition-colors"
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <GlassCard className="overflow-hidden p-6 md:p-8 transform rotate-2">
                  <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3/4 h-32 bg-gradient-to-r from-primary/80 to-primary rounded-lg shadow-lg flex items-center p-6">
                        <div className="flex-grow">
                          <div className="text-white text-xs mb-1">Current Balance</div>
                          <div className="text-white text-2xl font-semibold">KES 42,500.00</div>
                        </div>
                        <div className="text-white/80 text-xs">
                          **** **** **** 4321
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <GlassCard variant="light" intensity="high" className="p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">Loan Limit</div>
                          <div className="bg-green-500/20 text-green-600 text-xs px-2 py-1 rounded-full">
                            Eligible
                          </div>
                        </div>
                        <div className="text-2xl font-semibold">KES 50,000.00</div>
                        <div className="mt-2 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Digital Lending Platform</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                We've reimagined the lending experience to make it faster, more secure, and tailored to your needs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <Clock3Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick Approval</h3>
                <p className="text-slate-600">
                  Get loan decisions within minutes, not days. Our platform works with your bank to provide instant access to funds.
                </p>
              </Card>
              
              <Card className="p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <ShieldIcon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Process</h3>
                <p className="text-slate-600">
                  Your financial data is protected with bank-level security. We use encryption and secure connections throughout.
                </p>
              </Card>
              
              <Card className="p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <BarChart4Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Limits</h3>
                <p className="text-slate-600">
                  Our advanced scoring engine analyzes your banking history to offer you the best possible loan terms.
                </p>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="max-w-xl mx-auto mb-8">
              Join thousands of customers who are already enjoying the benefits of our digital lending platform.
            </p>
            <AnimatedButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/loan-application")}
              icon={<ArrowRightIcon size={16} />}
              iconPosition="right"
              animateOnHover={true}
            >
              Apply for a Loan Now
            </AnimatedButton>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
