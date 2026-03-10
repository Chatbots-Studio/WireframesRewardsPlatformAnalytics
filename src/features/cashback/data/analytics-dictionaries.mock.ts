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
      'Події процесингу кешбеку: активації категорій, транзакції, нарахування, виплати.',
    type: 'event_stream',
    owner: 'Cashback Core',
    refreshPolicy: 'near real-time',
    status: 'active'
  },
  {
    id: 'SRC-CRM-COMM',
    name: 'CRM Campaign History',
    description:
      'Історія комунікацій по кампаніях (in-app/push/email/sms/call), завантаження або API.',
    type: 'api',
    owner: 'CRM / Marketing',
    refreshPolicy: 'hourly',
    status: 'planned'
  },
  {
    id: 'SRC-SEG-UPLOAD',
    name: 'Segments Upload',
    description:
      'Файлова привʼязка клієнтів до сегментів до запуску автоматичного модуля сегментації.',
    type: 'file_upload',
    owner: 'Product Analytics',
    refreshPolicy: 'on demand',
    status: 'active'
  },
  {
    id: 'SRC-DWH-TX',
    name: 'Transactions DWH',
    description:
      'Агрегати транзакцій і карткової активності для побудови метрик за періоди.',
    type: 'dwh',
    owner: 'Data Platform',
    refreshPolicy: 'daily',
    status: 'active'
  },
  {
    id: 'SRC-FIN-PNL',
    name: 'Financial PnL',
    description:
      'Дохід банку по клієнтах та продуктах (інтерчендж, комісії, кредитні доходи).',
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
      'Картковий продукт для масового сегмента. Аналітика побудована на подіях вибору категорії та транзакцій.',
    productSourceId: 'SRC-CB-WEBHOOKS',
    activeConditions: [
      'Картка активна та не заблокована',
      'Є принаймні один вхід у мобільний застосунок за останні 30 днів',
      'Категорія кешбеку обрана у поточному календарному місяці'
    ],
    inactiveConditions: [
      'Картка заблокована або закрита',
      'Відсутня активність у застосунку понад 30 днів',
      'Категорія не обрана у поточному календарному місяці'
    ],
    targetActions: [
      {
        id: 'TA-RADA-CATEGORY-SELECT',
        name: 'Вибір категорії кешбеку',
        definition:
          'Клієнт відкрив екран кешбеку та підтвердив вибір категорії в поточному місяці.',
        identificationMethod:
          'event_name = cashback_category_selected AND period_month = current_month',
        dataSourceId: 'SRC-CB-WEBHOOKS'
      },
      {
        id: 'TA-RADA-CB-TX',
        name: 'Транзакція з нарахованим кешбеком',
        definition:
          'Транзакція по картці, яка підпала під активне правило кешбеку та отримала нарахування.',
        identificationMethod:
          'event_name = cashback_accrued AND cashback_amount > 0',
        dataSourceId: 'SRC-CB-WEBHOOKS'
      },
      {
        id: 'TA-RADA-CB-PAYOUT',
        name: 'Отримання кешбеку клієнтом',
        definition:
          'Кошти кешбеку виведені клієнту на рахунок після нарахування.',
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
      'Продукт депозитів з аналітикою впливу кешбек-пропозицій на поведінку сегментів.',
    productSourceId: 'SRC-DWH-TX',
    activeConditions: [
      'Є чинний депозитний договір',
      'Клієнт потрапляє у цільовий сегмент кампанії',
      'Кампанія активна у межах вікна атрибуції 30 днів'
    ],
    inactiveConditions: [
      'Депозит закритий',
      'Клієнт виключений із сегменту кампанії',
      'Вікно атрибуції 30 днів минуло'
    ],
    targetActions: [
      {
        id: 'TA-DEP-PRODUCT-VIEW',
        name: 'Перегляд депозитної пропозиції',
        definition:
          'Клієнт відкрив деталі депозитної пропозиції після комунікації.',
        identificationMethod:
          'event_name = deposit_offer_viewed AND attribution_window_days <= 30',
        dataSourceId: 'SRC-CRM-COMM'
      },
      {
        id: 'TA-DEP-OPEN',
        name: 'Відкриття депозиту',
        definition:
          'Клієнт відкрив депозит після взаємодії з комунікацією та/або кешбек-офером.',
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
      'Зарплатний продукт, де оцінюємо активацію та утримання клієнтів через персональні кампанії.',
    productSourceId: 'SRC-SEG-UPLOAD',
    activeConditions: [
      'Клієнт входить у завантажений цільовий сегмент',
      'Отримано мінімум одне зарахування зарплати за останній місяць'
    ],
    inactiveConditions: [
      'Клієнт відсутній у поточному сегменті',
      'Немає зарплатних зарахувань більше 30 днів'
    ],
    targetActions: [
      {
        id: 'TA-SAL-SEGMENT-ENTER',
        name: 'Потрапляння в цільовий сегмент',
        definition:
          'Клієнт присутній у файлі сегментації або отриманий з модуля сегментів.',
        identificationMethod: 'segment_id IS NOT NULL AND assigned_at IS NOT NULL',
        dataSourceId: 'SRC-SEG-UPLOAD'
      },
      {
        id: 'TA-SAL-ACTIVE-CARD-TX',
        name: 'Активна карткова транзакція',
        definition:
          'Після потрапляння у сегмент клієнт здійснив щонайменше одну покупку.',
        identificationMethod:
          'tx_count_after_segment_assignment >= 1 within 30 days',
        dataSourceId: 'SRC-DWH-TX'
      },
      {
        id: 'TA-SAL-RETENTION-30D',
        name: 'Утримання 30 днів',
        definition:
          'Клієнт залишився активним через 30 днів після першої цільової дії.',
        identificationMethod:
          'is_active_on_day_30 = true (cohort retention check)'
      }
    ]
  }
];
