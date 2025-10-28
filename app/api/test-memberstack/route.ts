import { NextResponse } from 'next/server';

export async function GET() {
  // Test creating a payment record directly
  const testPayment = {
    id: 'test_' + Date.now(),
    customerName: 'Test Customer',
    amount: 10.00,
    currency: 'USD',
    timestamp: Date.now(),
    email: 'test@example.com',
  };

  console.log('Testing Memberstack with:', testPayment);

  const MEMBERSTACK_SECRET_KEY = process.env.MEMBERSTACK_SECRET_KEY;
  const MEMBERSTACK_APP_ID = process.env.MEMBERSTACK_APP_ID;
  const MEMBERSTACK_API_URL = 'https://api.memberstack.com/v1/graphql';

  console.log('Environment check:', {
    hasKey: !!MEMBERSTACK_SECRET_KEY,
    hasAppId: !!MEMBERSTACK_APP_ID,
    apiUrl: MEMBERSTACK_API_URL,
  });

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
        sessionId: testPayment.id,
        customerName: testPayment.customerName,
        amount: testPayment.amount,
        currency: testPayment.currency,
        email: testPayment.email || '',
        timestamp: new Date(testPayment.timestamp).toISOString(),
      },
    },
  };

  try {
    const response = await fetch(MEMBERSTACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MEMBERSTACK_SECRET_KEY!,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    const responseText = await response.text();
    console.log('Memberstack response status:', response.status);
    console.log('Memberstack response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON response from Memberstack',
        responseStatus: response.status,
        responseText: responseText.substring(0, 500),
        envCheck: {
          hasMemberstackKey: !!MEMBERSTACK_SECRET_KEY,
          keyPrefix: MEMBERSTACK_SECRET_KEY?.substring(0, 5),
        },
      });
    }

    if (result.errors) {
      return NextResponse.json({
        success: false,
        message: 'Memberstack GraphQL errors',
        errors: result.errors,
        testPayment,
        envCheck: {
          hasMemberstackKey: !!MEMBERSTACK_SECRET_KEY,
          keyPrefix: MEMBERSTACK_SECRET_KEY?.substring(0, 5),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment saved to Memberstack successfully',
      recordId: result.data?.createDataRecord?.id,
      testPayment,
      envCheck: {
        hasMemberstackKey: !!MEMBERSTACK_SECRET_KEY,
        keyPrefix: MEMBERSTACK_SECRET_KEY?.substring(0, 5),
      },
    });
  } catch (error: any) {
    console.error('Test Memberstack error:', error);
    return NextResponse.json({
      success: false,
      message: 'Exception occurred',
      error: error.message,
      testPayment,
      envCheck: {
        hasMemberstackKey: !!MEMBERSTACK_SECRET_KEY,
        keyPrefix: MEMBERSTACK_SECRET_KEY?.substring(0, 5),
      },
    });
  }
}
