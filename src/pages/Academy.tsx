import { motion } from "motion/react";
import { Book, Wallet, Rocket, Users, CircleDollarSign, Lightbulb, Trophy, TrendingUp, Shield, Landmark, Brain, ArrowRight, Lock, Star, Cloud, Waves, Anchor, SquarePen } from "lucide-react";

export default function Academy() {
  return (
    <div className="space-y-12 font-body">
      {/* Hero Section */}
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">Win Academy</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-primary/70 text-2xl max-w-2xl mx-auto italic"
        >
          Learn the game of money. Earn badges, conquer levels, and unlock true wealth.
        </motion.p>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Side Column: Leaderboard & Daily Quiz */}
        <aside className="lg:col-span-4 space-y-8 order-2 lg:order-1">
          {/* Quiz of the Day */}
          <section className="sketch-card p-8 bg-white relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="text-tertiary w-8 h-8" />
              <h3 className="font-headline font-bold text-3xl">Quiz of the Day</h3>
            </div>
            <p className="text-primary font-medium text-xl mb-8 font-headline">If you invest ₹10,000 at 8% compounding annually, how much do you have after 1 year?</p>
            <div className="space-y-4">
              {['₹10,800', '₹11,000', '₹10,080'].map((option, idx) => (
                <button key={idx} className="w-full p-4 text-left border-2 border-dashed border-primary/20 rounded-xl hover:border-primary/50 hover:bg-surface transition-all font-headline text-xl flex justify-between items-center group">
                  <span>{option}</span>
                  <SquarePen className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" />
                </button>
              ))}
            </div>
            <div className="mt-6 text-sm text-primary/50 italic font-accent">
              * Hint: Compound interest is your best friend.
            </div>
          </section>

          {/* Leaderboard */}
          <section className="sketch-card p-8 space-y-6 bg-white">
            <h3 className="font-headline font-bold text-3xl flex items-center gap-2">
              <Trophy className="text-secondary w-8 h-8" />
              Wealth Leaders
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Arjun M.', role: 'Wealth Master', xp: '2,450 XP', rank: 1, img: 'https://picsum.photos/seed/arjun/100/100' },
                { name: 'Priya S.', role: 'Budget Pro', xp: '2,120 XP', rank: 2, img: 'https://picsum.photos/seed/priya/100/100' },
                { name: 'Rahul K.', role: 'Stock Explorer', xp: '1,890 XP', rank: 3, img: 'https://picsum.photos/seed/rahul/100/100' },
              ].map((leader, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-2 border-dashed border-primary/10 rounded-2xl hover:bg-surface transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center font-bold font-headline ${leader.rank === 1 ? 'bg-accent text-primary' : 'text-primary/60'}`}>
                      {leader.rank}
                    </div>
                    <img className="w-12 h-12 rounded-full border-2 border-primary" src={leader.img} alt={leader.name} referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-bold text-lg font-headline">{leader.name}</p>
                      <p className="text-xs text-primary/50 font-accent italic">{leader.role}</p>
                    </div>
                  </div>
                  <div className="text-secondary font-black font-headline text-xl">{leader.xp}</div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 text-primary/60 font-headline text-xl hover:underline decoration-wavy">View Full Leaderboard</button>
          </section>
        </aside>

        {/* Center Column: Learning Path Treasure Map */}
        <article className="lg:col-span-8 order-1 lg:order-2">
          <div className="sketch-card min-h-[800px] p-8 md:p-12 relative bg-[#fdfbf7] overflow-hidden">
            {/* Background Map Texture/Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')" }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="font-headline font-black text-4xl text-primary/80 mb-16 underline decoration-wavy decoration-accent underline-offset-8">The Treasure of Wealth</h2>
              
              {/* Path Elements */}
              <div className="w-full relative space-y-32 flex flex-col items-center">
                
                {/* Level 1: Basics */}
                <motion.div whileHover={{ scale: 1.05, rotate: -2 }} className="relative z-20 group">
                  <div className="w-32 h-32 rounded-full border-4 border-primary flex flex-col items-center justify-center gap-1 cursor-pointer bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                    <Book className="w-12 h-12 text-primary" />
                    <span className="text-xs font-black text-primary/60 font-headline uppercase">BASICS</span>
                  </div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary text-white px-4 py-1 rounded-full text-sm font-bold font-headline">Level 1: Unlocked</div>
                  
                  {/* Sketchy Arrow/Connector */}
                  <svg className="absolute -bottom-24 left-1/2 w-12 h-24 overflow-visible pointer-events-none">
                    <path className="sketch-path" d="M5,0 Q15,40 5,80" fill="none" stroke="#2d3436" strokeWidth="3" />
                  </svg>
                </motion.div>

                {/* Level 2: Budgeting */}
                <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className="relative z-20 group translate-x-20">
                  <div className="w-32 h-32 rounded-full border-4 border-primary flex flex-col items-center justify-center gap-1 cursor-pointer bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                    <Wallet className="w-12 h-12 text-secondary" />
                    <span className="text-xs font-black text-primary/60 font-headline uppercase">Budgeting</span>
                  </div>
                  <div className="absolute -top-6 right-0">
                    <Star className="text-accent w-8 h-8 fill-accent" />
                  </div>
                  {/* Sketchy Connector */}
                  <svg className="absolute -bottom-24 left-1/2 w-12 h-24 overflow-visible pointer-events-none -translate-x-full">
                    <path className="sketch-path" d="M10,0 Q-30,40 10,80" fill="none" stroke="#2d3436" strokeWidth="3" />
                  </svg>
                </motion.div>

                {/* Level 3: Stocks */}
                <motion.div whileHover={{ scale: 1.05, rotate: -2 }} className="relative z-20 group -translate-x-24">
                  <div className="w-36 h-36 rounded-full border-4 border-primary flex flex-col items-center justify-center gap-1 cursor-pointer bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                    <Rocket className="w-14 h-14 text-primary" />
                    <span className="text-sm font-black text-primary/60 font-headline uppercase">Stocks</span>
                  </div>
                  <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center">
                    <Lock className="text-primary/40 rotate-12 w-8 h-8" />
                  </div>
                  {/* Sketchy Connector */}
                  <svg className="absolute -bottom-24 left-1/2 w-12 h-24 overflow-visible pointer-events-none translate-x-4">
                    <path className="sketch-path" d="M0,0 Q40,40 0,80" fill="none" stroke="#2d3436" strokeWidth="3" />
                  </svg>
                </motion.div>

                {/* Level 4: Mutual Funds */}
                <div className="relative z-20 group translate-x-12 opacity-40 grayscale">
                  <div className="w-32 h-32 rounded-full border-4 border-primary flex flex-col items-center justify-center gap-1 bg-white cursor-not-allowed">
                    <Users className="w-12 h-12 text-primary" />
                    <span className="text-xs font-black text-primary/60 font-headline uppercase">Funds</span>
                  </div>
                  {/* Sketchy Connector */}
                  <svg className="absolute -bottom-24 left-1/2 w-12 h-24 overflow-visible pointer-events-none -translate-x-6">
                    <path className="sketch-path" d="M5,0 Q-15,40 5,80" fill="none" stroke="#2d3436" strokeWidth="3" />
                  </svg>
                </div>

                {/* Level 5: The Goal */}
                <div className="relative z-20 group">
                  <div className="w-48 h-48 rounded-full border-8 border-dashed border-accent flex flex-col items-center justify-center gap-1 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] opacity-50">
                    <CircleDollarSign className="w-20 h-20 text-accent" />
                    <p className="font-headline font-black text-primary mt-2 text-xl">FINANCIAL FREEDOM</p>
                  </div>
                  <div className="absolute -top-12 -left-12 rotate-[-15deg]">
                    <div className="bg-accent p-4 shadow-xl rounded-lg border-2 border-primary text-sm font-bold text-primary w-32 text-center font-headline">X MARKS THE SPOT!</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Hand-Drawn Elements */}
            <div className="absolute top-20 left-10 opacity-20 select-none">
              <Cloud className="w-20 h-20 text-primary rotate-[-20deg]" />
            </div>
            <div className="absolute bottom-40 right-10 opacity-20 select-none">
              <Waves className="w-32 h-32 text-primary" />
            </div>
            <div className="absolute top-1/2 left-20 opacity-10 select-none">
              <Anchor className="w-12 h-12 text-secondary" />
            </div>
          </div>
        </article>
      </div>

      {/* Featured Lessons Bento */}
      <section className="space-y-8">
        <h3 className="font-headline text-5xl font-black text-primary text-center">Popular Lessons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Compound Magic', desc: 'How 1 Rupee becomes 1 Crore.', time: '10 Mins', icon: TrendingUp, color: 'secondary' },
            { title: 'Safety Nets', desc: 'Insurance basics you actually need.', time: '15 Mins', icon: Shield, color: 'accent' },
            { title: 'The Tax Game', desc: 'Save more without doing more.', time: '8 Mins', icon: Landmark, color: 'tertiary' },
            { title: 'Money Mindset', desc: 'Beat the urge to splurge.', time: '12 Mins', icon: Brain, color: 'secondary' },
          ].map((lesson, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ rotate: 1, y: -5 }}
              className="sketch-card flex flex-col gap-4 group cursor-pointer bg-white"
            >
              <div className={`w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center bg-white`}>
                <lesson.icon className={`text-primary w-8 h-8`} />
              </div>
              <div>
                <h4 className="font-bold text-2xl mb-1 font-headline">{lesson.title}</h4>
                <p className="text-lg text-primary/70 italic">{lesson.desc}</p>
              </div>
              <div className={`mt-auto pt-4 flex items-center justify-between text-sm font-black text-primary/60 uppercase font-headline`}>
                <span>{lesson.time}</span>
                <ArrowRight className="group-hover:translate-x-2 transition-transform w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
