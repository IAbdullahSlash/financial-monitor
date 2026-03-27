import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Shield, TrendingUp, Landmark, Brain, ArrowRight, CheckCircle2, AlertCircle, Trophy, Star } from "lucide-react";

const questions = [
  {
    id: "emergency",
    label: "Emergency Preparedness",
    text: "How many months of expenses do you have in liquid cash?",
    options: [
      { label: "0-1 Months", score: 20, color: "#ff7675" },
      { label: "2-3 Months", score: 60, color: "#fdcb6e" },
      { label: "6+ Months", score: 100, color: "#55efc4" },
    ],
    icon: Shield,
  },
  {
    id: "insurance",
    label: "Insurance Coverage",
    text: "Do you have active Health and Term Life insurance?",
    options: [
      { label: "Neither", score: 0, color: "#ff7675" },
      { label: "Only Health", score: 50, color: "#fdcb6e" },
      { label: "Both", score: 100, color: "#55efc4" },
    ],
    icon: Heart,
  },
  {
    id: "diversification",
    label: "Investment Diversification",
    text: "Where is most of your money invested?",
    options: [
      { label: "Savings/FD only", score: 30, color: "#ff7675" },
      { label: "Mostly Real Estate", score: 60, color: "#fdcb6e" },
      { label: "Mix of Stocks/MFs/Gold", score: 100, color: "#55efc4" },
    ],
    icon: TrendingUp,
  },
  {
    id: "debt",
    label: "Debt Health",
    text: "What percentage of your income goes to EMIs?",
    options: [
      { label: "Over 50%", score: 20, color: "#ff7675" },
      { label: "20-40%", score: 70, color: "#fdcb6e" },
      { label: "Under 20%", score: 100, color: "#55efc4" },
    ],
    icon: Landmark,
  },
];

export default function HealthScore() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (score: number) => {
    const newScores = { ...scores, [questions[step].id]: score };
    setScores(newScores);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setIsFinished(true);
    }
  };

  const totalScore = (Object.values(scores) as number[]).reduce((a: number, b: number) => a + b, 0) / questions.length;

  const getVerdict = (score: number) => {
    if (score >= 80) return { label: "Wealth Warrior", color: "secondary", desc: "Your financial health is rock solid! Keep it up." };
    if (score >= 50) return { label: "Budget Builder", color: "tertiary", desc: "You're on the right track, but there's room for growth." };
    return { label: "Money Rookie", color: "accent", desc: "Time to build some safety nets. Let's start with the basics." };
  };

  const verdict = getVerdict(totalScore);

  return (
    <div className="max-w-4xl mx-auto space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">Health Score</span>
        </motion.h1>
        <p className="text-primary/70 text-2xl italic">Evaluate your financial wellness in 5 minutes.</p>
      </header>

      <div className="sketch-card p-12 bg-white min-h-[500px] flex flex-col justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-surface">
                  {(() => {
                    const Icon = questions[step].icon;
                    return <Icon className="w-8 h-8 text-primary" />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-black text-primary/40 uppercase font-headline tracking-widest">Step {step + 1} of {questions.length}</p>
                  <h3 className="font-headline font-bold text-3xl">{questions[step].label}</h3>
                </div>
              </div>

              <h2 className="font-headline font-black text-4xl text-primary leading-tight">{questions[step].text}</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                {questions[step].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option.score)}
                    className="sketch-card p-6 text-xl font-headline font-bold hover:bg-surface transition-all hover:scale-105 active:scale-95 text-center group"
                  >
                    {option.label}
                    <div className="mt-4 h-1 w-0 group-hover:w-full transition-all duration-300" style={{ backgroundColor: option.color }}></div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-full border-8 border-primary flex items-center justify-center bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
                  <span className="text-7xl font-black font-headline text-primary">{Math.round(totalScore)}</span>
                </div>
                <div className="absolute -top-4 -right-4 rotate-12">
                  <Trophy className="w-16 h-16 text-secondary" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className={`font-headline font-black text-5xl text-${verdict.color}`}>{verdict.label}</h2>
                <p className="text-2xl text-primary/70 italic max-w-lg mx-auto">{verdict.desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-8">
                <div className="sketch-card p-6 bg-secondary/10">
                  <h4 className="font-headline font-bold text-2xl mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-secondary" />
                    What's working:
                  </h4>
                  <ul className="space-y-2 font-headline italic text-lg">
                    {Object.entries(scores).filter(([_, s]) => s === 100).map(([id]) => (
                      <li key={id}>• {questions.find(q => q.id === id)?.label} is excellent!</li>
                    ))}
                  </ul>
                </div>
                <div className="sketch-card p-6 bg-accent/10">
                  <h4 className="font-headline font-bold text-2xl mb-4 flex items-center gap-2">
                    <AlertCircle className="text-accent" />
                    Needs attention:
                  </h4>
                  <ul className="space-y-2 font-headline italic text-lg">
                    {Object.entries(scores).filter(([_, s]) => (s as number) < 100).map(([id]) => (
                      <li key={id}>• Improve your {questions.find(q => q.id === id)?.label}.</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => { setStep(0); setIsFinished(false); setScores({}); }}
                className="sketch-button px-12 py-4 text-2xl font-headline font-black bg-primary text-white hover:bg-primary/90"
              >
                Retake Assessment
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 opacity-10">
          <Star className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-10">
          <Brain className="w-12 h-12 text-primary" />
        </div>
      </div>
    </div>
  );
}
