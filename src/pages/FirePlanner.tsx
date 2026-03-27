import { useState } from "react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Flame, TrendingUp, Shield, Landmark, ArrowRight, Info } from "lucide-react";

export default function FirePlanner() {
  const [inputs, setInputs] = useState({
    age: 25,
    income: 100000,
    expenses: 40000,
    investments: 500000,
    goalAge: 45,
  });

  // Simple FIRE calculation logic
  const yearsToGoal = inputs.goalAge - inputs.age;
  const monthlySavings = inputs.income - inputs.expenses;
  const annualSavings = monthlySavings * 12;
  
  // Projection data
  const data = Array.from({ length: yearsToGoal + 1 }, (_, i) => {
    const year = inputs.age + i;
    // Simplified 10% annual return
    const corpus = inputs.investments * Math.pow(1.1, i) + annualSavings * ((Math.pow(1.1, i) - 1) / 0.1);
    return {
      year,
      corpus: Math.round(corpus),
      target: inputs.expenses * 12 * 25, // 25x rule
    };
  });

  const finalCorpus = data[data.length - 1].corpus;
  const targetCorpus = inputs.expenses * 12 * 25;
  const isOnTrack = finalCorpus >= targetCorpus;

  return (
    <div className="space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">FIRE Path</span>
        </motion.h1>
        <p className="text-primary/70 text-2xl italic">Your roadmap to freedom from the 9-to-5.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs Section */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sketch-card p-8 bg-white">
            <h3 className="font-headline font-bold text-3xl mb-6 flex items-center gap-2">
              <Flame className="text-accent w-8 h-8" />
              Your Numbers
            </h3>
            <div className="space-y-6">
              {[
                { label: "Current Age", key: "age", min: 18, max: 60 },
                { label: "Monthly Income (₹)", key: "income", min: 10000, max: 1000000, step: 5000 },
                { label: "Monthly Expenses (₹)", key: "expenses", min: 5000, max: 500000, step: 5000 },
                { label: "Existing Investments (₹)", key: "investments", min: 0, max: 10000000, step: 50000 },
                { label: "Target FIRE Age", key: "goalAge", min: 30, max: 70 },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex justify-between font-headline font-bold">
                    <label>{field.label}</label>
                    <span className="text-secondary">{inputs[field.key as keyof typeof inputs].toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min={field.min} 
                    max={field.max} 
                    step={field.step || 1}
                    value={inputs[field.key as keyof typeof inputs]}
                    onChange={(e) => setInputs({ ...inputs, [field.key]: parseInt(e.target.value) })}
                    className="w-full accent-primary h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sketch-card p-6 bg-surface border-dashed">
            <div className="flex gap-3">
              <Info className="text-secondary shrink-0" />
              <p className="text-sm italic text-primary/70">
                We use a standard 10% annual return and the "25x Rule" (Corpus = 25 * Annual Expenses) for these projections.
              </p>
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <article className="lg:col-span-8 space-y-8">
          <div className="sketch-card p-8 bg-white min-h-[500px]">
            <h3 className="font-headline font-bold text-3xl mb-8">Corpus Projection</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d3436" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2d3436" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="year" stroke="#2d3436" fontStyle="italic" />
                  <YAxis 
                    stroke="#2d3436" 
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '2px solid #2d3436', fontFamily: 'Architects Daughter' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Corpus']}
                  />
                  <Area type="monotone" dataKey="corpus" stroke="#2d3436" strokeWidth={3} fillOpacity={1} fill="url(#colorCorpus)" />
                  <Line type="monotone" dataKey="target" stroke="#ff7675" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`sketch-card p-8 ${isOnTrack ? 'bg-secondary/10' : 'bg-accent/10'}`}>
              <h4 className="font-headline font-bold text-2xl mb-4">The Verdict</h4>
              <p className="text-xl font-headline">
                {isOnTrack 
                  ? "You're on fire! Your current plan leads to financial freedom by age " + inputs.goalAge + "."
                  : "Almost there! You might need to increase your monthly SIP by ₹" + Math.round((targetCorpus - finalCorpus) / 240).toLocaleString() + " to hit your goal."}
              </p>
            </div>

            <div className="sketch-card p-8 bg-white">
              <h4 className="font-headline font-bold text-2xl mb-4">Action Plan</h4>
              <ul className="space-y-3 font-headline italic">
                <li className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-secondary" /> Increase SIP by 10% annually</li>
                <li className="flex items-center gap-2"><Shield className="w-5 h-5 text-secondary" /> Maintain ₹{Math.round(inputs.expenses * 6).toLocaleString()} Emergency Fund</li>
                <li className="flex items-center gap-2"><Landmark className="w-5 h-5 text-secondary" /> Maximize 80C & 80D tax benefits</li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
