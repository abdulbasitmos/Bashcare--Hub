import { useState } from 'react';

const BMICalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [message, setMessage] = useState('');

  const calculateBMI = (e) => {
    e.preventDefault();
    if (weight && height) {
      const h = height / 100;
      const bmiValue = (weight / (h * h)).toFixed(1);
      setBmi(bmiValue);
      
      if (bmiValue < 18.5) setMessage('Underweight');
      else if (bmiValue >= 18.5 && bmiValue < 25) setMessage('Normal weight');
      else if (bmiValue >= 25 && bmiValue < 30) setMessage('Overweight');
      else setMessage('Obese');
    }
  };

  return (
    <section className="py-12 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-6 sm:text-3xl md:text-4xl">Free Health Tools</h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              We believe in proactive health management. Use our professional tools to keep track of your vital statistics.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">Instant Results</h4>
                  <p className="text-[var(--text-secondary)]">Get your health metrics calculated in seconds.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">Expert Advice</h4>
                  <p className="text-[var(--text-secondary)]">Interpret your results with our integrated guides.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 bg-[var(--bg-primary)] p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/10 blur-3xl rounded-full"></div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-8">BMI Calculator</h3>
            <form onSubmit={calculateBMI} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    placeholder="e.g. 70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    placeholder="e.g. 175"
                  />
                </div>
              </div>
              <button className="w-full py-4 bg-[var(--color-primary)] hover:opacity-90 text-[var(--bg-secondary)] font-bold rounded-xl transition-all shadow-lg">
                Calculate Now
              </button>
            </form>

            {bmi && (
              <div className="mt-8 p-6 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[var(--color-primary)] font-bold uppercase tracking-wider">Your BMI</p>
                    <p className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">{bmi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--text-secondary)] font-bold mb-1">Status</p>
                    <p className={`text-lg font-bold ${message === 'Normal weight' ? 'text-green-500' : 'text-amber-500'}`}>
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BMICalculator;

