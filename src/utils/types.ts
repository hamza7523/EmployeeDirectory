// src/utils/types.ts

/** Employee interface — all fields together */
export interface IEmployee {
  Title: string;             // Title field (often same as name)
  EmployeeName: string;      // Full employee name
  JobTitle?: string;         // Job title
  Department?: string;       // Department (choice)
  Email?: string;            // Email
  Phone?: string;            // Phone
  Manager?: {                // Person field
    Id?: number;
    Title?: string;          // Name of manager
    Email?: string;
    [key: string]: unknown;  // Extra properties SharePoint may return
  };
  Status?: string;           // Status (choice)
  JoiningDate?: string;      // Joining date (ISO string)
  [key: string]: unknown;    // Any other extra fields
}

/** Raw SharePoint item before normalization */
export interface IRawSharePointItem {
  [key: string]: unknown;
}



