import { useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Plus, ArrowRight, TrendingUp, ShieldCheck, Landmark } from "lucide-react";

type BudgetItem = {
  name: string;
  value: number;
  color: string;
};

type GoalItem = {
  title: string;
  target: number;
  current: number;
  iconType: "shield" | "landmark" | "trending" | "target";
};

const initialBudgetData: BudgetItem[] = [
  { name: 'Rent & Bills', value: 35000, color: '#2d3436' },
  { name: 'Food & Groceries', value: 15000, color: '#fdcb6e' },
  { name: 'Entertainment', value: 8000, color: '#fab1a0' },
  { name: 'Savings', value: 25000, color: '#55efc4' },
  { name: 'Others', value: 12000, color: '#81ecec' },
];

const initialGoals: GoalItem[] = [
  { title: 'Emergency Fund', target: 200000, current: 120000, iconType: "shield" },
  { title: 'Dream Vacation', target: 150000, current: 45000, iconType: "landmark" },
  { title: 'New Car', target: 800000, current: 80000, iconType: "trending" },
];

const budgetColorPalette = ['#2d3436', '#fdcb6e', '#fab1a0', '#55efc4', '#81ecec', '#74b9ff', '#a29bfe'];

function calculateSavingsProjection(monthlyIncome: number, savingsRate: number): number {
  const sanitizedIncome = Number.isFinite(monthlyIncome) ? Math.max(monthlyIncome, 0) : 0;
  const sanitizedRate = Number.isFinite(savingsRate) ? Math.min(Math.max(savingsRate, 0), 100) : 0;
  const monthlyContribution = sanitizedIncome * (sanitizedRate / 100);
  const monthlyReturn = 0.08 / 12;
  const months = 5 * 12;

  if (monthlyReturn === 0) return monthlyContribution * months;
  return monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
}

function getGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

const goalIconMap = {
  shield: ShieldCheck,
  landmark: Landmark,
  trending: TrendingUp,
  target: Target,
};

export default function Planner() {
  const [budgetData, setBudgetData] = useState<BudgetItem[]>(initialBudgetData);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseError, setExpenseError] = useState("");

  const [goals, setGoals] = useState<GoalItem[]>(initialGoals);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState<number>(100000);
  const [goalCurrent, setGoalCurrent] = useState<number>(0);
  const [goalError, setGoalError] = useState("");

  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [savingsRate, setSavingsRate] = useState<number>(20);
  const [planStarted, setPlanStarted] = useState(false);

  const projectedSavings = useMemo(() => calculateSavingsProjection(monthlyIncome, savingsRate), [monthlyIncome, savingsRate]);
  const monthlyContribution = useMemo(() => Math.max(0, monthlyIncome) * (Math.min(Math.max(savingsRate, 0), 100) / 100), [monthlyIncome, savingsRate]);

  const addExpense = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = expenseName.trim();
    if (!trimmedName) {
      setExpenseError("Please enter an expense name.");
      return;
    }
    if (expenseAmount <= 0) {
      setExpenseError("Expense amount must be greater than 0.");
      return;
    }

    const nextColor = budgetColorPalette[budgetData.length % budgetColorPalette.length];
    setBudgetData((prev) => [...prev, { name: trimmedName, value: Math.round(expenseAmount), color: nextColor }]);
    setExpenseName("");
    setExpenseAmount(0);
    setExpenseError("");
  };

  const addGoal = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = goalTitle.trim();
    if (!trimmedTitle) {
      setGoalError("Please enter a goal title.");
      return;
    }
    if (goalTarget <= 0) {
      setGoalError("Goal target must be greater than 0.");
      return;
    }
    if (goalCurrent < 0) {
      setGoalError("Current amount cannot be negative.");
      return;
    }

    setGoals((prev) => [...prev, { title: trimmedTitle, target: Math.round(goalTarget), current: Math.round(goalCurrent), iconType: "target" }]);
    setGoalTitle("");
    setGoalTarget(100000);
    setGoalCurrent(0);
    setGoalError("");
  };

  const startSaving = () => {
    setPlanStarted(true);
  };

  return (
    <div className="space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">Wealth Planner</span>
        </motion.h1>
        <p className="text-primary/70 italic text-2xl">Design your future, one rupee at a time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Budget Breakdown */}
        <section className="lg:col-span-7 sketch-card space-y-8 bg-white">
          <div className="space-y-3">
            <h3 className="font-headline font-bold text-3xl">Monthly Budget</h3>
            <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3">
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Expense name (e.g., Internet Bill)"
                className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
              />
              <input
                type="number"
                min={1}
                value={expenseAmount || ""}
                onChange={(e) => setExpenseAmount(Number(e.target.value) || 0)}
                placeholder="Amount"
                className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
              />
              <button type="submit" className="sketch-button bg-accent text-primary flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Expense
              </button>
            </form>
            {expenseError && <p className="text-sm text-tertiary font-headline">{expenseError}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#2d3436"
                    strokeWidth={2}
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '0px', border: '2px solid #2d3436', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)', fontFamily: 'Kalam' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {budgetData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-2 border-dashed border-primary/20 rounded-xl hover:bg-surface transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-primary" style={{ backgroundColor: item.color }}></div>
                    <span className="text-lg font-headline">{item.name}</span>
                  </div>
                  <span className="text-xl font-black font-headline">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Goals Tracker */}
        <section className="lg:col-span-5 sketch-card space-y-8 bg-white">
          <h3 className="font-headline font-bold text-3xl">Active Goals</h3>
          <div className="space-y-8">
            {goals.map((goal, idx) => {
              const GoalIcon = goalIconMap[goal.iconType];
              const progress = getGoalProgress(goal.current, goal.target);
              return (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-white`}>
                      <GoalIcon className={`text-primary w-6 h-6`} />
                    </div>
                    <div>
                      <p className="font-bold text-xl font-headline">{goal.title}</p>
                      <p className="text-sm text-primary/60 italic">₹{goal.current.toLocaleString('en-IN')} / ₹{goal.target.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className={`text-xl font-black font-headline text-primary`}>{progress}%</span>
                </div>
                <div className="h-4 w-full bg-surface border-2 border-primary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={`h-full bg-accent border-r-2 border-primary`}
                  ></motion.div>
                </div>
              </div>
            );
          })}
          </div>

          <form onSubmit={addGoal} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="Goal title"
                className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  min={1}
                  value={goalTarget || ""}
                  onChange={(e) => setGoalTarget(Number(e.target.value) || 0)}
                  placeholder="Target amount"
                  className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
                />
                <input
                  type="number"
                  min={0}
                  value={goalCurrent || ""}
                  onChange={(e) => setGoalCurrent(Number(e.target.value) || 0)}
                  placeholder="Current amount"
                  className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 sketch-button bg-surface text-primary flex items-center justify-center gap-2">
              Create New Goal
              <ArrowRight className="w-5 h-5" />
            </button>
            {goalError && <p className="text-sm text-tertiary font-headline">{goalError}</p>}
          </form>
        </section>
      </div>

      {/* Savings Calculator Widget */}
      <section className="sketch-card p-12 bg-secondary text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="font-headline font-black text-5xl">The Power of 50-30-20</h3>
            <p className="text-white/80 text-2xl italic">The golden rule of budgeting: 50% Needs, 30% Wants, 20% Savings. Let's see how much you could save in 5 years.</p>
            <div className="flex gap-4">
              <div className="flex-1 p-4 border-2 border-dashed border-white/30 rounded-2xl bg-white/5">
                <p className="text-sm font-black uppercase font-headline text-white/60 mb-1">Monthly Income</p>
                <input 
                  type="number"
                  min={0}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 font-black text-3xl focus:ring-0 w-full font-headline"
                />
              </div>
              <div className="flex-1 p-4 border-2 border-dashed border-white/30 rounded-2xl bg-white/5">
                <p className="text-sm font-black uppercase font-headline text-white/60 mb-1">Savings Rate</p>
                <input 
                  type="number"
                  min={0}
                  max={100}
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(Number(e.target.value) || 0)}
                  className="bg-transparent border-none p-0 font-black text-3xl focus:ring-0 w-full font-headline"
                />
              </div>
            </div>
          </div>
          <div className="sketch-card bg-white p-8 text-primary flex flex-col items-center justify-center text-center gap-4 hover:rotate-1 transition-transform">
            <p className="text-primary/60 font-headline uppercase font-black text-lg">Potential Savings in 5 Years</p>
            <h2 className="text-6xl font-black text-primary tracking-tight font-headline marker-highlight">₹{Math.round(projectedSavings).toLocaleString('en-IN')}*</h2>
            <p className="text-sm text-primary/50 italic font-accent">* Assuming 8% annual return compounded monthly.</p>
            <p className="text-sm text-primary/70">Monthly contribution: ₹{Math.round(monthlyContribution).toLocaleString('en-IN')}</p>
            <button className="mt-4 sketch-button bg-accent text-primary text-xl" onClick={startSaving}>Start Saving Now</button>
            {planStarted && (
              <p className="text-sm text-secondary font-headline">Plan started with ₹{Math.round(monthlyContribution).toLocaleString('en-IN')} monthly saving.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
