import { useState } from "react";
import { financeApi, uploadPortfolioStatement } from "../services/api";

type PortfolioTxn = {
  scheme_code: number;
  scheme_name: string;
  date: string;
  amount: number;
  units: number;
  txn_type: string;
};

type PortfolioResult = {
  portfolio_value: number;
  xirr: number;
  holdings: Array<{ scheme_code: number; scheme_name: string; units: number; market_value: number; weight: number }>;
  overlap_analysis: { pair_count: number; high_overlap_pairs: Array<{ fund_a: string; fund_b: string; similarity_score: number }> };
  expense_ratio_drag: { weighted_expense_ratio_percent: number; annual_drag_rupees: number };
  benchmark_comparison: { benchmark_assumption_percent: number; alpha_percent: number };
};

export default function PortfolioXRay() {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<PortfolioTxn[]>([]);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [schemeCode, setSchemeCode] = useState(119551);
  const [navResult, setNavResult] = useState<Record<string, unknown> | null>(null);

  const [symbol, setSymbol] = useState("NSE:INFY");
  const [quoteResult, setQuoteResult] = useState<Record<string, unknown> | null>(null);

  const parseAndAnalyze = async () => {
    if (!file) {
      setError("Please choose a CSV statement file first");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const uploadResponse = await uploadPortfolioStatement(file);
      const parsedTxns = (uploadResponse?.transactions || []) as PortfolioTxn[];
      setTransactions(parsedTxns);

      const xray = await financeApi.portfolioXRay<PortfolioResult>({ transactions: parsedTxns });
      setResult(xray);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed portfolio analysis");
    } finally {
      setLoading(false);
    }
  };

  const fetchNav = async () => {
    try {
      const nav = await financeApi.portfolioNav<Record<string, unknown>>(schemeCode);
      setNavResult(nav);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed NAV lookup");
    }
  };

  const fetchQuote = async () => {
    try {
      const quote = await financeApi.marketQuote<Record<string, unknown>>(symbol);
      setQuoteResult(quote);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed market quote lookup");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-5xl font-black text-primary">Mutual Fund Portfolio X-Ray</h1>

      <section className="sketch-card bg-white space-y-4">
        <h2 className="font-headline text-2xl font-bold">Statement Upload & X-Ray</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border-2 border-primary/20 rounded-xl p-3"
        />
        <button className="sketch-button bg-primary text-white" onClick={parseAndAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Upload + Analyze Portfolio"}
        </button>
        {error && <p className="text-red-600 font-headline">{error}</p>}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="sketch-card bg-white space-y-3">
          <h3 className="font-headline text-xl font-bold">NAV Lookup</h3>
          <input
            type="number"
            value={schemeCode}
            onChange={(e) => setSchemeCode(Number(e.target.value))}
            className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
          />
          <button className="sketch-button" onClick={fetchNav}>Fetch Local/Fallback NAV</button>
          {navResult && <pre className="text-xs overflow-auto bg-surface p-3 rounded-xl">{JSON.stringify(navResult, null, 2)}</pre>}
        </div>

        <div className="sketch-card bg-white space-y-3">
          <h3 className="font-headline text-xl font-bold">Market Quote (Alpha Vantage)</h3>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
          />
          <button className="sketch-button" onClick={fetchQuote}>Fetch Quote</button>
          {quoteResult && <pre className="text-xs overflow-auto bg-surface p-3 rounded-xl">{JSON.stringify(quoteResult, null, 2)}</pre>}
        </div>
      </section>

      {transactions.length > 0 && (
        <section className="sketch-card bg-white">
          <h3 className="font-headline text-xl font-bold mb-3">Parsed Transactions ({transactions.length})</h3>
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Scheme</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((txn, i) => (
                  <tr key={`${txn.scheme_code}-${i}`}>
                    <td>{txn.scheme_name}</td>
                    <td>{txn.date}</td>
                    <td>{txn.txn_type}</td>
                    <td>₹{Math.round(txn.amount).toLocaleString()}</td>
                    <td>{txn.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {result && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sketch-card bg-white">
              <p className="text-primary/60">Portfolio Value</p>
              <p className="text-3xl font-black">₹{Math.round(result.portfolio_value).toLocaleString()}</p>
            </div>
            <div className="sketch-card bg-white">
              <p className="text-primary/60">XIRR</p>
              <p className="text-3xl font-black">{result.xirr.toFixed(2)}%</p>
            </div>
            <div className="sketch-card bg-white">
              <p className="text-primary/60">Alpha</p>
              <p className="text-3xl font-black">{result.benchmark_comparison.alpha_percent.toFixed(2)}%</p>
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Holdings</h3>
            <div className="space-y-2">
              {result.holdings.map((h) => (
                <div key={h.scheme_code} className="border-2 border-dashed border-primary/20 rounded-xl p-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <span>{h.scheme_name}</span>
                  <span>Units: {h.units}</span>
                  <span>Value: ₹{Math.round(h.market_value).toLocaleString()}</span>
                  <span>Weight: {h.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="sketch-card bg-white">
              <h3 className="font-headline text-xl font-bold mb-3">Overlap</h3>
              <p>Pairs: {result.overlap_analysis.pair_count}</p>
              <ul className="list-disc pl-5">
                {result.overlap_analysis.high_overlap_pairs.slice(0, 5).map((pair, i) => (
                  <li key={`${pair.fund_a}-${pair.fund_b}-${i}`}>
                    {pair.fund_a} vs {pair.fund_b}: {pair.similarity_score}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sketch-card bg-white">
              <h3 className="font-headline text-xl font-bold mb-3">Expense Drag</h3>
              <p>Weighted ER: {result.expense_ratio_drag.weighted_expense_ratio_percent.toFixed(2)}%</p>
              <p>Annual Drag: ₹{Math.round(result.expense_ratio_drag.annual_drag_rupees).toLocaleString()}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
