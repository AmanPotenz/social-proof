// Airtable service for managing payment data
import Airtable from 'airtable';

export interface Payment {
  id: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: number;
  email?: string;
}

// Initialize Airtable with Personal Access Token
const getAirtableBase = () => {
  const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!accessToken || !baseId) {
    console.error('Airtable credentials not configured');
    return null;
  }

  Airtable.configure({
    apiKey: accessToken, // Personal Access Token is passed as apiKey
  });
  return Airtable.base(baseId);
};

// Create a payment record in Airtable
export async function createPaymentRecord(payment: Payment): Promise<boolean> {
  const base = getAirtableBase();
  if (!base) return false;

  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Payments';

  try {
    console.log('Saving payment to Airtable:', {
      tableName,
      sessionId: payment.id,
      customerName: payment.customerName,
      amount: payment.amount,
    });

    const record = await base(tableName).create([
      {
        fields: {
          sessionId: payment.id,
          customerName: payment.customerName,
          amount: payment.amount,
          currency: payment.currency,
          email: payment.email || '',
          timestamp: new Date(payment.timestamp).toISOString(),
        },
      },
    ]);

    console.log('✓ Payment saved to Airtable successfully:', record[0].id);
    return true;
  } catch (error: any) {
    console.error('Error saving payment to Airtable:', {
      error: error.message,
      statusCode: error.statusCode,
      details: error.error,
    });
    // Throw error so we can catch it and show to user
    throw new Error(`Airtable Error: ${error.message}${error.error ? ' - ' + JSON.stringify(error.error) : ''}`);
  }
}

// Fetch recent payments from Airtable
export async function fetchRecentPayments(limit: number = 20): Promise<Payment[]> {
  const base = getAirtableBase();
  if (!base) return [];

  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Payments';

  try {
    console.log('Fetching from Airtable:', { tableName, limit });

    const records = await base(tableName)
      .select({
        maxRecords: limit,
        sort: [{ field: 'timestamp', direction: 'desc' }],
      })
      .all();

    const payments: Payment[] = records.map((record) => {
      const fields = record.fields as any;
      return {
        id: fields.sessionId || record.id,
        customerName: fields.customerName || 'Anonymous',
        amount: parseFloat(fields.amount) || 0,
        currency: fields.currency || 'USD',
        timestamp: new Date(fields.timestamp).getTime(),
        email: fields.email || undefined,
      };
    });

    console.log(`✓ Fetched ${payments.length} payments from Airtable`);
    return payments;
  } catch (error) {
    console.error('Error fetching payments from Airtable:', error);
    return [];
  }
}
