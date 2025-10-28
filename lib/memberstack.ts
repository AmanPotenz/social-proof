// Memberstack service for managing payment data

const MEMBERSTACK_API_URL = 'https://admin.memberstack.com/graphql';
const MEMBERSTACK_SECRET_KEY = process.env.MEMBERSTACK_SECRET_KEY;

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
  if (!MEMBERSTACK_SECRET_KEY) {
    console.error('Memberstack API key not configured');
    return false;
  }

  const mutation = `
    mutation CreatePaymentRecord($input: CreateDataRecordInput!) {
      createDataRecord(input: $input) {
        id
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
        email: payment.email || null,
        timestamp: new Date(payment.timestamp).toISOString(),
      },
    },
  };

  try {
    const response = await fetch(MEMBERSTACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': MEMBERSTACK_SECRET_KEY,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Memberstack API error:', result.errors);
      return false;
    }

    console.log('Payment saved to Memberstack:', result.data);
    return true;
  } catch (error) {
    console.error('Error saving payment to Memberstack:', error);
    return false;
  }
}

// Fetch recent payments from Memberstack
export async function fetchRecentPayments(limit: number = 20): Promise<Payment[]> {
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
        'X-API-KEY': MEMBERSTACK_SECRET_KEY,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Memberstack API error:', result.errors);
      return [];
    }

    // Transform Memberstack data to Payment format
    const payments: Payment[] = result.data.getDataRecords.edges.map((edge: any) => {
      const data = edge.node.data;
      return {
        id: data.sessionId,
        customerName: data.customerName,
        amount: parseFloat(data.amount),
        currency: data.currency,
        timestamp: new Date(data.timestamp).getTime(),
        email: data.email || undefined,
      };
    });

    return payments;
  } catch (error) {
    console.error('Error fetching payments from Memberstack:', error);
    return [];
  }
}
