import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Users, Wallet, TrendingUp, Shield, Brain, ArrowRight, Info, Lightbulb, CheckCircle2, AlertCircle, Landmark, Star } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function CouplesPlanner() {
  const [partner1, setPartner1] = useState({ name: "Arjun", income: 120000, expenses: 40000 });
  const [partner2, setPartner2] = useState({ name: "Priya", income: 80000, expenses: 30000 });

  const totalIncome = partner1.income + partner2.income;
  const totalExpenses = partner1.expenses + partner2.expenses;
  const totalSavings = totalIncome - totalExpenses;

  const data = [
    { name: partner1.name, value: partner1.income, color: "#2d3436" },
    { name: partner2.name, value: partner2.income, color: "#ff7675" },
  ];

  return (
    <div className="space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">Couples Planner</span>
        </motion.h1>
        <p className="text-primary/70 text-2xl italic">Joint financial intelligence for partners.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Inputs Section */}
        <aside className="lg:col-span-5 space-y-8">
          <div className="sketch-card p-8 bg-white space-y-8">
            <h3 className="font-headline font-bold text-3xl mb-8 flex items-center gap-2">
              <Heart className="text-accent w-8 h-8" />
              Partner Profiles
            </h3>
            
            <div className="space-y-12">
              {/* Partner 1 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-surface font-headline font-black">1</div>
                  <h4 className="font-headline font-bold text-2xl">{partner1.name}</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between font-headline font-bold">
                      <label>Monthly Income (₹)</label>
                      <span className="text-secondary">{partner1.income.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min={10000} 
                      max={500000} 
                      step={5000}
                      value={partner1.income}
                      onChange={(e) => setPartner1({ ...partner1, income: parseInt(e.target.value) })}
                      className="w-full accent-primary h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Partner 2 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-surface font-headline font-black">2</div>
                  <h4 className="font-headline font-bold text-2xl">{partner2.name}</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between font-headline font-bold">
                      <label>Monthly Income (₹)</label>
                      <span className="text-accent">{partner2.income.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min={10000} 
                      max={500000} 
                      step={5000}
                      value={partner2.income}
                      onChange={(e) => setPartner2({ ...partner2, income: parseInt(e.target.value) })}
                      className="w-full accent-accent h-2 bg-accent/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sketch-card p-6 bg-surface border-dashed">
            <div className="flex gap-3">
              <Info className="text-secondary shrink-0" />
              <p className="text-sm italic text-primary/70">
                We analyze your combined income to optimize tax benefits and shared goals.
              </p>
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <article className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="sketch-card p-8 bg-white flex flex-col items-center justify-center text-center">
              <h4 className="font-headline font-bold text-2xl mb-6 text-primary/60 italic uppercase tracking-widest">Combined Income</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '2px solid #2d3436', fontFamily: 'Architects Daughter' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Income']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-4xl font-black font-headline text-primary">₹{totalIncome.toLocaleString()}</p>
            </div>

            <div className="sketch-card p-8 bg-secondary/10 flex flex-col justify-center text-center">
              <h4 className="font-headline font-bold text-2xl mb-6 text-secondary/60 italic uppercase tracking-widest">Shared Savings</h4>
              <div className="space-y-4">
                <p className="text-6xl font-black font-headline text-secondary">₹{totalSavings.toLocaleString()}</p>
                <p className="text-xl text-primary/60 italic">Monthly Potential</p>
              </div>
              <div className="mt-8 pt-8 border-t-2 border-dashed border-primary/10">
                <p className="text-lg font-headline font-bold text-primary">"You can reach your ₹1Cr goal in 12 years together!"</p>
              </div>
            </div>
          </div>

          <div className="sketch-card p-12 bg-white relative overflow-hidden">
            <div className="flex items-center gap-4 mb-12">
              <Star className="text-accent w-10 h-10" />
              <h3 className="font-headline font-black text-4xl text-primary">Joint Strategy</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-surface shrink-0">
                    <Landmark className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-2xl">Tax Optimization</h4>
                    <p className="text-lg text-primary/70 italic">Pay rent to {partner1.name}'s parents to maximize HRA for {partner2.name}.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-surface shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-2xl">Insurance Planning</h4>
                    <p className="text-lg text-primary/70 italic">Get a joint term plan to save 15% on combined premiums.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-surface shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-2xl">Goal Rebalancing</h4>
                    <p className="text-lg text-primary/70 italic">Shift 20% of {partner2.name}'s savings to {partner1.name}'s equity portfolio for better XIRR.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-surface shrink-0">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-2xl">Shared Net Worth</h4>
                    <p className="text-lg text-primary/70 italic">Track your combined growth in real-time with our joint dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 right-10 opacity-5">
              <Users className="w-32 h-32 text-primary" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
