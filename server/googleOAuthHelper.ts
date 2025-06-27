import { google } from 'googleapis';

/**
 * Helper function to create safe OAuth2 client with 32-bit integer protection
 * This prevents TimeoutOverflowWarning errors when Google returns large expiry values
 */
export function createSafeOAuth2Client(credentials?: {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | Date | null;
}): any {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  if (credentials) {
    // Ensure all numeric values are within 32-bit signed integer range
    const safeCredentials: any = {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
    };

    // Handle expiry_date with 32-bit safety
    if (credentials.expiry_date) {
      let expiryValue: number;
      if (credentials.expiry_date instanceof Date) {
        expiryValue = credentials.expiry_date.getTime();
      } else {
        expiryValue = Number(credentials.expiry_date);
      }
      
      // Cap at 32-bit signed integer maximum (2147483647)
      safeCredentials.expiry_date = Math.min(expiryValue, 2147483647);
    } else {
      // Default to 1 hour from now, but still within 32-bit range
      safeCredentials.expiry_date = Math.min(Date.now() + 3600000, 2147483647);
    }

    oauth2Client.setCredentials(safeCredentials);
  }

  return oauth2Client;
}

/**
 * Safely process Google API response data to prevent large integer overflow
 */
export function sanitizeGoogleApiResponse(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeGoogleApiResponse(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'number' && value > 2147483647) {
      // Convert large integers to strings to prevent overflow
      sanitized[key] = value.toString();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeGoogleApiResponse(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}