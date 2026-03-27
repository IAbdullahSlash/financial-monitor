import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Landmark, FileText, Calculator, TrendingUp, Shield, Brain, ArrowRight, Info, Lightbulb, CheckCircle2, AlertCircle, Upload } from "lucide-react";

export default function TaxWizard() {
  const [salary, setSalary] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);
  const [isComparing, setIsComparing] = useState(false);

  // Simplified tax calculation logic
  const calculateTax = (income: number, ded: number, regime: 'old' | 'new') => {
    if (regime === 'old') {
      const taxable = Math.max(0, income - ded - 50000); // Standard deduction
      if (taxable <= 250000) return 0;
      if (taxable <= 500000) return (taxable - 250000) * 0.05;
      if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.2;
      return 112500 + (taxable - 1000000) * 0.3;
    } else {
      const taxable = Math.max(0, income - 50000); // Standard deduction
      if (taxable <= 300000) return 0;
      if (taxable <= 600000) return (taxable - 300000) * 0.05;
      if (taxable <= 900000) return 15000 + (taxable - 600000) * 0.1;
      if (taxable <= 1200000) return 45000 + (taxable - 900000) * 0.15;
      if (taxable <= 1500000) return 90000 + (taxable - 1200000) * 0.2;
      return 150000 + (taxable - 1500000) * 0.3;
    }
  };

  const oldTax = calculateTax(salary, deductions, 'old');
  const newTax = calculateTax(salary, deductions, 'new');
  const savings = Math.abs(oldTax - newTax);
  const betterRegime = oldTax < newTax ? 'Old Regime' : 'New Regime';

  return (
    <div className="space-y-12 font-body">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
        >
          <span className="marker-highlight px-6">Tax Wizard</span>
        </motion.h1>
        <p className="text-primary/70 text-2xl italic">Smart tax optimization. Maximize your savings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Input Section */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sketch-card p-8 bg-white space-y-8">
            <h3 className="font-headline font-bold text-3xl mb-8 flex items-center gap-2">
              <Calculator className="text-secondary w-8 h-8" />
              Your Income
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between font-headline font-bold">
                  <label>Annual Salary (₹)</label>
                  <span className="text-secondary">{salary.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min={300000} 
                  max={5000000} 
                  step={50000}
                  value={salary}
                  onChange={(e) => setSalary(parseInt(e.target.value))}
                  className="w-full accent-primary h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-headline font-bold">
                  <label>80C Deductions (₹)</label>
                  <span className="text-secondary">{deductions.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={150000} 
                  step={5000}
                  value={deductions}
                  onChange={(e) => setDeductions(parseInt(e.target.value))}
                  className="w-full accent-primary h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-8 border-t-2 border-dashed border-primary/10">
              <button className="w-full sketch-button py-4 text-2xl font-headline font-black bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-3">
                <Upload className="w-6 h-6" />
                Upload Form 16
              </button>
              <p className="text-sm text-center mt-4 text-primary/40 italic font-accent">AI will automatically extract your data.</p>
            </div>
          </div>

          <div className="sketch-card p-6 bg-surface border-dashed">
            <div className="flex gap-3">
              <Info className="text-secondary shrink-0" />
              <p className="text-sm italic text-primary/70">
                We compare Old vs New regimes based on the latest 2024-25 budget rules.
              </p>
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <article className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="sketch-card p-8 bg-white border-primary">
              <h4 className="font-headline font-bold text-2xl mb-6 text-primary/60 italic uppercase tracking-widest">Old Regime</h4>
              <div className="space-y-4">
                <p className="text-5xl font-black font-headline text-primary">₹{Math.round(oldTax).toLocaleString()}</p>
                <p className="text-lg text-primary/60 italic">Estimated Annual Tax</p>
              </div>
            </div>
            <div className="sketch-card p-8 bg-white border-secondary">
              <h4 className="font-headline font-bold text-2xl mb-6 text-secondary/60 italic uppercase tracking-widest">New Regime</h4>
              <div className="space-y-4">
                <p className="text-5xl font-black font-headline text-secondary">₹{Math.round(newTax).toLocaleString()}</p>
                <p className="text-lg text-primary/60 italic">Estimated Annual Tax</p>
              </div>
            </div>
          </div>

          <div className="sketch-card p-12 bg-secondary/10 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-headline font-black text-4xl text-primary">Save ₹{savings.toLocaleString()}!</h3>
                <p className="text-2xl text-primary/70 italic">Switch to the {betterRegime} to maximize your savings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
              <div className="space-y-6">
                <h4 className="font-headline font-bold text-2xl flex items-center gap-2">
                  <CheckCircle2 className="text-secondary" />
                  Missed Deductions:
                </h4>
                <ul className="space-y-4 font-headline italic text-xl">
                  <li className="flex items-center gap-2">Section 80D (Health Ins): ₹25,000</li>
                  <li className="flex items-center gap-2">Section 80CCD(1B) (NPS): ₹50,000</li>
                  <li className="flex items-center gap-2">Section 24 (Home Loan): ₹2,00,000</li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-headline font-bold text-2xl flex items-center gap-2">
                  <Lightbulb className="text-secondary" />
                  Wizard's Advice:
                </h4>
                <div className="sketch-card p-6 bg-white border-dashed">
                  <p className="text-lg italic text-primary/80">
                    "Since your salary is over ₹12L, the New Regime is generally better unless you have home loan interest over ₹2L."
                  </p>
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
    </div>
  );
}
