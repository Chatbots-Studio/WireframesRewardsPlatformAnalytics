export type DataSourceType = 'api' | 'dwh' | 'event_stream' | 'file_upload';
export type DataSourceStatus = 'active' | 'planned';

export interface AnalyticsDataSource {
  id: string;
  name: string;
  description: string;
  type: DataSourceType;
  owner: string;
  refreshPolicy: string;
  status: DataSourceStatus;
}

export interface ProductTargetAction {
  id: string;
  name: string;
  definition: string;
  identificationMethod: string;
  dataSourceId?: string;
}

export interface ProductDictionaryEntry {
  id: string;
  name: string;
  productSourceDescription: string;
  productSourceId?: string;
  activeConditions: string[];
  inactiveConditions: string[];
  targetActions: ProductTargetAction[];
}

export const ANALYTICS_DATA_SOURCES: AnalyticsDataSource[] = [
  {
    id: 'SRC-CB-WEBHOOKS',
    name: 'Cashback Webhooks',
    description:
      'Cashback processing events: category activations, transactions, accruals, payouts.',
    type: 'event_stream',
    owner: 'Cashback Core',
    refreshPolicy: 'near real-time',
    status: 'active'
  },
  {
    id: 'SRC-CRM-COMM',
    name: 'CRM Campaign History',
    description:
      'Campaign communication history (in-app/push/email/sms/call), upload or API.',
    type: 'api',
    owner: 'CRM / Marketing',
    refreshPolicy: 'hourly',
    status: 'planned'
  },
  {
    id: 'SRC-SEG-UPLOAD',
    name: 'Segments Upload',
    description:
      'File-based client-to-segment mapping before automatic segmentation module launch.',
    type: 'file_upload',
    owner: 'Product Analytics',
    refreshPolicy: 'on demand',
    status: 'active'
  },
  {
    id: 'SRC-DWH-TX',
    name: 'Transactions DWH',
    description:
      'Transaction and card activity aggregates for building metrics by period.',
    type: 'dwh',
    owner: 'Data Platform',
    refreshPolicy: 'daily',
    status: 'active'
  },
  {
    id: 'SRC-FIN-PNL',
    name: 'Financial PnL',
    description:
      'Bank revenue by clients and products (interchange, commissions, credit income).',
    type: 'dwh',
    owner: 'Finance BI',
    refreshPolicy: 'monthly',
    status: 'planned'
  }
];

export const PRODUCT_DICTIONARY: ProductDictionaryEntry[] = [
  {
    id: 'PRD-RADA-CARD',
    name: 'Rada Card',
    productSourceDescription:
      'Card product for the mass segment. Analytics built on category selection events and transactions.',
    productSourceId: 'SRC-CB-WEBHOOKS',
    activeConditions: [
      'Card is active and not blocked',
      'At least one mobile app login within the last 30 days',
      'Cashback category selected in the current calendar month'
    ],
    inactiveConditions: [
      'Card is blocked or closed',
      'No app activity for more than 30 days',
      'Category not selected in the current calendar month'
    ],
    targetActions: [
      {
        id: 'TA-RADA-CATEGORY-SELECT',
        name: 'Cashback Category Selection',
        definition:
          'Client opened the cashback screen and confirmed category selection in the current month.',
        identificationMethod:
          'event_name = cashback_category_selected AND period_month = current_month',
        dataSourceId: 'SRC-CB-WEBHOOKS'
      },
      {
        id: 'TA-RADA-CB-TX',
        name: 'Transaction with Accrued Cashback',
        definition:
          'Card transaction that matched an active cashback rule and received an accrual.',
        identificationMethod:
          'event_name = cashback_accrued AND cashback_amount > 0',
        dataSourceId: 'SRC-CB-WEBHOOKS'
      },
      {
        id: 'TA-RADA-CB-PAYOUT',
        name: 'Client Cashback Payout',
        definition:
          'Cashback funds transferred to the client account after accrual.',
        identificationMethod:
          'event_name = cashback_payout AND payout_status = success',
        dataSourceId: 'SRC-CB-WEBHOOKS'
      }
    ]
  },
  {
    id: 'PRD-DEPOSIT',
    name: 'Deposits',
    productSourceDescription:
      'Deposit product with analytics on the impact of cashback offers on segment behavior.',
    productSourceId: 'SRC-DWH-TX',
    activeConditions: [
      'Active deposit agreement exists',
      'Client falls within the campaign target segment',
      'Campaign is active within the 30-day attribution window'
    ],
    inactiveConditions: [
      'Deposit is closed',
      'Client excluded from campaign segment',
      '30-day attribution window has expired'
    ],
    targetActions: [
      {
        id: 'TA-DEP-PRODUCT-VIEW',
        name: 'Deposit Offer View',
        definition:
          'Client opened deposit offer details after a communication.',
        identificationMethod:
          'event_name = deposit_offer_viewed AND attribution_window_days <= 30',
        dataSourceId: 'SRC-CRM-COMM'
      },
      {
        id: 'TA-DEP-OPEN',
        name: 'Deposit Opening',
        definition:
          'Client opened a deposit after interacting with a communication and/or cashback offer.',
        identificationMethod:
          'deposit_opened_at IS NOT NULL AND attribution_window_days <= 30',
        dataSourceId: 'SRC-DWH-TX'
      }
    ]
  },
  {
    id: 'PRD-SALARY',
    name: 'Salary Project',
    productSourceDescription:
      'Salary product where we evaluate client activation and retention through personalized campaigns.',
    productSourceId: 'SRC-SEG-UPLOAD',
    activeConditions: [
      'Client is in the uploaded target segment',
      'At least one salary deposit received in the last month'
    ],
    inactiveConditions: [
      'Client is not in the current segment',
      'No salary deposits for more than 30 days'
    ],
    targetActions: [
      {
        id: 'TA-SAL-SEGMENT-ENTER',
        name: 'Target Segment Entry',
        definition:
          'Client is present in the segmentation file or received from the segments module.',
        identificationMethod: 'segment_id IS NOT NULL AND assigned_at IS NOT NULL',
        dataSourceId: 'SRC-SEG-UPLOAD'
      },
      {
        id: 'TA-SAL-ACTIVE-CARD-TX',
        name: 'Active Card Transaction',
        definition:
          'After entering the segment, the client made at least one purchase.',
        identificationMethod:
          'tx_count_after_segment_assignment >= 1 within 30 days',
        dataSourceId: 'SRC-DWH-TX'
      },
      {
        id: 'TA-SAL-RETENTION-30D',
        name: '30-Day Retention',
        definition:
          'Client remained active 30 days after the first target action.',
        identificationMethod:
          'is_active_on_day_30 = true (cohort retention check)'
      }
    ]
  }
];
