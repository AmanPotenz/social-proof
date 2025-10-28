// In-memory store for recent payments
export interface Payment {
  id: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: number;
  email?: string;
}

class PaymentsStore {
  private payments: Payment[] = [];
  private readonly MAX_PAYMENTS = 50; // Keep last 50 payments

  addPayment(payment: Payment) {
    this.payments.unshift(payment);

    // Keep only the last MAX_PAYMENTS
    if (this.payments.length > this.MAX_PAYMENTS) {
      this.payments = this.payments.slice(0, this.MAX_PAYMENTS);
    }
  }

  getRecentPayments(limit: number = 20): Payment[] {
    return this.payments.slice(0, limit);
  }

  clear() {
    this.payments = [];
  }
}

// Create a singleton instance
export const paymentsStore = new PaymentsStore();
