import { loanSchedule, parseDate, type Loan } from "@/lib/loans";

const icsDate = (iso: string) => iso.replaceAll("-", "");
const escape = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

/**
 * An .ics file with one all-day event per remaining EMI (with a reminder the day before).
 * Individual events rather than a monthly rule, so month-end dates (31st → 28th/30th) stay right.
 */
export function emiCalendar(loan: Loan, today = new Date()): string {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const upcoming = loanSchedule(loan).filter((row) => parseDate(row.date) >= t);

  const events = upcoming.map((row) => {
    const next = new Date(parseDate(row.date));
    next.setDate(next.getDate() + 1);
    const end = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, "0")}${String(next.getDate()).padStart(2, "0")}`;
    return [
      "BEGIN:VEVENT",
      `UID:${loan.id}-${row.n}@fintwin`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(row.date)}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escape(`EMI: ${loan.name} — ₹${Math.round(row.emi).toLocaleString("en-IN")}`)}`,
      `DESCRIPTION:${escape(`EMI ${row.n + 1}${loan.lender ? ` · ${loan.lender}` : ""}. Keep the balance ready in your account.`)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:EMI due tomorrow",
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fin Twin//EMI reminders//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
