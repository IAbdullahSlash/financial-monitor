import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Landmark, TrendingUp, Shield, Brain, ArrowRight, Info, Lightbulb, CheckCircle2, AlertCircle, Upload, Search, PieChart as PieChartIcon, BarChart as BarChartIcon, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function PortfolioXRay() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const handleUpload = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasData(true);
    }, 2000);
  };

  const allocationData = [
    { name: "Large Cap", value: 45, color: "#2d3436" },
    { name: "Mid Cap", value: 30, color: "#ff7675" },
    { name: "Small Cap", value: 15, color: "#fdcb6e" },
    { name: "Debt/Gold", value: 10, color: "#55efc4" },
  ];

  const performanceData = [
    { month: "Jan", portfolio: 12, benchmark: 10 },
    { month: "Feb", portfolio: 15, benchmark: 11 },
    { month: "Mar", portfolio: 14, benchmark: 12 },
    { month: "Apr", portfolio: 18, benchmark: 14 },
    { month: "May", portfolio: 22, benchmark: 16 },
  ];

  return (
    <div className="space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">Portfolio X-Ray</span>
        </motion.h1>
        <p className="text-primary/70 text-2xl italic">Instant analysis. True XIRR. Actionable insights.</p>
      </header>

      {!hasData ? (
        <div className="sketch-card p-20 bg-white flex flex-col items-center justify-center text-center space-y-12 min-h-[600px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="space-y-8"
              >
                <div className="relative w-32 h-32 mx-auto">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-primary rounded-full"
                  ></motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h2 className="font-headline font-black text-4xl text-primary">Scanning your portfolio...</h2>
                <p className="text-2xl text-primary/60 italic">We're calculating your true XIRR and fund overlap.</p>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto bg-surface">
                  <Upload className="w-16 h-16 text-primary/40" />
                </div>
                <div className="space-y-4">
                  <h2 className="font-headline font-black text-5xl text-primary">Drop your CAS Statement</h2>
                  <p className="text-2xl text-primary/60 italic max-w-lg mx-auto">Upload your CAMS or KFintech PDF. We'll handle the rest.</p>
                </div>
                <button 
                  onClick={handleUpload}
                  className="sketch-button px-16 py-6 text-3xl font-headline font-black bg-primary text-white hover:bg-primary/90"
                >
                  Analyze Now
                </button>
                <p className="text-sm text-primary/40 italic font-accent">Your data is encrypted and never stored.</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 opacity-5">
            <BarChartIcon className="w-32 h-32 text-primary" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-5">
            <PieChartIcon className="w-32 h-32 text-primary" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Stats Summary */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sketch-card p-8 bg-secondary/10 text-center space-y-4">
              <h4 className="font-headline font-bold text-2xl text-secondary/60 italic uppercase tracking-widest">True XIRR</h4>
              <p className="text-7xl font-black font-headline text-secondary">22.4%</p>
              <p className="text-xl text-primary/60 italic">Beat Benchmark by 4.2%</p>
            </div>

            <div className="sketch-card p-8 bg-white space-y-8">
              <h3 className="font-headline font-bold text-3xl mb-8 flex items-center gap-2">
                <AlertCircle className="text-accent w-8 h-8" />
                Critical Alerts
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-accent/5 border-2 border-dashed border-accent/20 rounded-xl">
                  <p className="font-headline font-bold text-lg text-accent">High Overlap (42%)</p>
                  <p className="text-sm italic text-primary/70">Axis Bluechip & HDFC Top 100 share 12 stocks.</p>
                </div>
                <div className="p-4 bg-tertiary/5 border-2 border-dashed border-tertiary/20 rounded-xl">
                  <p className="font-headline font-bold text-lg text-tertiary">Expense Ratio Impact</p>
                  <p className="text-sm italic text-primary/70">You're paying ₹12,400/yr in extra commissions.</p>
                </div>
              </div>
            </div>

            <div className="sketch-card p-6 bg-surface border-dashed">
              <div className="flex gap-3">
                <Info className="text-secondary shrink-0" />
                <p className="text-sm italic text-primary/70">
                  Analysis based on NAV as of yesterday. Benchmark: Nifty 50 TRI.
                </p>
              </div>
            </div>
          </aside>

          {/* Charts Section */}
          <article className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="sketch-card p-8 bg-white min-h-[400px]">
                <h4 className="font-headline font-bold text-2xl mb-8">Asset Allocation</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '2px solid #2d3436', fontFamily: 'Architects Daughter' }}
                        formatter={(value: number) => [`${value}%`, 'Allocation']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm font-headline font-bold">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sketch-card p-8 bg-white min-h-[400px]">
                <h4 className="font-headline font-bold text-2xl mb-8">Vs Benchmark</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="month" stroke="#2d3436" fontStyle="italic" />
                      <YAxis stroke="#2d3436" tickFormatter={(v) => `${v}%`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '2px solid #2d3436', fontFamily: 'Architects Daughter' }}
                      />
                      <Bar dataKey="portfolio" fill="#2d3436" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="benchmark" fill="#ff7675" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-8 font-headline font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Portfolio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span>Benchmark</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sketch-card p-12 bg-white relative overflow-hidden">
              <div className="flex items-center gap-4 mb-12">
                <Sparkles className="text-secondary w-10 h-10" />
                <h3 className="font-headline font-black text-4xl text-primary">AI Rebalancing Plan</h3>
              </div>

              <div className="space-y-12">
                <div className="flex gap-8">
                  <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-surface shrink-0">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-2xl">Switch to Direct Plans</h4>
                    <p className="text-xl text-primary/70 italic leading-relaxed">You're currently in Regular plans. Switching to Direct will save you ₹1.2L over 10 years.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-surface shrink-0">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-2xl">Consolidate Large Caps</h4>
                    <p className="text-xl text-primary/70 italic leading-relaxed">Exit Axis Bluechip and move funds to HDFC Top 100 to reduce overlap and improve alpha.</p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-10 right-10 opacity-5">
                <Brain className="w-32 h-32 text-primary" />
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
