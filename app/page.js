"use client";
import { useState, useEffect, useCallback } from "react";

const SIGNAL_CONFIG = {
  undervalued: { bg: "#0d2b1a", border: "#1a5c35", text: "#34d17a", dot: "#34d17a", label: "저평가 🟢" },
  fair:        { bg: "#1e1d0a", border: "#4a4200", text: "#f0c040", dot: "#f0c040", label: "적정 🟡" },
  high:        { bg: "#2a1800", border: "#6b3300", text: "#ff8c42", dot: "#ff8c42", label: "다소 고평가 🟠" },
  overvalued:  { bg: "#2a0a0a", border: "#6b1414", text: "#ff4d4d", dot: "#ff4d4d", label: "고평가 🔴" },
  unknown:     { bg: "#141414", border: "#2a2a2a", text: "#888", dot: "#888", label: "데이터 없음" },
  error:       { bg: "#141414", border: "#2a2a2a", text: "#888", dot: "#888", label: "오류" },
  gray:        { bg: "#141414", border: "#2a2a2a", text: "#888", dot: "#888", label: "-" },
};

function getSignalStyle(color) {
  return SIGNAL_CONFIG[color] || SIGNAL_CONFIG.gray;
}

function ValuationBar({ pe, ranges, barPos }) {
  if (!pe || barPos === null) return null;

  const zones = [
    { label: "저평가", flex: 1, color: "#1a5c35" },
    { label: "적정", flex: 1.5, color: "#4a4200" },
    { label: "다소고평가", flex: 1, color: "#6b3300" },
    { label: "고평가", flex: 1, color: "#6b1414" },
  ];

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "10px", color: "#555", fontFamily: "'Space Mono', monospace" }}>
          저평가 ≤{ranges.undervalued}x
        </span>
        <span style={{ fontSize: "10px", color: "#555", fontFamily: "'Space Mono', monospace" }}>
          고평가 {'>'}
          {ranges.overvalued}x
        </span>
      </div>

      <div style={{ position: "relative", height: "8px", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
        {zones.map((z, i) => (
          <div
            key={i}
            style={{
              flex: z.flex,
              background: z.color,
              opacity: 0.6,
            }}
          />
        ))}
        {/* Indicator needle */}
        <div
          style={{
            position: "absolute",
            top: "-3px",
            left: `${barPos}%`,
            transform: "translateX(-50%)",
            width: "3px",
            height: "14px",
            background: "#fff",
            borderRadius: "2px",
            boxShadow: "0 0 6px rgba(255,255,255,0.8)",
          }}
        />
      </div>

      {/* Zone labels */}
      <div style={{ display: "flex", marginTop: "4px" }}>
        {zones.map((z, i) => (
          <div key={i} style={{ flex: z.flex, textAlign: "center" }}>
            <span style={{ fontSize: "9px", color: "#444" }}>{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndexCard({ item }) {
  const sig = getSignalStyle(item.signal?.color);

  return (
    <div
      style={{
        background: sig.bg,
        border: `1px solid ${sig.border}`,
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative corner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60px",
          height: "60px",
          background: `radial-gradient(circle at top right, ${sig.border}80, transparent)`,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <span style={{ fontSize: "20px" }}>{item.flag}</span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#e8e8e8",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {item.name}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>{item.description}</div>
        </div>

        {/* Signal badge */}
        <div
          style={{
            background: `${sig.dot}20`,
            border: `1px solid ${sig.border}`,
            borderRadius: "20px",
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: sig.dot,
              boxShadow: `0 0 6px ${sig.dot}`,
            }}
          />
          <span style={{ fontSize: "12px", color: sig.text, fontWeight: "600" }}>
            {item.signal?.label || "—"}
          </span>
        </div>
      </div>

      {/* Main data row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {/* PER */}
        <div>
          <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px", fontFamily: "'Space Mono', monospace" }}>
            P/E ({item.peType === "forward" ? "FWD" : "TTM"})
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: sig.text,
              fontFamily: "'Space Mono', monospace",
              lineHeight: 1,
            }}
          >
            {item.pe ? item.pe.toFixed(1) : "—"}
          </div>
          <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>
            역사적 평균 {item.historicalAvg}x
          </div>
        </div>

        {/* Price */}
        <div>
          <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px", fontFamily: "'Space Mono', monospace" }}>
            현재가
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#ccc",
              fontFamily: "'Space Mono', monospace",
              lineHeight: 1,
            }}
          >
            {item.price ? item.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—"}
          </div>
        </div>

        {/* Change */}
        <div>
          <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px", fontFamily: "'Space Mono', monospace" }}>
            등락률
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: item.changePercent > 0 ? "#34d17a" : item.changePercent < 0 ? "#ff4d4d" : "#888",
              fontFamily: "'Space Mono', monospace",
              lineHeight: 1,
            }}
          >
            {item.changePercent != null
              ? `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`
              : "—"}
          </div>
        </div>
      </div>

      {/* Valuation bar */}
      <ValuationBar pe={item.pe} ranges={item.ranges} barPos={item.barPos} />

      {/* Premium vs historical */}
      {item.pe && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "#0a0a0a40",
            borderRadius: "8px",
            fontSize: "11px",
            color: "#666",
          }}
        >
          역사적 평균 대비{" "}
          <span style={{ color: sig.text, fontWeight: "600" }}>
            {item.pe > item.historicalAvg ? "+" : ""}
            {(((item.pe - item.historicalAvg) / item.historicalAvg) * 100).toFixed(0)}%
          </span>{" "}
          수준
          {item.pe > item.historicalAvg
            ? " (프리미엄)"
            : " (할인)"}
        </div>
      )}
    </div>
  );
}

function OverallSummary({ data }) {
  if (!data?.length) return null;

  const withPE = data.filter((d) => d.pe);
  const signals = withPE.map((d) => d.signal?.color);
  const redCount = signals.filter((s) => s === "overvalued" || s === "high").length;
  const greenCount = signals.filter((s) => s === "undervalued").length;

  let overall, overallColor, overallDesc;
  if (redCount >= 3) {
    overall = "전반적 고평가";
    overallColor = "#ff4d4d";
    overallDesc = "대부분 지수가 역사적 고평가 구간입니다. 분할매수 비중 축소를 고려하세요.";
  } else if (redCount >= 2) {
    overall = "부분적 고평가";
    overallColor = "#ff8c42";
    overallDesc = "일부 지수가 고평가 구간입니다. 정기 분할매수를 유지하되 신중하게 접근하세요.";
  } else if (greenCount >= 2) {
    overall = "매수 기회 구간";
    overallColor = "#34d17a";
    overallDesc = "저평가 지수가 많습니다. 분할매수 비중 확대를 고려할 수 있습니다.";
  } else {
    overall = "적정 ~ 다소 고평가";
    overallColor = "#f0c040";
    overallDesc = "혼조세입니다. 정기 분할매수(DCA) 전략을 유지하세요.";
  }

  return (
    <div
      style={{
        background: "#0e0e1a",
        border: `1px solid ${overallColor}40`,
        borderLeft: `3px solid ${overallColor}`,
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
      }}
    >
      <div style={{ fontSize: "11px", color: "#555", marginBottom: "6px", fontFamily: "'Space Mono', monospace" }}>
        종합 판단
      </div>
      <div style={{ fontSize: "18px", fontWeight: "700", color: overallColor, marginBottom: "6px" }}>
        {overall}
      </div>
      <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>{overallDesc}</div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/valuation");
      const json = await res.json();
      setData(json.data);
      setUpdatedAt(json.updatedAt);
    } catch (e) {
      setError("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c14",
        fontFamily: "'Pretendard', -apple-system, sans-serif",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "0 0 40px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "28px 20px 20px",
          borderBottom: "1px solid #1a1a2e",
          background: "linear-gradient(180deg, #0a0e1a 0%, #080c14 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontSize: "11px",
                color: "#4a7aff",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "2px",
                marginBottom: "6px",
              }}
            >
              VALUATION MONITOR
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "700",
                color: "#e8e8f0",
                lineHeight: 1.2,
              }}
            >
              지수 밸류에이션
              <br />
              대시보드
            </h1>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              background: loading ? "#1a1a2e" : "#1e2d5a",
              border: "1px solid #2a3a6a",
              borderRadius: "10px",
              color: loading ? "#444" : "#6a9fff",
              padding: "10px 14px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontFamily: "'Space Mono', monospace",
              transition: "all 0.2s",
            }}
          >
            {loading ? "로딩중..." : "새로고침"}
          </button>
        </div>
        {updatedAt && (
          <div style={{ marginTop: "10px", fontSize: "11px", color: "#444", fontFamily: "'Space Mono', monospace" }}>
            업데이트: {formatTime(updatedAt)} KST
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
            <div
              style={{
                fontSize: "13px",
                fontFamily: "'Space Mono', monospace",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              데이터 수집 중...
            </div>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              background: "#2a0a0a",
              border: "1px solid #6b1414",
              borderRadius: "12px",
              padding: "20px",
              color: "#ff4d4d",
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && data && (
          <>
            <OverallSummary data={data} />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.map((item) => (
                <IndexCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Legend */}
        {!loading && (
          <div
            style={{
              marginTop: "28px",
              padding: "16px",
              background: "#0e0e1a",
              borderRadius: "12px",
              border: "1px solid #1a1a2e",
            }}
          >
            <div style={{ fontSize: "11px", color: "#555", marginBottom: "10px", fontFamily: "'Space Mono', monospace" }}>
              판단 기준 (Trailing P/E)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { color: "#34d17a", label: "저평가", desc: "역사적 저점 구간 → 매수 적극 고려" },
                { color: "#f0c040", label: "적정", desc: "역사적 평균 근처 → 분할매수 유지" },
                { color: "#ff8c42", label: "다소 고평가", desc: "평균 이상 → 신중한 접근" },
                { color: "#ff4d4d", label: "고평가", desc: "역사적 고점 근처 → 비중 축소 고려" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "11px", color: item.color, width: "70px", flexShrink: 0 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: "11px", color: "#555" }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "16px", fontSize: "10px", color: "#333", textAlign: "center", lineHeight: 1.6 }}>
          * 본 대시보드는 투자 참고용입니다. 투자 결과에 대한 책임은 본인에게 있습니다.
          <br />
          PER 데이터 출처: Yahoo Finance
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
