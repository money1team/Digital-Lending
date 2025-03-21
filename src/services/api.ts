import { toast } from "sonner";

// API Base URLs
const SCORING_API_BASE_URL = "https://scoringtest.credable.io/api/v1";
const KYC_SOAP_URL = "https://kycapitest.credable.io/service/customerWsdl.wsdl";
const TRANSACTION_SOAP_URL = "https://trxapitest.credable.io/service/transactionWsdl.wsdl";

// SOAP API Credentials
const SOAP_USERNAME = "admin";
const SOAP_PASSWORD = "pwd123";

// Client information for scoring API registration
export interface ClientInfo {
  url: string;
  name: string;
  username: string;
  password: string;
  token?: string;
  id?: number;
}

// Create a client registration with the scoring engine
export const registerClient = async (clientInfo: ClientInfo): Promise<ClientInfo> => {
  try {
    const response = await fetch(`${SCORING_API_BASE_URL}/client/createClient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(clientInfo)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register client");
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to register client";
    toast.error(errorMessage);
    throw error;
  }
};

// Initiate a score query for a customer
export const initiateScoreQuery = async (customerNumber: string, clientToken: string): Promise<string> => {
  try {
    const response = await fetch(`${SCORING_API_BASE_URL}/scoring/initiateQueryScore/${customerNumber}`, {
      method: "GET",
      headers: {
        "client-token": clientToken
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to initiate score query");
    }

    return await response.text();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to initiate score query";
    toast.error(errorMessage);
    throw error;
  }
};

// Customer score response
export interface CustomerScore {
  id: number;
  customerNumber: string;
  score: number;
  limitAmount: number;
  exclusion: string;
  exclusionReason: string;
}

// Query the score using the token
export const queryScore = async (token: string, clientToken: string): Promise<CustomerScore> => {
  try {
    const response = await fetch(`${SCORING_API_BASE_URL}/scoring/queryScore/${token}`, {
      method: "GET",
      headers: {
        "client-token": clientToken
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Score not ready yet
        return { id: 0, customerNumber: "", score: 0, limitAmount: 0, exclusion: "pending", exclusionReason: "Score calculation in progress" };
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to query score");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      // Score not ready yet - this is expected and not an error
      return { id: 0, customerNumber: "", score: 0, limitAmount: 0, exclusion: "pending", exclusionReason: "Score calculation in progress" };
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to query score";
    toast.error(errorMessage);
    throw error;
  }
};

// Helper function to create a SOAP envelope for the KYC API
export const createKYCSoapEnvelope = (customerNumber: string): string => {
  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                     xmlns:cus="http://credable.io/customer">
       <soapenv:Header>
          <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
             <wsse:UsernameToken>
                <wsse:Username>${SOAP_USERNAME}</wsse:Username>
                <wsse:Password>${SOAP_PASSWORD}</wsse:Password>
             </wsse:UsernameToken>
          </wsse:Security>
       </soapenv:Header>
       <soapenv:Body>
          <cus:CustomerRequest>
             <cus:customerNumber>${customerNumber}</cus:customerNumber>
          </cus:CustomerRequest>
       </soapenv:Body>
    </soapenv:Envelope>
  `;
};

// Helper function to create a SOAP envelope for the Transaction API
export const createTransactionSoapEnvelope = (customerNumber: string): string => {
  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                     xmlns:tran="http://credable.io/transaction">
       <soapenv:Header>
          <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
             <wsse:UsernameToken>
                <wsse:Username>${SOAP_USERNAME}</wsse:Username>
                <wsse:Password>${SOAP_PASSWORD}</wsse:Password>
             </wsse:UsernameToken>
          </wsse:Security>
       </soapenv:Header>
       <soapenv:Body>
          <tran:TransactionRequest>
             <tran:customerNumber>${customerNumber}</tran:customerNumber>
          </tran:TransactionRequest>
       </soapenv:Body>
    </soapenv:Envelope>
  `;
};

// Helper function to make a SOAP API call
export const callSoapApi = async (url: string, soapEnvelope: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        "SOAPAction": ""
      },
      body: soapEnvelope
    });

    if (!response.ok) {
      throw new Error(`Failed to call SOAP API: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to call SOAP API";
    toast.error(errorMessage);
    throw error;
  }
};

// Parse XML to JSON helper function
export const parseXMLToJSON = (xmlString: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  // A simple recursive function to convert XML to JSON
  const xmlToJson = (node: Element) => {
    const obj: any = {};
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.hasAttributes()) {
        const attrs = node.attributes;
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          obj[`@${attr.name}`] = attr.value;
        }
      }
      
      if (node.hasChildNodes()) {
        const children = node.childNodes;
        let isTextOnly = true;
        let textContent = "";
        
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          
          if (child.nodeType === Node.ELEMENT_NODE) {
            isTextOnly = false;
            if (!obj[child.nodeName]) {
              obj[child.nodeName] = xmlToJson(child as Element);
            } else {
              if (!Array.isArray(obj[child.nodeName])) {
                obj[child.nodeName] = [obj[child.nodeName]];
              }
              obj[child.nodeName].push(xmlToJson(child as Element));
            }
          } else if (child.nodeType === Node.TEXT_NODE) {
            textContent += child.nodeValue?.trim() || "";
          }
        }
        
        if (isTextOnly && textContent) {
          return textContent;
        }
      }
    }
    
    return obj;
  };
  
  // Get the root element and convert it to JSON
  const rootElement = xmlDoc.documentElement;
  return { [rootElement.nodeName]: xmlToJson(rootElement) };
};
