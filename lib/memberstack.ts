// Memberstack service for managing payment data

const MEMBERSTACK_API_URL = 'https://admin.memberstack.com/graphql';

export interface Payment {
  id: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: number;
  email?: string;
}

// Create a payment record in Memberstack
export async function createPaymentRecord(payment: Payment): Promise<boolean> {
  const MEMBERSTACK_SECRET_KEY = process.env.MEMBERSTACK_SECRET_KEY;

  if (!MEMBERSTACK_SECRET_KEY) {
    console.error('Memberstack API key not configured');
    return false;
  }

  const mutation = `
    mutation CreatePaymentRecord($input: CreateDataRecordInput!) {
      createDataRecord(input: $input) {
        id
        data
      }
    }
  `;

  const variables = {
    input: {
      tableId: 'tbl_cmhabevx800050sff5ap65nlr',
      data: {
        sessionId: payment.id,
        customerName: payment.customerName,
        amount: payment.amount,
        currency: payment.currency,
        email: payment.email || '',
        timestamp: new Date(payment.timestamp).toISOString(),
      },
    },
  };

  try {
    console.log('Saving payment to Memberstack:', {
      sessionId: payment.id,
      customerName: payment.customerName,
      amount: payment.amount,
    });

    const response = await fetch(MEMBERSTACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MEMBERSTACK_SECRET_KEY,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      console.error('Memberstack API HTTP error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return false;
    }

    const result = await response.json();

    if (result.errors) {
      console.error('Memberstack API GraphQL errors:', JSON.stringify(result.errors, null, 2));
      return false;
    }

    console.log('Payment saved to Memberstack successfully:', result.data?.createDataRecord?.id);
    return true;
  } catch (error) {
    console.error('Error saving payment to Memberstack:', error);
    return false;
  }
}

// Fetch recent payments from Memberstack
export async function fetchRecentPayments(limit: number = 20): Promise<Payment[]> {
  const MEMBERSTACK_SECRET_KEY = process.env.MEMBERSTACK_SECRET_KEY;

  if (!MEMBERSTACK_SECRET_KEY) {
    console.error('Memberstack API key not configured');
    return [];
  }

  const query = `
    query GetPayments($tableId: ID!, $pagination: PaginationInput) {
      getDataRecords(tableId: $tableId, pagination: $pagination) {
        edges {
          node {
            id
            data
            createdAt
          }
        }
      }
    }
  `;

  const variables = {
    tableId: 'tbl_cmhabevx800050sff5ap65nlr',
    pagination: {
      first: limit,
    },
  };

  try {
    const response = await fetch(MEMBERSTACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MEMBERSTACK_SECRET_KEY,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      console.error('Memberstack API HTTP error:', response.status);
      return [];
    }

    const result = await response.json();

    if (result.errors) {
      console.error('Memberstack API error:', result.errors);
      return [];
    }

    if (!result.data?.getDataRecords?.edges || result.data.getDataRecords.edges.length === 0) {
      console.log('No payment records found in Memberstack');
      return [];
    }

    // Transform Memberstack data to Payment format
    const payments: Payment[] = result.data.getDataRecords.edges.map((edge: any) => {
      const data = edge.node.data;

      // Handle Decimal type (amount is returned as an object)
      let amount = 0;
      if (typeof data.amount === 'object' && data.amount.d) {
        // Memberstack Decimal format: {s: sign, e: exponent, d: digits array}
        amount = parseFloat(data.amount.d.join('')) / Math.pow(10, data.amount.e || 0);
      } else {
        amount = parseFloat(data.amount);
      }

      return {
        id: data.sessionId,
        customerName: data.customerName,
        amount: amount,
        currency: data.currency,
        timestamp: new Date(data.timestamp).getTime(),
        email: data.email || undefined,
      };
    });

    console.log(`Fetched ${payments.length} payments from Memberstack`);
    return payments;
  } catch (error) {
    console.error('Error fetching payments from Memberstack:', error);
    return [];
  }
}
