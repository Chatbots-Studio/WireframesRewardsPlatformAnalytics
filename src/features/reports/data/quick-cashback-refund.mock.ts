export type FraudReportPeriodDays = 7 | 14 | 30;

export interface QuickCashbackRefundEvent {
  id: string;
  clientId: string;
  purchaseAmount: number;
  maxCashbackAmount: number;
  withdrawnCashbackAmount: number;
  cashbackBalance: number;
  eventDate: string;
  cashbackWithdrawMinutes: number;
  isMaxCashbackInSinglePurchase: boolean;
  isRefunded: boolean;
}

export const QUICK_CASHBACK_REFUND_EVENTS: QuickCashbackRefundEvent[] = [
  {
    id: 'F-001',
    clientId: 'CL-19002',
    purchaseAmount: 12450,
    maxCashbackAmount: 1245,
    withdrawnCashbackAmount: 1245,
    cashbackBalance: 120,
    eventDate: '2025-03-04T10:20:00.000Z',
    cashbackWithdrawMinutes: 14,
    isMaxCashbackInSinglePurchase: true,
    isRefunded: true
  },
  {
    id: 'F-002',
    clientId: 'CL-44211',
    purchaseAmount: 17200,
    maxCashbackAmount: 1720,
    withdrawnCashbackAmount: 1700,
    cashbackBalance: 35,
    eventDate: '2025-03-02T09:05:00.000Z',
    cashbackWithdrawMinutes: 28,
    isMaxCashbackInSinglePurchase: true,
    isRefunded: true
  },
  {
    id: 'F-003',
    clientId: 'CL-99031',
    purchaseAmount: 9800,
    maxCashbackAmount: 980,
    withdrawnCashbackAmount: 980,
    cashbackBalance: 0,
    eventDate: '2025-02-27T17:45:00.000Z',
    cashbackWithdrawMinutes: 35,
    isMaxCashbackInSinglePurchase: true,
    isRefunded: true
  },
  {
    id: 'F-004',
    clientId: 'CL-77338',
    purchaseAmount: 14600,
    maxCashbackAmount: 1460,
    withdrawnCashbackAmount: 1460,
    cashbackBalance: 12,
    eventDate: '2025-02-23T12:10:00.000Z',
    cashbackWithdrawMinutes: 22,
    isMaxCashbackInSinglePurchase: true,
    isRefunded: true
  },
  {
    id: 'F-005',
    clientId: 'CL-22007',
    purchaseAmount: 11300,
    maxCashbackAmount: 1130,
    withdrawnCashbackAmount: 1130,
    cashbackBalance: 0,
    eventDate: '2025-02-18T14:35:00.000Z',
    cashbackWithdrawMinutes: 16,
    isMaxCashbackInSinglePurchase: true,
    isRefunded: true
  },
  {
    id: 'F-006',
    clientId: 'CL-55550',
    purchaseAmount: 8900,
    maxCashbackAmount: 890,
    withdrawnCashbackAmount: 890,
    cashbackBalance: 420,
    eventDate: '2025-03-03T08:20:00.000Z',
    cashbackWithdrawMinutes: 8,
    isMaxCashbackInSinglePurchase: true,
    isRefunded: true
  },
  {
    id: 'F-007',
    clientId: 'CL-80888',
    purchaseAmount: 15400,
    maxCashbackAmount: 1540,
    withdrawnCashbackAmount: 1300,
    cashbackBalance: 310,
    eventDate: '2025-02-25T19:30:00.000Z',
    cashbackWithdrawMinutes: 31,
    isMaxCashbackInSinglePurchase: false,
    isRefunded: true
  },
  {
    id: 'F-008',
    clientId: 'CL-67676',
    purchaseAmount: 10150,
    maxCashbackAmount: 1015,
    withdrawnCashbackAmount: 1015,
    cashbackBalance: 0,
    eventDate: '2025-02-21T11:00:00.000Z',
    cashbackWithdrawMinutes: 20,
    isMaxCashbackInSinglePurchase: true,
    isRefunded: false
  }
];

function isWithinPeriod(
  dateIso: string,
  latestIso: string,
  days: FraudReportPeriodDays
): boolean {
  const target = new Date(dateIso);
  const latest = new Date(latestIso);
  const from = new Date(latest);
  from.setDate(from.getDate() - days);
  return target >= from && target <= latest;
}

export function getQuickCashbackRefundRows(
  periodDays: FraudReportPeriodDays
): QuickCashbackRefundEvent[] {
  const latestDateIso = QUICK_CASHBACK_REFUND_EVENTS.reduce(
    (latest, event) => (event.eventDate > latest ? event.eventDate : latest),
    QUICK_CASHBACK_REFUND_EVENTS[0]?.eventDate ?? ''
  );

  return QUICK_CASHBACK_REFUND_EVENTS.filter((event) => {
    const inWithdrawWindow =
      event.cashbackWithdrawMinutes >= 10 &&
      event.cashbackWithdrawMinutes <= 40;

    return (
      event.isMaxCashbackInSinglePurchase &&
      inWithdrawWindow &&
      event.isRefunded &&
      isWithinPeriod(event.eventDate, latestDateIso, periodDays)
    );
  }).sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );
}
