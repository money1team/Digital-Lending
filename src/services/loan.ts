
import { toast } from "sonner";
import { fetchCustomerKYC, getMockCustomerKYC } from "./kycService";
import { fetchCustomerTransactions, getMockTransactions } from "./transactionService";
import { initiateScoreQuery, queryScore, registerClient, CustomerScore } from "./api";

// Client information for our LMS
const OUR_CLIENT_INFO = {
  url: window.location.origin + "/api/transactions",
  name: "Credable LMS Service",
  username: "lms_service",
  password: "secure_password_123"
};

// Our client token after registration
let clientToken: string | null = null;

// Maximum retry count for score query
const MAX_SCORE_QUERY_RETRIES = 5;

// Retry delay in milliseconds
const RETRY_DELAY = 2000;

// Loan status enum
export enum LoanStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PROCESSING = "PROCESSING",
  DISBURSED = "DISBURSED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  ERROR = "ERROR"
}

// Loan interface
export interface Loan {
  id: string;
  customerNumber: string;
  amount: number;
  status: LoanStatus;
  score?: number;
  limit?: number;
  createdAt: number;
  updatedAt: number;
  disbursedAt?: number;
  completedAt?: number;
  exclusion?: string;
  exclusionReason?: string;
}

// In-memory storage for loans (in a real app, this would be a database)
const loans: Map<string, Loan> = new Map();

// In-memory storage for customer subscriptions (in a real app, this would be a database)
const subscriptions: Set<string> = new Set();

// Check if a customer is subscribed
export const isCustomerSubscribed = (customerNumber: string): boolean => {
  return subscriptions.has(customerNumber);
};

// Subscribe a customer
export const subscribeCustomer = async (customerNumber: string): Promise<boolean> => {
  try {
    // Validate customer exists by fetching KYC data
    const customer = await fetchCustomerKYC(customerNumber);
    
    // For development/demo, use mock data if KYC fetch fails
    const customerData = customer || getMockCustomerKYC(customerNumber);
    
    if (!customerData) {
      toast.error("Failed to validate customer. Please try again.");
      return false;
    }
    
    // Add customer to subscriptions
    subscriptions.add(customerNumber);
    
    toast.success("Successfully subscribed to the lending service!");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to subscribe customer";
    toast.error(errorMessage);
    console.error("Subscription Error:", error);
    return false;
  }
};

// Unsubscribe a customer
export const unsubscribeCustomer = (customerNumber: string): boolean => {
  const wasSubscribed = subscriptions.has(customerNumber);
  subscriptions.delete(customerNumber);
  
  if (wasSubscribed) {
    toast.success("Successfully unsubscribed from the lending service.");
  }
  
  return wasSubscribed;
};

// Check if a customer has an active loan
export const hasActiveLoan = (customerNumber: string): boolean => {
  for (const loan of loans.values()) {
    if (
      loan.customerNumber === customerNumber &&
      [LoanStatus.PENDING, LoanStatus.APPROVED, LoanStatus.PROCESSING, LoanStatus.DISBURSED].includes(loan.status)
    ) {
      return true;
    }
  }
  return false;
};

// Register our client with the scoring engine
export const registerLoanClient = async (): Promise<string | null> => {
  if (clientToken) {
    return clientToken;
  }
  
  try {
    const registrationResponse = await registerClient(OUR_CLIENT_INFO);
    
    if (registrationResponse && registrationResponse.token) {
      clientToken = registrationResponse.token;
      console.log("Successfully registered client with scoring engine");
      return clientToken;
    } else {
      throw new Error("Invalid registration response");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to register loan client";
    console.error("Client Registration Error:", error);
    
    // For development/demo purposes, create a mock token
    clientToken = "mock_client_token_" + Math.random().toString(36).substring(2, 15);
    console.log("Using mock client token:", clientToken);
    return clientToken;
  }
};

// Request a loan
export const requestLoan = async (customerNumber: string, amount: number): Promise<Loan | null> => {
  try {
    // Check if customer is subscribed
    if (!isCustomerSubscribed(customerNumber)) {
      toast.error("Customer is not subscribed to the lending service.");
      return null;
    }
    
    // Check if customer already has an active loan
    if (hasActiveLoan(customerNumber)) {
      toast.error("Customer already has an active loan.");
      return null;
    }
    
    // Get client token (register if needed)
    const token = await registerLoanClient();
    
    if (!token) {
      toast.error("Failed to initialize loan service.");
      return null;
    }
    
    // Create a new loan with PENDING status
    const loanId = `LOAN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const now = Date.now();
    
    const loan: Loan = {
      id: loanId,
      customerNumber,
      amount,
      status: LoanStatus.PENDING,
      createdAt: now,
      updatedAt: now
    };
    
    // Save the loan
    loans.set(loanId, loan);
    
    // Start the scoring process asynchronously
    processLoanScoring(loan);
    
    toast.success("Loan request submitted successfully!");
    return loan;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to request loan";
    toast.error(errorMessage);
    console.error("Loan Request Error:", error);
    return null;
  }
};

// Process loan scoring asynchronously
const processLoanScoring = async (loan: Loan): Promise<void> => {
  try {
    // Update loan status to PROCESSING
    loan.status = LoanStatus.PROCESSING;
    loan.updatedAt = Date.now();
    loans.set(loan.id, loan);
    
    // Get client token
    const token = await registerLoanClient();
    
    if (!token) {
      throw new Error("Failed to get client token");
    }
    
    // Step 1: Initiate query score
    const scoreToken = await initiateScoreQuery(loan.customerNumber, token);
    
    if (!scoreToken) {
      throw new Error("Failed to initiate score query");
    }
    
    // Step 2: Query the score with retries
    let score: CustomerScore | null = null;
    let retries = 0;
    
    while (retries < MAX_SCORE_QUERY_RETRIES) {
      try {
        const result = await queryScore(scoreToken, token);
        
        if (result && result.exclusion !== "pending") {
          score = result;
          break;
        }
      } catch (error) {
        console.log(`Retry attempt ${retries + 1} failed:`, error);
      }
      
      retries++;
      
      if (retries < MAX_SCORE_QUERY_RETRIES) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    
    if (!score) {
      throw new Error("Failed to get customer score after maximum retries");
    }
    
    // Process the score and update the loan
    processFinalScore(loan, score);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed during loan scoring process";
    console.error("Loan Scoring Error:", errorMessage);
    
    // Update loan status to ERROR
    loan.status = LoanStatus.ERROR;
    loan.updatedAt = Date.now();
    loan.exclusion = "Error";
    loan.exclusionReason = errorMessage;
    loans.set(loan.id, loan);
    
    toast.error(`Loan application failed: ${errorMessage}`);
  }
};

// Process the final score and update the loan
const processFinalScore = (loan: Loan, score: CustomerScore): void => {
  loan.score = score.score;
  loan.limit = score.limitAmount;
  loan.exclusion = score.exclusion;
  loan.exclusionReason = score.exclusionReason;
  loan.updatedAt = Date.now();
  
  // Check if the customer is excluded
  if (score.exclusion !== "No Exclusion") {
    loan.status = LoanStatus.REJECTED;
    toast.error(`Loan application rejected: ${score.exclusionReason}`);
  }
  // Check if the loan amount is within the limit
  else if (loan.amount > score.limitAmount) {
    loan.status = LoanStatus.REJECTED;
    loan.exclusionReason = `Requested amount (${loan.amount}) exceeds available limit (${score.limitAmount})`;
    toast.error(`Loan application rejected: Amount exceeds limit of ${score.limitAmount}`);
  }
  // Approve the loan
  else {
    loan.status = LoanStatus.APPROVED;
    loan.disbursedAt = Date.now();
    toast.success("Loan application approved!");
    
    // Simulate disbursement after a short delay
    setTimeout(() => {
      loan.status = LoanStatus.DISBURSED;
      loan.updatedAt = Date.now();
      loans.set(loan.id, loan);
      toast.success("Loan funds have been disbursed!");
    }, 3000);
  }
  
  // Update the loan in storage
  loans.set(loan.id, loan);
};

// Get a loan by ID
export const getLoanById = (loanId: string): Loan | undefined => {
  return loans.get(loanId);
};

// Get all loans for a customer
export const getCustomerLoans = (customerNumber: string): Loan[] => {
  const customerLoans: Loan[] = [];
  
  for (const loan of loans.values()) {
    if (loan.customerNumber === customerNumber) {
      customerLoans.push(loan);
    }
  }
  
  // Sort by createdAt (newest first)
  return customerLoans.sort((a, b) => b.createdAt - a.createdAt);
};

// Get the latest loan for a customer
export const getLatestLoan = (customerNumber: string): Loan | undefined => {
  const customerLoans = getCustomerLoans(customerNumber);
  return customerLoans.length > 0 ? customerLoans[0] : undefined;
};

// For development/demo: Add some mock loans
export const addMockLoans = (customerNumber: string): void => {
  const now = Date.now();
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
  const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;
  
  // Completed loan from 10 days ago
  const completedLoan: Loan = {
    id: `LOAN${tenDaysAgo}${Math.floor(Math.random() * 1000)}`,
    customerNumber,
    amount: 15000,
    status: LoanStatus.COMPLETED,
    createdAt: tenDaysAgo,
    updatedAt: tenDaysAgo + 7 * 24 * 60 * 60 * 1000,
    disbursedAt: tenDaysAgo + 1 * 24 * 60 * 60 * 1000,
    completedAt: tenDaysAgo + 7 * 24 * 60 * 60 * 1000,
    score: 620,
    limit: 25000
  };
  
  // Rejected loan from 3 days ago
  const rejectedLoan: Loan = {
    id: `LOAN${threeDaysAgo}${Math.floor(Math.random() * 1000)}`,
    customerNumber,
    amount: 50000,
    status: LoanStatus.REJECTED,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo + 1 * 60 * 60 * 1000,
    score: 480,
    limit: 20000,
    exclusion: "Limit Exceeded",
    exclusionReason: "Requested amount exceeds available limit"
  };
  
  loans.set(completedLoan.id, completedLoan);
  loans.set(rejectedLoan.id, rejectedLoan);
};
