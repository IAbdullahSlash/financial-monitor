import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Gift, Heart, Baby, Briefcase, Landmark, ArrowRight, Info, Lightbulb, TrendingUp, Shield, Brain } from "lucide-react";

const events = [
  { id: "bonus", label: "Salary Bonus", icon: Gift, color: "secondary", desc: "Got a windfall? Let's make it grow." },
  { id: "marriage", label: "Marriage", icon: Heart, color: "accent", desc: "Two lives, one financial future." },
  { id: "inheritance", label: "Inheritance", icon: Landmark, color: "tertiary", desc: "Preserving and growing a legacy." },
  { id: "childbirth", label: "Childbirth", icon: Baby, color: "secondary", desc: "Planning for the next generation." },
  { id: "jobswitch", label: "Job Switch", icon: Briefcase, color: "primary", desc: "New role, new financial strategy." },
];

const adviceMap: Record<string, any> = {
  bonus: {
    title: "The Bonus Blueprint",
    steps: [
      { icon: Shield, title: "Pay Down Debt", text: "Clear high-interest credit card debt first." },
      { icon: TrendingUp, title: "Invest 70%", text: "Put 70% into a diversified equity mutual fund." },
      { icon: Gift, title: "Treat Yourself", text: "Use 10% for something you've wanted. You earned it!" },
    ],
    taxTip: "Consider an NPS contribution to save an extra ₹50,000 in tax.",
  },
  marriage: {
    title: "The Union Strategy",
    steps: [
      { icon: Brain, title: "Joint Goals", text: "Discuss long-term goals like a home or travel." },
      { icon: Shield, title: "Insurance Review", text: "Add your spouse to your health insurance policy." },
      { icon: Landmark, title: "Combined Budget", text: "Create a shared account for household expenses." },
    ],
    taxTip: "Optimize HRA by paying rent to a parent if living in their house.",
  },
  // Add more as needed...
};

export default function LifeAdvisor() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const advice = selectedEvent ? adviceMap[selectedEvent] || {
    title: "The Custom Plan",
    steps: [
      { icon: Shield, title: "Safety First", text: "Ensure your emergency fund is topped up." },
      { icon: TrendingUp, title: "Rebalance", text: "Check if your asset allocation needs a shift." },
      { icon: Brain, title: "Goal Check", text: "Update your target dates for major goals." },
    ],
    taxTip: "Consult a tax professional for specific implications of this event.",
  } : null;

  return (
    <div className="space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">Life Advisor</span>
        </motion.h1>
        <p className="text-primary/70 text-2xl italic">AI-powered guidance for life's big moments.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Event Selection */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-headline font-bold text-3xl mb-8">What's happening?</h3>
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={`sketch-card p-6 flex items-center gap-6 transition-all hover:scale-105 active:scale-95 text-left group ${
                  selectedEvent === event.id ? 'bg-surface border-primary' : 'bg-white'
                }`}
              >
                <div className={`w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-white group-hover:bg-${event.color}/10`}>
                  <event.icon className={`w-8 h-8 text-primary`} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-2xl">{event.label}</h4>
                  <p className="text-lg text-primary/60 italic">{event.desc}</p>
                </div>
                <ArrowRight className={`ml-auto w-8 h-8 text-primary/20 group-hover:text-primary transition-colors ${selectedEvent === event.id ? 'text-primary' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Advice Output */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {advice ? (
              <motion.div
                key={selectedEvent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="sketch-card p-12 bg-white min-h-[600px] relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-12">
                  <Sparkles className="text-secondary w-10 h-10" />
                  <h2 className="font-headline font-black text-5xl text-primary">{advice.title}</h2>
                </div>

                <div className="space-y-12">
                  {advice.steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-8 relative">
                      {idx < advice.steps.length - 1 && (
                        <div className="absolute left-8 top-16 bottom-0 w-1 border-l-2 border-dashed border-primary/20"></div>
                      )}
                      <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-surface shrink-0 z-10">
                        <step.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-2xl">{step.title}</h4>
                        <p className="text-xl text-primary/70 italic leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 sketch-card p-8 bg-secondary/10 border-dashed relative">
                  <div className="flex gap-4">
                    <Lightbulb className="text-secondary w-10 h-10 shrink-0" />
                    <div>
                      <p className="font-headline font-bold text-2xl mb-2">Pro Tax Tip:</p>
                      <p className="text-xl italic text-primary/80">{advice.taxTip}</p>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 right-10 opacity-5">
                  <Brain className="w-32 h-32 text-primary" />
                </div>
              </motion.div>
            ) : (
              <div className="sketch-card p-12 bg-surface border-dashed min-h-[600px] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <Info className="w-12 h-12 text-primary/20" />
                </div>
                <p className="text-2xl font-headline font-bold text-primary/40 italic">Select a life event to see your personalized financial blueprint.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
