import { motion } from "motion/react";
import { TrendingUp, Wallet, Trophy, Target, ArrowUpRight, ArrowDownRight, Calendar, Bell } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
];

export default function Dashboard() {
  return (
    <div className="space-y-12 font-body">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-headline text-5xl font-black text-primary tracking-tight"
          >
            <span className="marker-highlight">Namaste, Arjun!</span>
          </motion.h1>
          <p className="text-primary/70 italic text-xl mt-2">Your wealth journey is 45% complete. Keep winning!</p>
        </div>
        <div className="flex gap-4">
          <button className="sketch-button bg-white">
            <Bell className="w-6 h-6" />
          </button>
          <button className="sketch-button bg-accent text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Plan Today
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Net Worth', value: '₹12,45,000', change: '+12%', icon: Wallet, color: 'secondary' },
          { label: 'Monthly Savings', value: '₹45,000', change: '+5%', icon: Target, color: 'accent' },
          { label: 'Academy XP', value: '2,450', change: '+150', icon: Trophy, color: 'tertiary' },
          { label: 'Investments', value: '₹8,12,000', change: '+8%', icon: TrendingUp, color: 'secondary' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="sketch-card space-y-4 hover:rotate-1 transition-transform"
          >
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center bg-white`}>
                <stat.icon className={`text-primary w-6 h-6`} />
              </div>
              <span className={`font-headline text-lg px-3 py-1 border-2 border-primary rounded-full bg-white`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-lg text-primary/60 font-headline uppercase">{stat.label}</p>
              <h3 className="text-3xl font-black text-primary font-headline">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Growth Chart */}
        <section className="lg:col-span-8 sketch-card bg-white overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-bold text-3xl">Wealth Growth</h3>
            <select className="sketch-border-sm bg-surface px-4 py-2 text-lg font-headline focus:ring-0 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fdcb6e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fdcb6e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#2d3436" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#2d3436', fontSize: 14, fontFamily: 'Kalam'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '0px', border: '2px solid #2d3436', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)', fontFamily: 'Kalam' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2d3436" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-4 sketch-card space-y-6">
          <h3 className="font-headline font-bold text-3xl">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { title: 'Investment Added', desc: '₹5,000 to Nifty 50 ETF', time: '2h ago', icon: ArrowUpRight, color: 'text-secondary' },
              { title: 'Lesson Completed', desc: 'Compound Magic (Level 1)', time: '5h ago', icon: Trophy, color: 'text-accent' },
              { title: 'Bill Paid', desc: 'Electricity - ₹2,450', time: 'Yesterday', icon: ArrowDownRight, color: 'text-tertiary' },
              { title: 'New Goal Set', desc: 'Emergency Fund (₹2L)', time: '2 days ago', icon: Target, color: 'text-secondary' },
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform bg-white">
                  <activity.icon className={`w-6 h-6 ${activity.color}`} />
                </div>
                <div className="flex-1 border-b-2 border-dashed border-primary/10 pb-4">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-lg">{activity.title}</p>
                    <span className="text-sm text-primary/50 font-accent uppercase">{activity.time}</span>
                  </div>
                  <p className="text-sm text-primary/70 italic">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 text-secondary font-headline text-xl hover:underline decoration-wavy">View All Activity</button>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="sketch-card bg-secondary text-white flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform group">
          <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center group-hover:rotate-12 transition-transform bg-white/10">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-headline text-2xl font-bold">Add Transaction</h4>
            <p className="text-sm text-white/80 font-accent italic">Track your daily spending</p>
          </div>
        </div>
        <div className="sketch-card bg-accent text-primary flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform group">
          <div className="w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center group-hover:rotate-12 transition-transform bg-white/20">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-headline text-2xl font-bold">Set New Goal</h4>
            <p className="text-sm text-primary/80 font-accent italic">Plan for your future dreams</p>
          </div>
        </div>
        <div className="sketch-card bg-tertiary text-white flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform group">
          <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center group-hover:rotate-12 transition-transform bg-white/10">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-headline text-2xl font-bold">Continue Learning</h4>
            <p className="text-sm text-white/80 font-accent italic">Level up your wealth game</p>
          </div>
        </div>
      </section>
    </div>
  );
}
