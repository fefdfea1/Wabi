import type { Country, CountryCode, GuideItem, GuideSituation, PainItem, Task } from "@/Front/common/types/domain";

/**
 * discussion.md 6.2절: 여기의 값은 Research-team이 공식 출처로 확인한 것만 담는다.
 * 조사에서 확인되지 않은 항목은 임의로 채우지 않고 아예 넣지 않는다.
 * 조사 원본: Research-team/Result/Data/워킹홀리데이_준비정보.json (2026-08-28 재검증분)
 *
 * 국가마다 제도가 크게 달라(나이 상한 30·35·25세, 보험 의무 여부, 절차 순서)
 * 할 일·가이드·어려움을 모두 국가별로 나눈다.
 */

export const COUNTRIES: Country[] = [
  {
    code: "AU",
    label: "호주",
    stayDurationDays: 365,
    sourceUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/first-working-holiday-417",
  },
  {
    code: "CA",
    label: "캐나다",
    stayDurationDays: 730,
    sourceUrl: "https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100013",
  },
  {
    code: "JP",
    label: "일본",
    stayDurationDays: 365,
    sourceUrl: "https://www.busan.kr.emb-japan.go.jp/itpr_ko/nsm_023.html",
  },
];

const AU_TASKS: Task[] = [
  {
    id: "au-visa",
    phase: "pre",
    title: "워킹홀리데이 비자 신청",
    tag: "출국 전 · 서류",
    body:
      "만 18세부터 30세까지 신청할 수 있고 잔고 증명으로 AUD 5,000을 요구합니다. 1회 비자로 최대 12개월 체류할 수 있으며 지역 필수노동 등 요건을 채우면 2차·3차 비자로 최대 3년까지 이어갈 수 있습니다.",
    items: ["여권", "잔고 증명 AUD 5,000", "ImmiAccount 계정"],
    done: false,
    sourceUrl:
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/first-working-holiday-417",
  },
  {
    id: "au-insurance",
    phase: "pre",
    title: "건강보험 가입",
    tag: "출국 전 · 필수",
    body:
      "비자 조건 8501에 따라 체류 기간 전체를 덮는 적정한 건강보험을 유지해야 합니다. 분실과 취소를 주로 보장하는 일반 여행자보험으로는 이 조건을 충족하지 못하며 OVHC 같은 건강보험이 필요합니다.",
    items: ["체류 기간 전체 보장", "OVHC 등 건강보험", "증서 저장"],
    done: false,
    sourceUrl:
      "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health/adequate-health-insurance",
  },
  {
    id: "au-bank",
    phase: "post",
    title: "은행 계좌 개설",
    tag: "현지 정착 · 금융",
    body:
      "정부가 정한 표준 요건은 없고 은행마다 다릅니다. 주요 은행들이 공통으로 여권과 비자를 요구하며, 계좌를 먼저 연 뒤 정해진 기간 안에 지점에서 신원 확인을 마쳐야 합니다. 커먼웰스은행은 개설 후 20일 이내에 여권 원본을 지점에 제시하지 않으면 계좌가 해지될 수 있습니다.",
    items: ["여권 원본", "비자", "호주 내 주소"],
    done: false,
    sourceUrl: "https://www.commbank.com.au/moving-to-australia.html",
  },
  {
    id: "au-bond",
    phase: "post",
    title: "임대 보증금 조건 확인",
    tag: "현지 정착 · 주거",
    body:
      "연방 단일법이 없어 주마다 규정이 다릅니다. 뉴사우스웨일스는 보증금이 주 임대료 4주치를 넘을 수 없고 임대인은 받은 날부터 10영업일 이내에 NSW Fair Trading에 예치해야 합니다.",
    items: ["보증금 한도 확인", "예치 여부 확인", "입주 전 상태 사진"],
    done: false,
    sourceUrl: "https://legislation.nsw.gov.au/view/pdf/inforce/2018-08-21/act-2010-042",
  },
];

const CA_TASKS: Task[] = [
  {
    id: "ca-visa",
    phase: "pre",
    title: "워킹홀리데이 비자 신청",
    tag: "출국 전 · 서류",
    body:
      "만 18세부터 35세까지 신청할 수 있습니다. 서류를 모두 갖춘 신청은 56일 안에 처리하는 것이 공식 기준이며 이를 넘기면 수수료 일부가 환불됩니다. 1회 참가로 최초 입국일부터 최대 24개월 체류할 수 있습니다.",
    items: ["여권", "잔고 증명 CAD 2,500", "바이오메트릭 등록"],
    done: false,
    sourceUrl:
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/after-apply-next-steps.html",
  },
  {
    id: "ca-insurance",
    phase: "pre",
    title: "보험 가입",
    tag: "출국 전 · 필수",
    body:
      "입국 심사에서 보험 증빙을 요구받습니다. 응급의료와 입원과 본국 송환 세 가지를 모두 포함하고 체류 예정 기간 전체를 덮는 보험을 입국 전에 미리 사 두어야 합니다. 주정부 건강카드만으로는 충분하지 않습니다.",
    items: ["응급의료 보장", "입원 보장", "본국 송환 보장"],
    done: false,
    sourceUrl:
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/prepare-arrival.html",
  },
  {
    id: "ca-sin",
    phase: "post",
    title: "SIN 신청",
    tag: "현지 정착 · 행정",
    body:
      "온라인 신청이 가장 빨라 약 5영업일 안에 확인서를 받을 수 있습니다. 취업을 시작하면 고용주가 3영업일 이내에 SIN을 요청하게 되어 있어 미리 받아 두는 편이 낫습니다.",
    items: ["워크퍼밋", "여권"],
    done: false,
    sourceUrl:
      "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4001/employers-guide-payroll-deductions-remittances.html",
  },
  {
    id: "ca-sim",
    phase: "post",
    title: "유심 개통",
    tag: "현지 정착 · 통신",
    body: "여권과 워크퍼밋을 가지고 매장을 방문하면 개통할 수 있습니다.",
    items: ["여권", "워크퍼밋"],
    done: false,
    sourceUrl: "https://www.rogers.com/newcomers",
  },
  {
    id: "ca-ohip",
    phase: "post",
    title: "주 공보험 등록",
    tag: "현지 정착 · 의료",
    body:
      "온타리오의 OHIP은 한 고용주 밑에서 정규직으로 6개월 이상 근무해야 신청할 수 있습니다. 대기 기간은 폐지되어 자격을 채우면 신청 당일부터 적용됩니다. 사본은 받지 않으니 원본 서류를 준비하십시오.",
    items: ["신분 증빙 원본", "거주 증빙 원본", "신원 증빙 원본"],
    done: false,
    sourceUrl: "https://www.ontario.ca/page/apply-ohip-and-get-health-card",
  },
];

const JP_TASKS: Task[] = [
  {
    id: "jp-visa",
    phase: "pre",
    title: "워킹홀리데이 비자 신청",
    tag: "출국 전 · 서류",
    body:
      "만 18세부터 25세까지 신청할 수 있습니다. 연 4회 분기로 접수해 일괄 심사하며 접수 마감일부터 결과 발표까지 약 32일에서 39일이 걸립니다. 1회당 최대 1년 체류할 수 있고 일본 안에서는 기간을 연장할 수 없습니다.",
    items: ["여권", "잔고 증명 약 280만원", "제출 서류 12종"],
    done: false,
    sourceUrl: "https://www.kr.emb-japan.go.jp/itpr_ko/visa_working.html",
  },
  {
    id: "jp-move-in",
    phase: "post",
    title: "전입신고",
    tag: "현지 정착 · 행정",
    body:
      "주민기본대장법 제22조에 따른 법적 의무이며 어기면 5만엔 이하의 과태료가 부과됩니다. 전입신고를 마쳐야 주민표가 만들어지고 마이넘버 통지와 국민건강보험 가입 같은 다음 절차를 진행할 수 있습니다.",
    items: ["재류카드", "여권"],
    done: false,
  },
  {
    id: "jp-nhi",
    phase: "post",
    title: "국민건강보험 가입",
    tag: "현지 정착 · 의료",
    body:
      "거주지 시구정촌 창구에서 가입을 신고합니다. 전입신고와 기한이 같고 같은 창구에서 함께 처리할 수 있습니다.",
    items: ["재류카드", "마이넘버 확인 서류", "본인확인 서류"],
    done: false,
    sourceUrl: "https://www.mhlw.go.jp/stf/newpage_21539.html",
  },
  {
    id: "jp-sim",
    phase: "post",
    title: "유심 개통",
    tag: "현지 정착 · 통신",
    body:
      "도코모와 au와 소프트뱅크 모두 재류카드를 본인확인 서류로 요구합니다. 재류 기한이 90일 미만으로 남으면 결제 수단과 할부에 제한이 걸리므로 초반에 처리하는 편이 낫습니다.",
    items: ["재류카드", "여권"],
    done: false,
    sourceUrl: "https://www.nttdocomo.co.jp/support/procedure/document/verifying/",
  },
  {
    id: "jp-shikikin",
    phase: "post",
    title: "시키킹 반환 조건 확인",
    tag: "현지 정착 · 주거",
    body:
      "2020년 시행된 개정 민법 제622조의2가 시키킹의 정의와 반환 의무를 처음으로 명문화했습니다. 임대차가 끝나고 집을 돌려주는 시점에 채무불이행액을 뺀 나머지를 임대인이 반환합니다.",
    items: ["계약서 사본", "입주 전 상태 기록"],
    done: false,
    sourceUrl: "https://tek-law.jp/civil-code/claims/contracts/leases/article-622-2/",
  },
];

export const TASKS_BY_COUNTRY: Record<CountryCode, Task[]> = {
  AU: AU_TASKS,
  CA: CA_TASKS,
  JP: JP_TASKS,
};

export const GUIDE_BY_COUNTRY: Record<CountryCode, Record<GuideSituation, GuideItem[]>> = {
  AU: {
    pre: [
      {
        id: "au-g-insurance",
        title: "일반 여행자보험으로도 되나요?",
        body:
          "되지 않습니다.\n비자 조건 8501은 체류 기간 전체를 덮는 적정한 건강보험을 요구하는데, 분실과 취소를 주로 보장하는 일반 여행자보험은 이 조건을 충족하지 못합니다.",
        points: [
          "OVHC 같은 건강보험 상품을 고릅니다",
          "체류 기간 전체를 덮는지 확인합니다",
          "증서는 문서 탭에 저장해 둡니다",
        ],
        sourceUrl:
          "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health/adequate-health-insurance",
      },
      {
        id: "au-g-balance",
        title: "잔고 증명은 얼마가 필요한가요?",
        body: "AUD 5,000입니다.\n신청 요건에 명시된 금액입니다.",
        points: ["신청 전에 잔고 증명서를 준비합니다", "만 18세부터 30세까지 신청할 수 있습니다"],
        sourceUrl:
          "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/first-working-holiday-417",
      },
    ],
    post: [
      {
        id: "au-g-bond",
        title: "보증금은 얼마까지 받을 수 있나요?",
        body:
          "주마다 다릅니다.\n뉴사우스웨일스 기준으로 보증금은 주 임대료 4주치를 넘을 수 없습니다.",
        points: [
          "임대인은 받은 날부터 10영업일 이내에 예치해야 합니다",
          "통상적인 마모를 넘는 손상이 없으면 돌려받습니다",
          "실제 거주할 주의 규정을 다시 확인합니다",
        ],
        sourceUrl: "https://legislation.nsw.gov.au/view/pdf/inforce/2018-08-21/act-2010-042",
      },
    ],
  },
  CA: {
    pre: [
      {
        id: "ca-g-insurance",
        title: "보험은 꼭 들어야 하나요?",
        body:
          "필요합니다.\n입국 심사에서 보험 증빙을 요구받으며, 입국 전에 미리 사 두어야 합니다.",
        points: [
          "응급의료와 입원과 본국 송환을 모두 포함해야 합니다",
          "체류 예정 기간 전체를 덮어야 합니다",
          "주정부 건강카드만으로는 충분하지 않습니다",
        ],
        sourceUrl:
          "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/prepare-arrival.html",
      },
      {
        id: "ca-g-balance",
        title: "잔고 증명은 얼마가 필요한가요?",
        body:
          "CAD 2,500입니다.\n체류 첫 3개월 생활비를 충당할 수 있어야 한다는 기준에서 나온 금액입니다.",
        points: [
          "잔고 증명서는 출발 전 1주일 이내 발급분이어야 합니다",
          "CAD 10,000 이상을 가지고 입국하면 신고해야 합니다",
        ],
        sourceUrl:
          "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/prepare-arrival.html",
      },
    ],
    post: [
      {
        id: "ca-g-sin",
        title: "SIN이 없으면 세금을 더 떼나요?",
        body:
          "아닙니다.\n캐나다에는 SIN이 없다고 세율을 올려 떼는 제도가 없습니다. SIN 유무와 관계없이 표준 원천징수가 그대로 적용됩니다.",
        points: [
          "다만 취업 후에는 고용주가 3영업일 이내에 SIN을 요청합니다",
          "온라인으로 신청하면 약 5영업일 안에 확인서를 받습니다",
        ],
        sourceUrl:
          "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4001/employers-guide-payroll-deductions-remittances.html",
      },
      {
        id: "ca-g-ohip",
        title: "공보험은 언제부터 쓸 수 있나요?",
        body:
          "자격 요건을 채운 뒤부터입니다.\n온타리오의 OHIP은 한 고용주 밑에서 정규직으로 6개월 이상 근무해야 신청할 수 있습니다.",
        points: [
          "대기 기간은 폐지되어 자격을 채우면 신청 당일부터 적용됩니다",
          "여러 직장을 짧게 옮기면 요건을 채우지 못할 수 있습니다",
          "신청 시 사본은 받지 않으므로 원본을 가져갑니다",
        ],
        sourceUrl: "https://www.ontario.ca/page/apply-ohip-and-get-health-card",
      },
    ],
  },
  JP: {
    pre: [
      {
        id: "jp-g-age",
        title: "나이 제한이 어떻게 되나요?",
        body: "만 18세부터 25세까지입니다.\n호주와 캐나다보다 상한이 낮습니다.",
        points: ["1회당 최대 1년 체류할 수 있습니다", "일본 안에서는 체류 기간을 연장할 수 없습니다"],
        sourceUrl: "https://www.kr.emb-japan.go.jp/itpr_ko/visa_working.html",
      },
      {
        id: "jp-g-insurance",
        title: "보험은 꼭 들어야 하나요?",
        body:
          "비자 요건은 아닙니다.\n워킹홀리데이 사증의 공식 제출 서류 목록에 보험 증서가 들어 있지 않습니다.",
        points: [
          "다만 현지 도착 후에는 국민건강보험에 가입합니다",
          "가입 기한은 전입일부터 14일 이내입니다",
        ],
        sourceUrl: "https://www.kr.emb-japan.go.jp/itpr_ko/visa_working_documents.html",
      },
    ],
    post: [
      {
        id: "jp-g-order",
        title: "도착 후 무엇부터 해야 하나요?",
        body:
          "전입신고가 먼저입니다.\n전입신고를 마쳐야 주민표가 만들어지고 마이넘버 통지와 국민건강보험 가입 같은 다음 절차가 가능해집니다.",
        points: [
          "기한은 전입일부터 14일 이내입니다",
          "마이넘버는 따로 신청하지 않아도 우편으로 옵니다",
          "국민건강보험은 같은 창구에서 함께 처리할 수 있습니다",
        ],
        sourceUrl: "https://www.mhlw.go.jp/stf/newpage_21539.html",
      },
    ],
  },
};

export const PAIN_BY_COUNTRY: Record<CountryCode, PainItem[]> = {
  AU: [
    {
      id: "au-p-wage",
      num: 1,
      when: "근로 시작 후",
      title: "법정 최저 조건에 못 미치는 급여",
      body:
        "이주노동자 10,000명을 대상으로 한 호주 최대 규모 실태조사에서, 응답자의 65%가 법정 최저 근로조건보다 낮은 급여를 받았고 36%는 법정 최저임금에도 못 미치는 급여를 받은 것으로 나타났습니다.",
      points: [
        "근무 시간을 매일 직접 기록합니다",
        "급여명세서를 반드시 요구합니다",
        "최저임금 기준을 미리 확인해 둡니다",
      ],
      sourceUrl:
        "https://www.unsw.edu.au/newsroom/news/2026/05/survey-hidden-system-migrant-worker-exploitation",
    },
  ],
  CA: [
    {
      id: "ca-p-scam",
      num: 1,
      when: "도착 첫 달",
      title: "렌트·환전·수표 사기",
      body:
        "외교부 산하 워킹홀리데이 인포센터가 세 가지 사기 유형을 공식적으로 경고하고 있습니다. 집주인 행세를 하는 렌트 사기, 개인 간 비대면 환전 후 연락이 끊기는 환전 사기, 가짜 수표를 이용한 사기입니다.",
      points: [
        "집을 계약하기 전 실제 소유자인지 확인합니다",
        "개인 간 비대면 환전을 피합니다",
        "받은 수표는 은행에서 확인된 뒤에 처리합니다",
      ],
      sourceUrl: "https://whic.mofa.go.kr/whic/safety/info_view.jsp?idx=15206",
    },
    {
      id: "ca-p-entry",
      num: 2,
      when: "입국 심사",
      title: "입국 목적이 불분명해 겪는 입국 거부",
      body:
        "입국 목적이 불분명하다는 이유로 공항에서 입국을 거부당하는 사례가 자주 발생한다고 안내되어 있습니다. 아시안을 대상으로 한 증오범죄가 늘고 있다는 주의도 함께 나와 있습니다.",
      points: [
        "체류 계획과 숙소 정보를 정리해 둡니다",
        "보험 증빙과 잔고 증명을 손에 닿는 곳에 둡니다",
      ],
      sourceUrl: "https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100013",
    },
  ],
  JP: [
    {
      id: "jp-p-community",
      num: 1,
      when: "체류 중",
      title: "현지에서 기댈 곳이 없다는 어려움",
      body:
        "외교부가 참가자 432명을 대상으로 한 설문에서 전체 만족도는 84%, 재참여 의사는 96%로 높게 나타났습니다. 다만 주요 건의사항의 첫 번째가 참가자 간 소통을 위한 현지 커뮤니티와 네트워크였습니다.",
      points: [
        "출국 전에 현지 모임이나 커뮤니티를 미리 찾아 둡니다",
        "주 1회 고정 약속을 하나 만듭니다",
      ],
      sourceUrl: "https://www.mofa.go.kr/www/brd/m_4080/view.do?seq=353806",
    },
  ],
};
