export type MetricAlertLevel = 'good' | 'watch' | 'risk';

export interface MetricAction {
  role: 'Product' | 'CRM' | 'Risk' | 'Finance';
  action: string;
  expectedImpact: string;
}

export interface MetricThreshold {
  level: MetricAlertLevel;
  label: string;
  condition: string;
  interpretation: string;
}

export interface MetricFormula {
  expression: string;
  details: string[];
  example: string;
}

export interface MetricCatalogItem {
  id: string;
  title: string;
  aliases?: string[];
  shortDefinition: string;
  quickFormula: string;
  formula: MetricFormula;
  drivers: string[];
  actions: MetricAction[];
  thresholds: MetricThreshold[];
  caveats: string[];
}

const metricCatalog: MetricCatalogItem[] = [
  {
    id: 'activation_conversion',
    title: 'Cashback Activation Conversion',
    aliases: ['Activation Conversion'],
    shortDefinition:
      'Share of new customers who activated cashback immediately after opening a card.',
    quickFormula: '(activated new customers / new cards) × 100%',
    formula: {
      expression:
        'A customer is considered activated if they selected a cashback category within the first 24 hours after opening a card.',
      details: [
        'Numerator — number of new customers with a cashback activation event within 24 hours.',
        'Denominator — number of new cards issued in the same period.',
        'Delta to the previous month = difference in pp for trend.'
      ],
      example:
        'In February, 12,400 new cards were opened. Of those, 7,614 customers selected a cashback category within 24 hours. Conversion = 7,614 / 12,400 × 100% = 61.4%.'
    },
    drivers: [
      'Current in-app onboarding and depth of onboarding reminders',
      'Clarity of initial offers in the product header',
      'Relevance of offers to the user segment',
      'Size and transparency of the first offer terms',
      'Fraud level at the first step (bot filters)'
    ],
    actions: [
      {
        role: 'Product',
        action:
          'Make cashback the first action in the onboarding flow for new cards.',
        expectedImpact: 'faster activation start for users'
      },
      {
        role: 'CRM',
        action: 'Send a follow-up push after 45 minutes and after 20 hours.',
        expectedImpact:
          'increased activations among users with a pause between opening and tapping'
      },
      {
        role: 'Finance',
        action: 'Review costs of the starter offer across different segments.',
        expectedImpact: 'reduced costs without lowering conversion'
      }
    ],
    thresholds: [
      {
        level: 'good',
        label: 'Reasonably high',
        condition: '≥ 55%',
        interpretation:
          'Relatively stable demand for the offer at current costs.'
      },
      {
        level: 'watch',
        label: 'Under control',
        condition: '45% – 54%',
        interpretation: 'Onboarding and local communications need review.'
      },
      {
        level: 'risk',
        label: 'Action needed',
        condition: '< 45%',
        interpretation:
          'Likely a problematic message, misaligned offers, or fraud.'
      }
    ],
    caveats: [
      'On very small segments, relative noise increases by 10–20pp.',
      'Month-over-month comparison requires consistent onboarding rules across periods.'
    ]
  },
  {
    id: 'time_to_first_tx',
    title: 'Time to First Transaction',
    aliases: ['Time to first transaction'],
    shortDefinition:
      'Average time from cashback activation to the first payment using it.',
    quickFormula:
      'Average time(first cashback tx — activation event) / number of customers who made the first payment',
    formula: {
      expression:
        'Average value across all customers with activation and at least one subsequent transaction.',
      details: [
        'Numerator — sum of hours/days between cashback activation and the first completed transaction.',
        'Denominator — number of customers who made the first transaction.',
        'Value decreases after optimizing push communications or the offer catalog.'
      ],
      example:
        '3 customers with activation made their first payment after 1.8, 2.5, and 2.6 days respectively. Average time = (1.8 + 2.5 + 2.6) / 3 = 2.3 days.'
    },
    drivers: [
      'Message delivery time and in-app activity',
      'Availability of suitable merchants in the user\'s geolocation',
      'Seasonal factors (dip at the beginning of the week/month)',
      'Complexity of transaction verification at the merchant',
      'Number of deferred or unbilled payments'
    ],
    actions: [
      {
        role: 'Product',
        action:
          'Add a contextual CTA card for immediate purchase within the 24-hour window.',
        expectedImpact: 'reduced time to first payment'
      },
      {
        role: 'CRM',
        action: 'Send personalized first-purchase examples by segment.',
        expectedImpact: 'less hesitation after activation'
      },
      {
        role: 'Finance',
        action:
          'Validate time boundaries of transaction events with partner merchants.',
        expectedImpact: 'fewer missed payments due to technical lag'
      }
    ],
    thresholds: [
      {
        level: 'good',
        label: 'Normally fast',
        condition: 'up to 2 days',
        interpretation:
          'Customer starts benefiting from cashback without unnecessary delays.'
      },
      {
        level: 'watch',
        label: 'Needs monitoring',
        condition: '2–4 days',
        interpretation: 'A portion of the segment is delayed with the first payment.'
      },
      {
        level: 'risk',
        label: 'Churn risk',
        condition: '> 4 days',
        interpretation: 'The offer may not be driving immediate action.'
      }
    ],
    caveats: [
      'Different time zones for customers can distort the average value.',
      'During seasonal promotion periods, compare with the corresponding control period.'
    ]
  },
  {
    id: 'reactivation_rate',
    title: 'Reactivation Rate',
    aliases: ['Reactivation Rate'],
    shortDefinition:
      'How many dormant customers returned to activity after launching relevant re-engagement campaigns.',
    quickFormula:
      '(reactivated dormant customers / dormant base >90 days) × 100%',
    formula: {
      expression:
        'Calculated based on the customer base that had no transactions for >90 days before the start of the cashback campaign period.',
      details: [
        'Numerator — customers from the dormant segment who made a payment or clicked during the campaign period.',
        'Denominator — number of customers in the dormant segment at the start of the period.',
        'Result is compared with a historical period without campaign launches.'
      ],
      example:
        'At the start of February, the dormant segment (>90 days without transactions) had 8,200 customers. Of those, 1,533 made a payment during the campaign. Reactivation Rate = 1,533 / 8,200 × 100% = 18.7%.'
    },
    drivers: [
      'Quality of "dormant" customer segmentation',
      'Timing of push/SMS on trigger events',
      'Attractiveness of the return offer for a specific segment',
      'Duration of the campaign action window',
      'Parallel interaction channels (email, push, in-app)'
    ],
    actions: [
      {
        role: 'CRM',
        action: 'Split dormant segments into 30/60/90+ days of inactivity.',
        expectedImpact: 'more precise targeting and higher reactivation conversion'
      },
      {
        role: 'Product',
        action:
          'Add a "light" return offer without excessive spending thresholds.',
        expectedImpact: 'lower barrier to entry for returning'
      },
      {
        role: 'Finance',
        action:
          'Set a minimum offer warm-up threshold depending on the segment CLV.',
        expectedImpact: 'better reactivation ROI'
      }
    ],
    thresholds: [
      {
        level: 'good',
        label: 'Good signal',
        condition: '≥ 12%',
        interpretation: 'Offers and channels for returning to activity are working.'
      },
      {
        level: 'watch',
        label: 'Needs observation',
        condition: '6–11%',
        interpretation:
          'Returns are present but communication needs strengthening.'
      },
      {
        level: 'risk',
        label: 'Critically low',
        condition: '< 6%',
        interpretation: 'Signal that the offer is not relevant to dormant customers.'
      }
    ],
    caveats: [
      'Month-over-month comparison should account for channels where simultaneous CRM remarketing occurred.',
      'The metric depends on how long the customer was "dormant" before the spike date.'
    ]
  },
  {
    id: 'transaction_frequency',
    title: 'Transaction Frequency',
    shortDefinition:
      'How many transactions per month an average customer with cashback makes.',
    quickFormula:
      'Average transactions of customers with cashback vs without cashback (difference and delta)',
    formula: {
      expression:
        'For the group of users with cashback, the number of transactions per month is calculated, then compared with the control group without cashback.',
      details: [
        'Numerator — number of transactions / number of active customers in the respective group.',
        'Normalization is done on the same time frame (month) and segment.',
        'Delta in the UI shows the lag/deviation from the average without cashback.'
      ],
      example:
        'Cashback group: 42,000 transactions / 10,000 customers = 4.2 txn/mo. Control group without cashback: 21,000 / 10,000 = 2.1 txn/mo. Delta = +2.1 txn/mo.'
    },
    drivers: [
      'Strength of offers in high-frequency spending categories',
      'Behavioral triggers (reminders + limits)',
      'Access to merchants that convert regular payments',
      'Seasonality (festivals, holidays, payroll cycle)',
      'Quality of repeat transaction validation in the analytics pipeline'
    ],
    actions: [
      {
        role: 'Product',
        action:
          'Set up frequent recurring offers on a daily rhythm (without exceeding burn rate).',
        expectedImpact: 'frequency growth driven by routine payments'
      },
      {
        role: 'CRM',
        action:
          'Guide users to relevant categories through personalized hints.',
        expectedImpact: 'increased repeat payments on a weekly basis'
      },
      {
        role: 'Finance',
        action:
          'Bring offer costs to a normalized threshold across the segment chain.',
        expectedImpact: 'reduction of unproductive frequency growth'
      }
    ],
    thresholds: [
      {
        level: 'good',
        label: 'Strong growth',
        condition: '>= 3.5 txn/mo',
        interpretation: 'The program significantly drives repeat activity.'
      },
      {
        level: 'watch',
        label: 'Borderline zone',
        condition: '2.5–3.4 txn/mo',
        interpretation: 'Effect exists but may depend on individual campaigns.'
      },
      {
        level: 'risk',
        label: 'Weak signal',
        condition: '< 2.5 txn/mo',
        interpretation:
          'Cashback may not be adding frequency, only redistributing it.'
      }
    ],
    caveats: [
      'Most often, transaction frequency growth initially comes from a marketing spike.',
      'Without a control group, it is difficult to isolate the seasonal factor.'
    ]
  },
  {
    id: 'avg_check_delta',
    title: 'Average Check Change',
    shortDefinition:
      'How much the average check increased under cashback influence for selected categories.',
    quickFormula:
      '((avg check with cashback − avg check without cashback) / avg check without cashback) × 100%',
    formula: {
      expression:
        'The average check before/after cashback activation is compared across controlled categories.',
      details: [
        'Numerator — difference between the average check with a cashback action and the baseline average check in the same segments.',
        'Denominator — baseline average check without cashback.',
        'Delta is displayed as a percentage and tracked monthly.'
      ],
      example:
        'Average check without cashback = 482 UAH. With cashback = 595 UAH. Delta = (595 − 482) / 482 × 100% = +23.4%.'
    },
    drivers: [
      'Offer type (percentage or fixed bonus)',
      'Psychological price threshold in a specific category',
      'Impact of additional promotions and coupons at the merchant',
      'Seasonal assortment changes',
      'Data aggregation across new vs loyal users'
    ],
    actions: [
      {
        role: 'Product',
        action:
          'Launch offers on products with a higher average check in major retail chains.',
        expectedImpact: 'increased loyal value of the useful check'
      },
      {
        role: 'CRM',
        action:
          'Add "raise your check to the threshold" hints in segments with a low average check.',
        expectedImpact: 'direct average check uplift'
      },
      {
        role: 'Finance',
        action: 'Monitor the margin of offers with a high average check.',
        expectedImpact: 'strengthening not only turnover but also profitability'
      }
    ],
    thresholds: [
      {
        level: 'good',
        label: 'Steady growth',
        condition: '≥ 15%',
        interpretation: 'Cashback genuinely raises the average purchase value.'
      },
      {
        level: 'watch',
        label: 'Neutral-moderate',
        condition: '5–14%',
        interpretation:
          'Effect exists but the correlation with category/season needs verification.'
      },
      {
        level: 'risk',
        label: 'Insufficient uplift',
        condition: '< 5%',
        interpretation:
          'Cashback may stimulate frequent purchases but without check growth.'
      }
    ],
    caveats: [
      'Average check is sensitive to individual large transactions.',
      'During transitional periods, it is important to normalize by the number of active customers.'
    ]
  },
  {
    id: 'credit_utilization',
    title: 'Credit Limit Utilization',
    aliases: ['Credit Limit Utilization'],
    shortDefinition:
      'Share of turnover in cashback-related purchases that went through the credit limit.',
    quickFormula: '(credit transactions / all transactions) × 100%',
    formula: {
      expression:
        'Share of credit limit payments in the set of transactions attributed to cashback categories.',
      details: [
        'Numerator — total amount paid through the credit limit.',
        'Denominator — total turnover of the same cashback transactions.',
        'Interpretation depends on risk appetite and scoring policy.'
      ],
      example:
        'Total cashback transaction turnover for February = 14.2M UAH. Of that, 4.94M UAH was paid through the credit limit. Credit Utilization = 4.94 / 14.2 × 100% = 34.8%.'
    },
    drivers: [
      'User behavior in the payment channel',
      'Limit differences across segments and user age',
      'Partner offers and payment terms in the cashback segment',
      'Debt overheating prevention policies',
      'Pressure from seasonal large purchases'
    ],
    actions: [
      {
        role: 'Risk',
        action:
          'Set segment-level limits and alerts for abnormal credit utilization growth.',
        expectedImpact: 'managed risks of credit limit overuse'
      },
      {
        role: 'Product',
        action:
          'Display financial alternatives (multiple payment options) in the interface.',
        expectedImpact:
          'balance between user convenience and debt burden risk'
      },
      {
        role: 'Finance',
        action: 'Compare profitability of checks with a high credit share.',
        expectedImpact: 'unified rules for viable and risky offers'
      }
    ],
    thresholds: [
      {
        level: 'good',
        label: 'Balanced',
        condition: '20% – 35%',
        interpretation:
          'Credit activity is growing but within controlled credit risk limits.'
      },
      {
        level: 'watch',
        label: 'Enhanced monitoring',
        condition: '35% – 60%',
        interpretation:
          'Possible shift toward short-term debt-driven consumption.'
      },
      {
        level: 'risk',
        label: 'Elevated risk',
        condition: '> 60%',
        interpretation:
          'High risk of portfolio overheating in certain segments.'
      }
    ],
    caveats: [
      'Approaching the credit policy limit can artificially understate the actual delta.',
      'For cross-segment periods, the comparison threshold should use the same credit score level.'
    ]
  }
];

export const metricCatalogItems: MetricCatalogItem[] = metricCatalog;

export const getMetricById = (metricId: string): MetricCatalogItem => {
  const match = metricCatalogItems.find((item) => item.id === metricId);
  return match ?? metricCatalogItems[0];
};
