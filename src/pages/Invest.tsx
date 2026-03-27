import { motion } from "motion/react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Rocket, Shield, Landmark, ArrowUpRight, ArrowDownRight, Info, Plus } from "lucide-react";

const portfolioData = [
  { name: 'Stocks', value: 450000, color: '#2d3436' },
  { name: 'Mutual Funds', value: 250000, color: '#fdcb6e' },
  { name: 'Gold', value: 80000, color: '#fab1a0' },
  { name: 'Cash', value: 32000, color: '#55efc4' },
];

const marketData = [
  { name: 'Mon', value: 24500 },
  { name: 'Tue', value: 24650 },
  { name: 'Wed', value: 24400 },
  { name: 'Thu', value: 24800 },
  { name: 'Fri', value: 25100 },
];

export default function Invest() {
  return (
    <div className="space-y-12 font-body">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-headline text-5xl font-black text-primary tracking-tight"
          >
            <span className="marker-highlight px-4">Invest & Grow</span>
          </motion.h1>
          <p className="text-primary/70 italic text-2xl mt-2">Your portfolio is up 12.4% this year. Keep it up!</p>
        </div>
        <div className="flex gap-4">
          <button className="sketch-button bg-accent text-primary flex items-center gap-2">
            <Plus className="w-6 h-6" />
            New Investment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Portfolio Overview */}
        <section className="lg:col-span-8 sketch-card p-8 space-y-8 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-3xl">Portfolio Performance</h3>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '1Y', 'ALL'].map((period) => (
                <button key={period} className={`px-4 py-1 border-2 border-primary font-headline text-lg ${period === '1Y' ? 'bg-accent text-primary' : 'bg-white text-primary hover:bg-surface'}`}>{period}</button>
              ))}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fdcb6e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fdcb6e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#2d3436" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#2d3436', fontSize: 14, fontFamily: 'Kalam'}} />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '0px', border: '2px solid #2d3436', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)', fontFamily: 'Kalam' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2d3436" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Asset Allocation */}
        <section className="lg:col-span-4 sketch-card p-8 space-y-8 bg-white">
          <h3 className="font-headline font-bold text-3xl">Asset Allocation</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#2d3436"
                  strokeWidth={2}
                >
                  {portfolioData.map((entry, index) => (
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
            {portfolioData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-2 border-dashed border-primary/20 rounded-xl hover:bg-surface transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-primary" style={{ backgroundColor: item.color }}></div>
                  <span className="text-lg font-headline">{item.name}</span>
                </div>
                <span className="text-xl font-black font-headline">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Investment Options */}
      <section className="space-y-8">
        <h3 className="font-headline text-5xl font-black text-primary text-center">Where to Invest?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Safe & Steady', desc: 'Fixed Deposits, Bonds, Gold.', risk: 'Low Risk', icon: Shield, color: 'secondary' },
            { title: 'Growth Engine', desc: 'Mutual Funds, Index Funds.', risk: 'Medium Risk', icon: Landmark, color: 'accent' },
            { title: 'Wealth Multiplier', desc: 'Direct Stocks, Crypto.', risk: 'High Risk', icon: Rocket, color: 'tertiary' },
          ].map((option, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ rotate: 1 }}
              className="sketch-card flex flex-col gap-6 group cursor-pointer bg-white"
            >
              <div className={`w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center group-hover:rotate-12 transition-transform bg-white`}>
                <option.icon className={`text-primary w-8 h-8`} />
              </div>
              <div className="space-y-2">
                <span className={`text-sm font-black uppercase font-headline text-primary/60`}>{option.risk}</span>
                <h4 className="font-headline font-bold text-3xl">{option.title}</h4>
                <p className="text-lg text-primary/70 italic">{option.desc}</p>
              </div>
              <button className={`mt-auto sketch-button bg-surface text-primary text-xl flex items-center justify-center gap-2`}>
                Explore Options
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Market Insights */}
      <section className="sketch-card bg-white">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center bg-white">
            <Info className="text-primary w-8 h-8" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-3xl">Market Insights</h3>
            <p className="text-lg text-primary/60 italic">Stay updated with the latest trends.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-between hover:bg-surface transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                <TrendingUp className="text-secondary w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-xl font-headline">Nifty 50</p>
                <p className="text-sm text-primary/50 font-accent">25,100.45</p>
              </div>
            </div>
            <span className="text-secondary font-black font-headline text-2xl">+1.2%</span>
          </div>
          <div className="p-6 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-between hover:bg-surface transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                <TrendingUp className="text-tertiary w-6 h-6 rotate-180" />
              </div>
              <div>
                <p className="font-bold text-xl font-headline">Sensex</p>
                <p className="text-sm text-primary/50 font-accent">82,345.12</p>
              </div>
            </div>
            <span className="text-tertiary font-black font-headline text-2xl">-0.4%</span>
          </div>
        </div>
      </section>
    </div>
  );
}
