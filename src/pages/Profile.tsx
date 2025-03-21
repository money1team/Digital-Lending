
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Flag, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Bell,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedButton } from "@/components/ui-custom/AnimatedButton";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  isCustomerSubscribed, 
  subscribeCustomer, 
  unsubscribeCustomer, 
  getCustomerLoans 
} from "@/services/loan";
import { getMockCustomerKYC, Customer } from "@/services/kycService";
import { getMockTransactions } from "@/services/transactionService";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get customer number from location state if available
  const initialCustomerNumber = location.state?.customerNumber || "";
  
  const [customerNumber, setCustomerNumber] = useState(initialCustomerNumber);
  const [isValidCustomerId, setIsValidCustomerId] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  
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
    setIsSubscribed(false);
    setCustomerData(null);
  };
  
  // Load customer profile
  const loadCustomerProfile = async () => {
    if (!validateCustomerId(customerNumber)) {
      toast.error("Please enter a valid customer number");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if customer is subscribed
      const subscribed = isCustomerSubscribed(customerNumber);
      setIsSubscribed(subscribed);
      
      if (!subscribed) {
        const success = await subscribeCustomer(customerNumber);
        setIsSubscribed(success);
        
        if (!success) {
          throw new Error("Failed to subscribe customer");
        }
      }
      
      // Get customer data (using mock data for demo)
      const customer = getMockCustomerKYC(customerNumber);
      setCustomerData(customer);
      
      toast.success("Profile loaded successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load customer profile";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize from location state
  useEffect(() => {
    if (initialCustomerNumber) {
      validateCustomerId(initialCustomerNumber);
      loadCustomerProfile();
    }
  }, []);
  
  // Render profile lookup form
  const renderProfileLookup = () => (
    <Card className="p-6 border border-slate-200 animate-slide-up">
      <h2 className="text-xl font-semibold mb-4">Access Your Profile</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          value={customerNumber}
          onChange={handleCustomerNumberChange}
          placeholder="Enter your customer number"
          className={`flex-grow ${!isValidCustomerId ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        <AnimatedButton
          onClick={loadCustomerProfile}
          loading={isLoading}
          disabled={!customerNumber || !isValidCustomerId || isLoading}
          className="whitespace-nowrap"
        >
          View Profile
        </AnimatedButton>
      </div>
      
      {!isValidCustomerId && customerNumber && (
        <p className="text-red-500 text-sm mt-2">
          Please enter a valid customer number (9-12 digits)
        </p>
      )}
    </Card>
  );
  
  // Render customer profile
  const renderCustomerProfile = () => {
    if (!customerData) return null;
    
    // Get customer loans (for summary)
    const loans = getCustomerLoans(customerNumber);
    const completedLoans = loans.filter(loan => loan.status === "COMPLETED").length;
    const activeLoan = loans.find(loan => 
      ["PENDING", "PROCESSING", "APPROVED", "DISBURSED"].includes(loan.status)
    );
    
    // Get transaction data (for summary)
    const transactions = getMockTransactions(customerNumber);
    const avgMonthlyBalance = transactions.reduce((sum, trx) => sum + trx.monthlyBalance, 0) / transactions.length;
    
    return (
      <div className="space-y-8 animate-slide-up">
        <GlassCard className="p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="aspect-square w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <User size={36} />
              </div>
              <h2 className="text-2xl font-bold">{customerData.firstName} {customerData.lastName}</h2>
              <p className="text-slate-500 text-sm mb-4">Customer since {new Date(customerData.registrationDate).getFullYear()}</p>
              
              <div className="flex space-x-2 mb-6">
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  Active
                </span>
                <span className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full">
                  Verified
                </span>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mb-3"
                onClick={() => navigate("/loan-application", { state: { customerNumber } })}
              >
                Apply for Loan
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/loan-status", { state: { customerNumber } })}
              >
                Check Loan Status
              </Button>
            </div>
            
            <div className="md:w-2/3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <User size={14} className="mr-1" /> Customer ID
                  </p>
                  <p className="font-medium">{customerData.customerNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <Phone size={14} className="mr-1" /> Phone Number
                  </p>
                  <p className="font-medium">{customerData.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <Mail size={14} className="mr-1" /> Email
                  </p>
                  <p className="font-medium">{customerData.emailAddress || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <CreditCard size={14} className="mr-1" /> ID Number
                  </p>
                  <p className="font-medium">{customerData.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <Calendar size={14} className="mr-1" /> Date of Birth
                  </p>
                  <p className="font-medium">{new Date(customerData.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <Flag size={14} className="mr-1" /> Country
                  </p>
                  <p className="font-medium">{customerData.country}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <MapPin size={14} className="mr-1" /> Address
                  </p>
                  <p className="font-medium">
                    {customerData.address ? `${customerData.address}, ${customerData.city}` : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center mb-1">
                    <Clock size={14} className="mr-1" /> Registration Date
                  </p>
                  <p className="font-medium">{new Date(customerData.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 border border-slate-200 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">Credit Summary</h3>
                  <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">Good</div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Avg. Monthly Balance</p>
                    <p className="font-semibold">
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(avgMonthlyBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Completed Loans</p>
                    <p className="font-semibold">{completedLoans}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active Loans</p>
                    <p className="font-semibold">{activeLoan ? 1 : 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5 border border-slate-200 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">Recent Activity</h3>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
                <div className="space-y-3">
                  {loans.slice(0, 3).map((loan, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Loan {loan.status.toLowerCase()}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(loan.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(loan.amount)}
                      </p>
                    </div>
                  ))}
                  
                  {loans.length === 0 && (
                    <p className="text-sm text-slate-500 py-2">No recent activity</p>
                  )}
                </div>
              </Card>
              
              <Card className="p-5 border border-slate-200 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">Quick Actions</h3>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <ShieldCheck size={16} className="mr-2" />
                    Verify Identity
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell size={16} className="mr-2" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle size={16} className="mr-2" />
                    Help & Support
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="loans" className="mt-6">
            <Card className="p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Loan History</h3>
              
              {loans.length > 0 ? (
                <div className="divide-y">
                  {loans.map((loan, index) => (
                    <div key={index} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(loan.amount)}
                        </p>
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock size={14} className="mr-1" />
                          <span>{new Date(loan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          loan.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                          loan.status === "REJECTED" ? "bg-red-100 text-red-800" :
                          loan.status === "DISBURSED" ? "bg-primary/10 text-primary" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {loan.status}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => navigate("/loan-status", { state: { customerNumber, loanId: loan.id } })}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="text-slate-400" size={24} />
                  </div>
                  <h4 className="text-lg font-medium mb-2">No Loan History</h4>
                  <p className="text-slate-500 mb-4">You haven't taken any loans yet.</p>
                  <Button 
                    onClick={() => navigate("/loan-application", { state: { customerNumber } })}
                  >
                    Apply for a Loan
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card className="border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                <p className="text-slate-500 mb-6">Manage your account preferences and settings.</p>
              </div>
              
              <div className="divide-y">
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-slate-500">Manage your notification preferences</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings size={16} className="mr-2" />
                    Configure
                  </Button>
                </div>
                
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Security</h4>
                    <p className="text-sm text-slate-500">Password and authentication settings</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ShieldCheck size={16} className="mr-2" />
                    Manage
                  </Button>
                </div>
                
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Subscription</h4>
                    <p className="text-sm text-slate-500">Manage your lending service subscription</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      unsubscribeCustomer(customerNumber);
                      setIsSubscribed(false);
                      setCustomerData(null);
                      toast.success("Successfully unsubscribed from the lending service");
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Unsubscribe
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Customer Profile</h1>
              <p className="text-slate-600">Access and manage your personal information and loan history.</p>
            </div>
            
            {!isSubscribed || !customerData ? renderProfileLookup() : renderCustomerProfile()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
