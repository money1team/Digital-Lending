
import { toast } from "sonner";
import { createTransactionSoapEnvelope, callSoapApi, parseXMLToJSON } from "./api";

// Transaction SOAP URL
const TRANSACTION_SOAP_URL = "https://trxapitest.credable.io/service/transactionWsdl.wsdl";

// Transaction data interface
export interface Transaction {
  accountNumber: string;
  alternativechanneltrnscrAmount: number;
  alternativechanneltrnscrNumber: number;
  alternativechanneltrnsdebitAmount: number;
  alternativechanneltrnsdebitNumber: number;
  atmTransactionsNumber: number;
  atmtransactionsAmount: number;
  bouncedChequesDebitNumber: number;
  bouncedchequescreditNumber: number;
  bouncedchequetransactionscrAmount: number;
  bouncedchequetransactionsdrAmount: number;
  chequeDebitTransactionsAmount: number;
  chequeDebitTransactionsNumber: number;
  createdAt: number;
  createdDate: number;
  credittransactionsAmount: number;
  debitcardpostransactionsAmount: number;
  debitcardpostransactionsNumber: number;
  fincominglocaltransactioncrAmount: number;
  id: number;
  incominginternationaltrncrAmount: number;
  incominginternationaltrncrNumber: number;
  incominglocaltransactioncrNumber: number;
  intrestAmount: number;
  lastTransactionDate: number;
  lastTransactionType: string | null;
  lastTransactionValue: number;
  maxAtmTransactions: number;
  maxMonthlyBebitTransactions: number;
  maxalternativechanneltrnscr: number;
  maxalternativechanneltrnsdebit: number;
  maxbouncedchequetransactionscr: number;
  maxchequedebittransactions: number;
  maxdebitcardpostransactions: number;
  maxincominginternationaltrncr: number;
  maxincominglocaltransactioncr: number;
  maxmobilemoneycredittrn: number;
  maxmobilemoneydebittransaction: number;
  maxmonthlycredittransactions: number;
  maxoutgoinginttrndebit: number;
  maxoutgoinglocaltrndebit: number;
  maxoverthecounterwithdrawals: number;
  minAtmTransactions: number;
  minMonthlyDebitTransactions: number;
  minalternativechanneltrnscr: number;
  minalternativechanneltrnsdebit: number;
  minbouncedchequetransactionscr: number;
  minchequedebittransactions: number;
  mindebitcardpostransactions: number;
  minincominginternationaltrncr: number;
  minincominglocaltransactioncr: number;
  minmobilemoneycredittrn: number;
  minmobilemoneydebittransaction: number;
  minmonthlycredittransactions: number;
  minoutgoinginttrndebit: number;
  minoutgoinglocaltrndebit: number;
  minoverthecounterwithdrawals: number;
  mobilemoneycredittransactionAmount: number;
  mobilemoneycredittransactionNumber: number;
  mobilemoneydebittransactionAmount: number;
  mobilemoneydebittransactionNumber: number;
  monthlyBalance: number;
  monthlydebittransactionsAmount: number;
  outgoinginttransactiondebitAmount: number;
  outgoinginttrndebitNumber: number;
  outgoinglocaltransactiondebitAmount: number;
  outgoinglocaltransactiondebitNumber: number;
  overdraftLimit: number;
  overthecounterwithdrawalsAmount: number;
  overthecounterwithdrawalsNumber: number;
  transactionValue: number;
  updatedAt: number;
}

// Fetch customer transaction data
export const fetchCustomerTransactions = async (customerNumber: string): Promise<Transaction[]> => {
  try {
    const soapEnvelope = createTransactionSoapEnvelope(customerNumber);
    const response = await callSoapApi(TRANSACTION_SOAP_URL, soapEnvelope);
    
    // Parse the XML response to extract transaction data
    const responseObj = parseXMLToJSON(response);
    
    // Extract the transaction details from the SOAP response
    // Note: The actual structure might be different based on the actual SOAP response
    // This is a simplified example and might need adjustments
    const soapBody = responseObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
    const transactionResponse = soapBody["ns2:TransactionResponse"];
    
    if (!transactionResponse || !transactionResponse["ns2:transactions"]) {
      toast.error("Invalid transaction response format");
      return [];
    }
    
    // The transactions might be a single object or an array of objects
    let transactions = transactionResponse["ns2:transactions"];
    if (!Array.isArray(transactions)) {
      transactions = [transactions];
    }
    
    // Map the transactions to our Transaction interface
    // This mapping might need adjustments based on the actual response structure
    return transactions.map((trx: any) => ({
      accountNumber: trx["ns2:accountNumber"] || "",
      alternativechanneltrnscrAmount: parseFloat(trx["ns2:alternativechanneltrnscrAmount"] || "0"),
      alternativechanneltrnscrNumber: parseInt(trx["ns2:alternativechanneltrnscrNumber"] || "0"),
      alternativechanneltrnsdebitAmount: parseFloat(trx["ns2:alternativechanneltrnsdebitAmount"] || "0"),
      alternativechanneltrnsdebitNumber: parseInt(trx["ns2:alternativechanneltrnsdebitNumber"] || "0"),
      atmTransactionsNumber: parseInt(trx["ns2:atmTransactionsNumber"] || "0"),
      atmtransactionsAmount: parseFloat(trx["ns2:atmtransactionsAmount"] || "0"),
      bouncedChequesDebitNumber: parseInt(trx["ns2:bouncedChequesDebitNumber"] || "0"),
      bouncedchequescreditNumber: parseInt(trx["ns2:bouncedchequescreditNumber"] || "0"),
      bouncedchequetransactionscrAmount: parseFloat(trx["ns2:bouncedchequetransactionscrAmount"] || "0"),
      bouncedchequetransactionsdrAmount: parseFloat(trx["ns2:bouncedchequetransactionsdrAmount"] || "0"),
      chequeDebitTransactionsAmount: parseFloat(trx["ns2:chequeDebitTransactionsAmount"] || "0"),
      chequeDebitTransactionsNumber: parseInt(trx["ns2:chequeDebitTransactionsNumber"] || "0"),
      createdAt: parseInt(trx["ns2:createdAt"] || "0"),
      createdDate: parseInt(trx["ns2:createdDate"] || "0"),
      credittransactionsAmount: parseFloat(trx["ns2:credittransactionsAmount"] || "0"),
      debitcardpostransactionsAmount: parseFloat(trx["ns2:debitcardpostransactionsAmount"] || "0"),
      debitcardpostransactionsNumber: parseInt(trx["ns2:debitcardpostransactionsNumber"] || "0"),
      fincominglocaltransactioncrAmount: parseFloat(trx["ns2:fincominglocaltransactioncrAmount"] || "0"),
      id: parseInt(trx["ns2:id"] || "0"),
      incominginternationaltrncrAmount: parseFloat(trx["ns2:incominginternationaltrncrAmount"] || "0"),
      incominginternationaltrncrNumber: parseInt(trx["ns2:incominginternationaltrncrNumber"] || "0"),
      incominglocaltransactioncrNumber: parseInt(trx["ns2:incominglocaltransactioncrNumber"] || "0"),
      intrestAmount: parseFloat(trx["ns2:intrestAmount"] || "0"),
      lastTransactionDate: parseInt(trx["ns2:lastTransactionDate"] || "0"),
      lastTransactionType: trx["ns2:lastTransactionType"] || null,
      lastTransactionValue: parseFloat(trx["ns2:lastTransactionValue"] || "0"),
      maxAtmTransactions: parseFloat(trx["ns2:maxAtmTransactions"] || "0"),
      maxMonthlyBebitTransactions: parseFloat(trx["ns2:maxMonthlyBebitTransactions"] || "0"),
      maxalternativechanneltrnscr: parseFloat(trx["ns2:maxalternativechanneltrnscr"] || "0"),
      maxalternativechanneltrnsdebit: parseFloat(trx["ns2:maxalternativechanneltrnsdebit"] || "0"),
      maxbouncedchequetransactionscr: parseFloat(trx["ns2:maxbouncedchequetransactionscr"] || "0"),
      maxchequedebittransactions: parseFloat(trx["ns2:maxchequedebittransactions"] || "0"),
      maxdebitcardpostransactions: parseFloat(trx["ns2:maxdebitcardpostransactions"] || "0"),
      maxincominginternationaltrncr: parseFloat(trx["ns2:maxincominginternationaltrncr"] || "0"),
      maxincominglocaltransactioncr: parseFloat(trx["ns2:maxincominglocaltransactioncr"] || "0"),
      maxmobilemoneycredittrn: parseFloat(trx["ns2:maxmobilemoneycredittrn"] || "0"),
      maxmobilemoneydebittransaction: parseFloat(trx["ns2:maxmobilemoneydebittransaction"] || "0"),
      maxmonthlycredittransactions: parseFloat(trx["ns2:maxmonthlycredittransactions"] || "0"),
      maxoutgoinginttrndebit: parseFloat(trx["ns2:maxoutgoinginttrndebit"] || "0"),
      maxoutgoinglocaltrndebit: parseFloat(trx["ns2:maxoutgoinglocaltrndebit"] || "0"),
      maxoverthecounterwithdrawals: parseFloat(trx["ns2:maxoverthecounterwithdrawals"] || "0"),
      minAtmTransactions: parseFloat(trx["ns2:minAtmTransactions"] || "0"),
      minMonthlyDebitTransactions: parseFloat(trx["ns2:minMonthlyDebitTransactions"] || "0"),
      minalternativechanneltrnscr: parseFloat(trx["ns2:minalternativechanneltrnscr"] || "0"),
      minalternativechanneltrnsdebit: parseFloat(trx["ns2:minalternativechanneltrnsdebit"] || "0"),
      minbouncedchequetransactionscr: parseFloat(trx["ns2:minbouncedchequetransactionscr"] || "0"),
      minchequedebittransactions: parseFloat(trx["ns2:minchequedebittransactions"] || "0"),
      mindebitcardpostransactions: parseFloat(trx["ns2:mindebitcardpostransactions"] || "0"),
      minincominginternationaltrncr: parseFloat(trx["ns2:minincominginternationaltrncr"] || "0"),
      minincominglocaltransactioncr: parseFloat(trx["ns2:minincominglocaltransactioncr"] || "0"),
      minmobilemoneycredittrn: parseFloat(trx["ns2:minmobilemoneycredittrn"] || "0"),
      minmobilemoneydebittransaction: parseFloat(trx["ns2:minmobilemoneydebittransaction"] || "0"),
      minmonthlycredittransactions: parseFloat(trx["ns2:minmonthlycredittransactions"] || "0"),
      minoutgoinginttrndebit: parseFloat(trx["ns2:minoutgoinginttrndebit"] || "0"),
      minoutgoinglocaltrndebit: parseFloat(trx["ns2:minoutgoinglocaltrndebit"] || "0"),
      minoverthecounterwithdrawals: parseFloat(trx["ns2:minoverthecounterwithdrawals"] || "0"),
      mobilemoneycredittransactionAmount: parseFloat(trx["ns2:mobilemoneycredittransactionAmount"] || "0"),
      mobilemoneycredittransactionNumber: parseInt(trx["ns2:mobilemoneycredittransactionNumber"] || "0"),
      mobilemoneydebittransactionAmount: parseFloat(trx["ns2:mobilemoneydebittransactionAmount"] || "0"),
      mobilemoneydebittransactionNumber: parseInt(trx["ns2:mobilemoneydebittransactionNumber"] || "0"),
      monthlyBalance: parseFloat(trx["ns2:monthlyBalance"] || "0"),
      monthlydebittransactionsAmount: parseFloat(trx["ns2:monthlydebittransactionsAmount"] || "0"),
      outgoinginttransactiondebitAmount: parseFloat(trx["ns2:outgoinginttransactiondebitAmount"] || "0"),
      outgoinginttrndebitNumber: parseInt(trx["ns2:outgoinginttrndebitNumber"] || "0"),
      outgoinglocaltransactiondebitAmount: parseFloat(trx["ns2:outgoinglocaltransactiondebitAmount"] || "0"),
      outgoinglocaltransactiondebitNumber: parseInt(trx["ns2:outgoinglocaltransactiondebitNumber"] || "0"),
      overdraftLimit: parseFloat(trx["ns2:overdraftLimit"] || "0"),
      overthecounterwithdrawalsAmount: parseFloat(trx["ns2:overthecounterwithdrawalsAmount"] || "0"),
      overthecounterwithdrawalsNumber: parseInt(trx["ns2:overthecounterwithdrawalsNumber"] || "0"),
      transactionValue: parseFloat(trx["ns2:transactionValue"] || "0"),
      updatedAt: parseInt(trx["ns2:updatedAt"] || "0"),
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch transaction data";
    toast.error(errorMessage);
    console.error("Transaction API Error:", error);
    return [];
  }
};

// Expose transactions to the scoring engine
export const exposeTransactionData = (transactions: Transaction[]): Transaction[] => {
  // This function would be used as the endpoint handler for the scoring engine
  // We're just returning the data as-is for simplicity
  return transactions;
};

// For development/demo purposes: mock transaction data based on the example provided
export const getMockTransactions = (customerNumber: string): Transaction[] => {
  // Generate some variation based on the customer number to make the mock data more realistic
  const hash = customerNumber.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const variationFactor = (Math.abs(hash) % 20) / 10 + 0.5; // Between 0.5 and 2.5
  
  return [
    {
      accountNumber: `332216783322167555${customerNumber.substring(0, 6)}`,
      alternativechanneltrnscrAmount: 87988.2441 * variationFactor,
      alternativechanneltrnscrNumber: 0,
      alternativechanneltrnsdebitAmount: 675.3423 * variationFactor,
      alternativechanneltrnsdebitNumber: 902403930,
      atmTransactionsNumber: 4812921,
      atmtransactionsAmount: 561.96661249 * variationFactor,
      bouncedChequesDebitNumber: 8,
      bouncedchequescreditNumber: 0,
      bouncedchequetransactionscrAmount: 748011.19 * variationFactor,
      bouncedchequetransactionsdrAmount: 43345.569028578 * variationFactor,
      chequeDebitTransactionsAmount: 4.6933076819151E8 * variationFactor,
      chequeDebitTransactionsNumber: 44,
      createdAt: 740243532000,
      createdDate: 1196266216000,
      credittransactionsAmount: 609.297663 * variationFactor,
      debitcardpostransactionsAmount: 21.134264 * variationFactor,
      debitcardpostransactionsNumber: 502,
      fincominglocaltransactioncrAmount: 0.0,
      id: 2,
      incominginternationaltrncrAmount: 70.52733936 * variationFactor,
      incominginternationaltrncrNumber: 9,
      incominglocaltransactioncrNumber: 876,
      intrestAmount: 310118,
      lastTransactionDate: 1169339429000,
      lastTransactionType: null,
      lastTransactionValue: 3,
      maxAtmTransactions: 6.0,
      maxMonthlyBebitTransactions: 5.66201073E8 * variationFactor,
      maxalternativechanneltrnscr: 0.0,
      maxalternativechanneltrnsdebit: 0.0,
      maxbouncedchequetransactionscr: 0.0,
      maxchequedebittransactions: 0.0,
      maxdebitcardpostransactions: 5.18696078798654E15 * variationFactor,
      maxincominginternationaltrncr: 0.0,
      maxincominglocaltransactioncr: 0.0,
      maxmobilemoneycredittrn: 0.0,
      maxmobilemoneydebittransaction: 0.0,
      maxmonthlycredittransactions: 0.0,
      maxoutgoinginttrndebit: 0.0,
      maxoutgoinglocaltrndebit: 0.0,
      maxoverthecounterwithdrawals: 959858.0 * variationFactor,
      minAtmTransactions: 0.0,
      minMonthlyDebitTransactions: 0.0,
      minalternativechanneltrnscr: 0.0,
      minalternativechanneltrnsdebit: 0.0,
      minbouncedchequetransactionscr: 0.0,
      minchequedebittransactions: 0.0,
      mindebitcardpostransactions: 4.539102239610779E15 * variationFactor,
      minincominginternationaltrncr: 0.0,
      minincominglocaltransactioncr: 0.0,
      minmobilemoneycredittrn: 0.0,
      minmobilemoneydebittransaction: 524.0 * variationFactor,
      minmonthlycredittransactions: 0.0,
      minoutgoinginttrndebit: 0.0,
      minoutgoinglocaltrndebit: 0.0,
      minoverthecounterwithdrawals: 5821338.0 * variationFactor,
      mobilemoneycredittransactionAmount: 0.0,
      mobilemoneycredittransactionNumber: 946843,
      mobilemoneydebittransactionAmount: 0.0,
      mobilemoneydebittransactionNumber: 5523407,
      monthlyBalance: 6.59722841E8 * variationFactor,
      monthlydebittransactionsAmount: 103262.90429936 * variationFactor,
      outgoinginttransactiondebitAmount: 5.473303560725E7 * variationFactor,
      outgoinginttrndebitNumber: 646,
      outgoinglocaltransactiondebitAmount: 565972.1236 * variationFactor,
      outgoinglocaltransactiondebitNumber: 2971,
      overdraftLimit: 0.0,
      overthecounterwithdrawalsAmount: 332.0 * variationFactor,
      overthecounterwithdrawalsNumber: 87569,
      transactionValue: 1.0,
      updatedAt: 773556430000
    },
    {
      accountNumber: `332216783322167555${customerNumber.substring(0, 6)}`,
      alternativechanneltrnscrAmount: 27665.6889301 * variationFactor,
      alternativechanneltrnscrNumber: 0,
      alternativechanneltrnsdebitAmount: 2.9997265951905E7 * variationFactor,
      alternativechanneltrnsdebitNumber: 114,
      atmTransactionsNumber: 36934417,
      atmtransactionsAmount: 192538.94 * variationFactor,
      bouncedChequesDebitNumber: 535,
      bouncedchequescreditNumber: 0,
      bouncedchequetransactionscrAmount: 1.37 * variationFactor,
      bouncedchequetransactionsdrAmount: 2602.4 * variationFactor,
      chequeDebitTransactionsAmount: 2765.57 * variationFactor,
      chequeDebitTransactionsNumber: 6,
      createdAt: 1401263420000,
      createdDate: 1350538588000,
      credittransactionsAmount: 0.0,
      debitcardpostransactionsAmount: 117347.063 * variationFactor,
      debitcardpostransactionsNumber: 931309756,
      fincominglocaltransactioncrAmount: 2552389.4 * variationFactor,
      id: 5,
      incominginternationaltrncrAmount: 76.160425 * variationFactor,
      incominginternationaltrncrNumber: 285700400,
      incominglocaltransactioncrNumber: 1,
      intrestAmount: 22,
      lastTransactionDate: 554704439000,
      lastTransactionType: null,
      lastTransactionValue: 1,
      maxAtmTransactions: 0.0,
      maxMonthlyBebitTransactions: 7.8272009E7 * variationFactor,
      maxalternativechanneltrnscr: 0.0,
      maxalternativechanneltrnsdebit: 0.0,
      maxbouncedchequetransactionscr: 0.0,
      maxchequedebittransactions: 0.0,
      maxdebitcardpostransactions: 5.468080253826023E15 * variationFactor,
      maxincominginternationaltrncr: 0.0,
      maxincominglocaltransactioncr: 0.0,
      maxmobilemoneycredittrn: 0.0,
      maxmobilemoneydebittransaction: 0.0,
      maxmonthlycredittransactions: 0.0,
      maxoutgoinginttrndebit: 0.0,
      maxoutgoinglocaltrndebit: 0.0,
      maxoverthecounterwithdrawals: 6.09866462E8 * variationFactor,
      minAtmTransactions: 0.0,
      minMonthlyDebitTransactions: 0.0,
      minalternativechanneltrnscr: 0.0,
      minalternativechanneltrnsdebit: 0.0,
      minbouncedchequetransactionscr: 0.0,
      minchequedebittransactions: 0.0,
      mindebitcardpostransactions: 4.716295906413E12 * variationFactor,
      minincominginternationaltrncr: 0.0,
      minincominglocaltransactioncr: 0.0,
      minmobilemoneycredittrn: 0.0,
      minmobilemoneydebittransaction: 0.0,
      minmonthlycredittransactions: 29624.78 * variationFactor,
      minoutgoinginttrndebit: 0.0,
      minoutgoinglocaltrndebit: 0.0,
      minoverthecounterwithdrawals: 1.00927826E8 * variationFactor,
      mobilemoneycredittransactionAmount: 349693.8071922 * variationFactor,
      mobilemoneycredittransactionNumber: 4092,
      mobilemoneydebittransactionAmount: 1.87382823746E7 * variationFactor,
      mobilemoneydebittransactionNumber: 0,
      monthlyBalance: 2205.0 * variationFactor,
      monthlydebittransactionsAmount: 295.6677 * variationFactor,
      outgoinginttransactiondebitAmount: 9.561730814 * variationFactor,
      outgoinginttrndebitNumber: 0,
      outgoinglocaltransactiondebitAmount: 56.03 * variationFactor,
      outgoinglocaltransactiondebitNumber: 0,
      overdraftLimit: 7.0,
      overthecounterwithdrawalsAmount: 3.72849038239E8 * variationFactor,
      overthecounterwithdrawalsNumber: 546382904,
      transactionValue: 51.0,
      updatedAt: 687774305000
    }
  ];
};
