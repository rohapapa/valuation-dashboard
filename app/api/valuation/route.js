const INDICES = [
  {
    id: "sp500",
    name: "S&P 500",
    symbol: "^GSPC",
    peSymbol: "SPY",
    flag: "🇺🇸",
    historicalAvg: 17,
    ranges: { undervalued: 18, fair: 25, overvalued: 32 },
    description: "미국 대형주 500개",
  },
  {
    id: "nasdaq100",
    name: "NASDAQ 100",
    symbol: "^NDX",
    peSymbol: "QQQ",
    flag: "🇺🇸",
    historicalAvg: 25,
    ranges: { undervalued: 22, fair: 33, overvalued: 42 },
    description: "미국 기술주 중심 100개",
  },
  {
    id: "kospi",
    name: "KOSPI 200",
    symbol: "^KS11",
    peSymbol: "EWY",
    flag: "🇰🇷",
    historicalAvg: 11,
    ranges: { undervalued: 10, fair: 15, overvalued: 20 },
    description: "한국 대표 지수 (코스피 기준)",
  },
  {
    id: "csi300",
    name: "CSI 300",
    symbol: "000300.SS",
    peSymbol: "ASHR",
    flag: "🇨🇳",
    historicalAvg: 13,
    ranges: { undervalued: 12, fair: 18, overvalued: 25 },
    description: "중국 상하이/선전 대형주 300개",
  },
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

// 가격: 지수 심볼로 조회
async function fetchPrice(symbol) {
  try {
    const encoded = encodeURIComponent(symbol);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1d`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return { price: null, changePercent: null };
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return { price: null, changePercent: null };
    const price = meta.regularMarketPrice ?? null;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
    const changePercent = price && prevClose ? ((price - prevClose) / prevClose) * 100 : null;
    return { price, changePercent };
  } catch {
    return { price: null, changePercent: null };
  }
}

// PER: v7 quote API로 ETF 심볼 조회 (더 안정적)
async function fetchAllPE(peSymbols) {
  try {
    const symbolStr = peSymbols.join("%2C");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}&fields=trailingPE%2CforwardPE`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return {};
    const data = await res.json();
    const quotes = data?.quoteResponse?.result ?? [];
    const peMap = {};
    for (const q of quotes) {
      peMap[q.symbol] = {
        trailingPE: q.trailingPE ?? null,
        forwardPE: q.forwardPE ?? null,
      };
    }
    return peMap;
  } catch {
    return {};
  }
}

function getSignal(pe, ranges) {
  if (!pe || pe <= 0) return { level: "unknown", label: "데이터 없음", color: "gray" };
  if (pe <= ranges.undervalued) return { level: "undervalued", label: "저평가", color: "green" };
  if (pe <= ranges.fair) return { level: "fair", label: "적정", color: "yellow" };
  if (pe <= ranges.overvalued) return { level: "high", label: "다소 고평가", color: "orange" };
  return { level: "overvalued", label: "고평가", color: "red" };
}

function getBarPosition(pe, ranges) {
  const min = ranges.undervalued * 0.5;
  const max = ranges.overvalued * 1.5;
  const pos = ((pe - min) / (max - min)) * 100;
  return Math.min(Math.max(pos, 2), 98);
}

export async function GET() {
  // PE는 한 번에 일괄 조회 (API 호출 최소화)
  const peSymbols = INDICES.map((i) => i.peSymbol);
  const peMap = await fetchAllPE(peSymbols);

  const results = await Promise.all(
    INDICES.map(async (index) => {
      try {
        const { price, changePercent } = await fetchPrice(index.symbol);
        const { trailingPE, forwardPE } = peMap[index.peSymbol] ?? {};
        const pe = trailingPE && trailingPE > 0 ? trailingPE : (forwardPE && forwardPE > 0 ? forwardPE : null);
        const peType = trailingPE && trailingPE > 0 ? "trailing" : (forwardPE ? "forward" : null);
        const signal = getSignal(pe, index.ranges);
        const barPos = pe ? getBarPosition(pe, index.ranges) : null;
        return { ...index, price, changePercent, pe, peType, signal, barPos };
      } catch (err) {
        return {
          ...index,
          pe: null,
          signal: { level: "error", label: "오류", color: "gray" },
          barPos: null,
          error: err.message,
        };
      }
    })
  );

  // 중복 제거 (id 기준)
  const seen = new Set();
  const deduped = results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return Response.json(
    {
      data: deduped,
      updatedAt: new Date().toISOString(),
      note: "PER 출처: SPY(S&P500), QQQ(나스닥), EWY(한국), ASHR(중국) ETF 기준",
    },
    {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    }
  );
}
