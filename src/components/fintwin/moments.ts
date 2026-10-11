import { inr, inrFull, monthYear } from "@/lib/format";
import { CUSHION_TARGET, monthIndex, type Projection } from "@/lib/twin";

export type Moment = { date: string; tone: "good" | "warn" | "risk"; text: string };

/** The handful of future events worth telling someone about, in date order. */
export function moments(p: Projection): Moment[] {
  const out: Moment[] = [];

  if (p.runsOutFrom) {
    out.push({
      date: p.runsOutFrom,
      tone: "risk",
      text: "Your savings and investments run out. Spending is more than you bring in.",
    });
  } else if (p.lowCushionFrom) {
    const already = monthIndex(p.start, p.lowCushionFrom) === 0;
    out.push({
      date: p.lowCushionFrom,
      tone: "warn",
      text: already
        ? `Your cash covers less than ${CUSHION_TARGET} months of spending and EMIs. Build that cushion first.`
        : `Your cash cushion drops below ${CUSHION_TARGET} months of spending and EMIs.`,
    });
  }

  for (const end of p.loanEnds) {
    out.push({
      date: end.date,
      tone: "good",
      text: `${end.name} is fully repaid — ${inrFull(end.emi)} a month freed up.`,
    });
  }
  if (p.hasDebt && p.debtFreeDate && p.loanEnds.length > 1) {
    out.push({ date: p.debtFreeDate, tone: "good", text: "You're completely debt-free." });
  }

  for (const g of p.goals) {
    if (!g.reached) {
      out.push({
        date: g.goal.date,
        tone: "risk",
        text: `${g.goal.name} (${inr(g.goal.target)}) isn't affordable within the next 30 years at this pace.`,
      });
    } else if (g.monthsLate) {
      out.push({
        date: g.reached,
        tone: "warn",
        text: `${g.goal.name} (${inr(g.goal.target)}) is reached ${g.monthsLate} month${g.monthsLate === 1 ? "" : "s"} later than you wanted (${monthYear(g.goal.date)}).`,
      });
    } else {
      out.push({
        date: g.reached,
        tone: "good",
        text: `${g.goal.name} (${inr(g.goal.target)}) — on time.`,
      });
    }
  }

  // A milestone people relate to: the first crore.
  const crore = p.points.find((pt) => pt.netWorth >= 10_000_000);
  if (crore && p.points[0].netWorth < 10_000_000) {
    out.push({ date: crore.date, tone: "good", text: "Your net worth crosses ₹1 crore." });
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}
