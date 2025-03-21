
import { toast } from "sonner";
import { createKYCSoapEnvelope, callSoapApi, parseXMLToJSON } from "./api";

// KYC SOAP URL
const KYC_SOAP_URL = "https://kycapitest.credable.io/service/customerWsdl.wsdl";

// Customer interface representing KYC data
export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress?: string;
  idNumber: string;
  dateOfBirth: string;
  address?: string;
  city?: string;
  country: string;
  registrationDate: string;
}

// Fetch customer KYC information
export const fetchCustomerKYC = async (customerNumber: string): Promise<Customer | null> => {
  try {
    console.log("Fetching KYC data for customer:", customerNumber);
    const soapEnvelope = createKYCSoapEnvelope(customerNumber);
    const response = await callSoapApi(KYC_SOAP_URL, soapEnvelope);
    
    // Parse the XML response to extract customer data
    const responseObj = parseXMLToJSON(response);
    console.log("KYC response object:", JSON.stringify(responseObj, null, 2));
    
    // Extract the customer details from the SOAP response
    const soapBody = responseObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
    const customerResponse = soapBody["ns2:CustomerResponse"];
    
    if (!customerResponse) {
      toast.error("Invalid KYC response format");
      console.error("Invalid KYC response format", responseObj);
      return null;
    }
    
    // Extract and format the customer data
    const customer: Customer = {
      id: customerResponse["ns2:id"] || "",
      customerNumber: customerResponse["ns2:customerNumber"] || customerNumber,
      firstName: customerResponse["ns2:firstName"] || "",
      lastName: customerResponse["ns2:lastName"] || "",
      phoneNumber: customerResponse["ns2:phoneNumber"] || "",
      emailAddress: customerResponse["ns2:emailAddress"] || undefined,
      idNumber: customerResponse["ns2:idNumber"] || "",
      dateOfBirth: customerResponse["ns2:dateOfBirth"] || "",
      address: customerResponse["ns2:address"] || undefined,
      city: customerResponse["ns2:city"] || undefined,
      country: customerResponse["ns2:country"] || "",
      registrationDate: customerResponse["ns2:registrationDate"] || ""
    };
    
    console.log("Parsed customer data:", customer);
    return customer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch customer KYC data";
    toast.error(errorMessage);
    console.error("KYC API Error:", error);
    
    // For development/demo - fallback to mock data when API fails
    console.log("Falling back to mock KYC data for", customerNumber);
    return getMockCustomerKYC(customerNumber);
  }
};

// For development/demo purposes: mock customer data
export const getMockCustomerKYC = (customerNumber: string): Customer => {
  // Generate consistent mock data based on the customer number
  const hash = customerNumber.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const firstNames = ["John", "Sarah", "Michael", "Emma", "David"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
  const cities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
  
  const fnIndex = Math.abs(hash) % firstNames.length;
  const lnIndex = Math.abs(hash * 2) % lastNames.length;
  const cityIndex = Math.abs(hash * 3) % cities.length;
  
  const regDate = new Date();
  regDate.setMonth(regDate.getMonth() - (Math.abs(hash) % 24)); // Registration between 0-24 months ago
  
  const customer: Customer = {
    id: `ID${Math.abs(hash).toString().substring(0, 8)}`,
    customerNumber,
    firstName: firstNames[fnIndex],
    lastName: lastNames[lnIndex],
    phoneNumber: `+254${Math.abs(hash).toString().substring(0, 9)}`,
    emailAddress: `${firstNames[fnIndex].toLowerCase()}.${lastNames[lnIndex].toLowerCase()}@example.com`,
    idNumber: `${Math.abs(hash).toString().substring(0, 8)}`,
    dateOfBirth: new Date(1970 + (Math.abs(hash) % 40), Math.abs(hash * 4) % 12, Math.abs(hash * 5) % 28).toISOString().split('T')[0],
    address: `${Math.abs(hash * 6) % 1000} Main Street`,
    city: cities[cityIndex],
    country: "Kenya",
    registrationDate: regDate.toISOString().split('T')[0]
  };
  
  console.log("Generated mock KYC data:", customer);
  return customer;
};
