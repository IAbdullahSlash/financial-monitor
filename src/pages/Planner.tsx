import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Wallet, Plus, ArrowRight, TrendingUp, ShieldCheck, Landmark } from "lucide-react";

const budgetData = [
  { name: 'Rent & Bills', value: 35000, color: '#2d3436' },
  { name: 'Food & Groceries', value: 15000, color: '#fdcb6e' },
  { name: 'Entertainment', value: 8000, color: '#fab1a0' },
  { name: 'Savings', value: 25000, color: '#55efc4' },
  { name: 'Others', value: 12000, color: '#81ecec' },
];

export default function Planner() {
  return (
    <div className="space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-4">Wealth Planner</span>
        </motion.h1>
        <p className="text-primary/70 italic text-2xl">Design your future, one rupee at a time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Budget Breakdown */}
        <section className="lg:col-span-7 sketch-card space-y-8 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-3xl">Monthly Budget</h3>
            <button className="sketch-button bg-accent text-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
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
            {[
              { title: 'Emergency Fund', target: '₹2,00,000', current: '₹1,20,000', progress: 60, icon: ShieldCheck, color: 'secondary' },
              { title: 'Dream Vacation', target: '₹1,50,000', current: '₹45,000', progress: 30, icon: Landmark, color: 'accent' },
              { title: 'New Car', target: '₹8,00,000', current: '₹80,000', progress: 10, icon: TrendingUp, color: 'tertiary' },
            ].map((goal, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-white`}>
                      <goal.icon className={`text-primary w-6 h-6`} />
                    </div>
                    <div>
                      <p className="font-bold text-xl font-headline">{goal.title}</p>
                      <p className="text-sm text-primary/60 italic">{goal.current} / {goal.target}</p>
                    </div>
                  </div>
                  <span className={`text-xl font-black font-headline text-primary`}>{goal.progress}%</span>
                </div>
                <div className="h-4 w-full bg-surface border-2 border-primary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={`h-full bg-accent border-r-2 border-primary`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 sketch-button bg-surface text-primary flex items-center justify-center gap-2">
            Create New Goal
            <ArrowRight className="w-5 h-5" />
          </button>
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
                  type="text" 
                  defaultValue="₹1,00,000" 
                  className="bg-transparent border-none p-0 font-black text-3xl focus:ring-0 w-full font-headline"
                />
              </div>
              <div className="flex-1 p-4 border-2 border-dashed border-white/30 rounded-2xl bg-white/5">
                <p className="text-sm font-black uppercase font-headline text-white/60 mb-1">Savings Rate</p>
                <input 
                  type="text" 
                  defaultValue="20%" 
                  className="bg-transparent border-none p-0 font-black text-3xl focus:ring-0 w-full font-headline"
                />
              </div>
            </div>
          </div>
          <div className="sketch-card bg-white p-8 text-primary flex flex-col items-center justify-center text-center gap-4 hover:rotate-1 transition-transform">
            <p className="text-primary/60 font-headline uppercase font-black text-lg">Potential Savings in 5 Years</p>
            <h2 className="text-6xl font-black text-primary tracking-tight font-headline marker-highlight">₹15,45,000*</h2>
            <p className="text-sm text-primary/50 italic font-accent">* Assuming 8% annual return on investments.</p>
            <button className="mt-4 sketch-button bg-accent text-primary text-xl">Start Saving Now</button>
          </div>
        </div>
      </section>
    </div>
  );
}
