import { useState } from 'react';


const BMICalculator = () => {
  const [activeTab, setActiveTab] = useState('bmi');
  
  // BMI States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiMessage, setBmiMessage] = useState('');

  // Water States
  const [waterWeight, setWaterWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [waterResult, setWaterResult] = useState(null);

  // Calorie States
  const [calWeight, setCalWeight] = useState('');
  const [calHeight, setCalHeight] = useState('');
  const [calAge, setCalAge] = useState('');
  const [calGender, setCalGender] = useState('male');
  const [calActivity, setCalActivity] = useState('1.55'); // Moderate
  const [calResult, setCalResult] = useState(null);

  const calculateBMI = (e) => {
    e.preventDefault();
    if (weight && height) {
      const h = height / 100;
      const bmiValue = (weight / (h * h)).toFixed(1);
      setBmi(bmiValue);
      
      if (bmiValue < 18.5) setBmiMessage('Underweight');
      else if (bmiValue >= 18.5 && bmiValue < 25) setBmiMessage('Normal weight');
      else if (bmiValue >= 25 && bmiValue < 30) setBmiMessage('Overweight');
      else setBmiMessage('Obese');
    }
  };

  const calculateWater = (e) => {
    e.preventDefault();
    if (waterWeight) {
      // Base water intake: weight in kg * 35 ml
      let baseIntake = waterWeight * 35;
      // Add extra water based on activity level
      if (activity === 'active') baseIntake += 500;
      if (activity === 'athletic') baseIntake += 1000;
      
      setWaterResult((baseIntake / 1000).toFixed(2)); // result in liters
    }
  };

  const calculateCalories = (e) => {
    e.preventDefault();
    if (calWeight && calHeight && calAge) {
      // Harris-Benedict Equation
      let bmr;
      if (calGender === 'male') {
        bmr = 88.362 + (13.397 * calWeight) + (4.799 * calHeight) - (5.677 * calAge);
      } else {
        bmr = 447.593 + (9.247 * calWeight) + (3.098 * calHeight) - (4.330 * calAge);
      }
      
      const maintenance = Math.round(bmr * parseFloat(calActivity));
      setCalResult({
        maintenance,
        loss: Math.round(maintenance - 500),
        gain: Math.round(maintenance + 500),
        protein: Math.round((maintenance * 0.3) / 4),
        carbs: Math.round((maintenance * 0.4) / 4),
        fat: Math.round((maintenance * 0.3) / 9),
      });
    }
  };

  return (
    <section className="py-16 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="px-4 py-1.5 bg-blue-50 dark:bg-slate-900/50 text-[var(--color-primary)] text-xs font-bold rounded-full mb-4 inline-block border border-blue-100 dark:border-slate-800">
              Interactive Suite
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-6">
              Free Smart Health Tools
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
              Take charge of your wellness journey. We offer highly interactive, professional calculators to help you monitor your metrics instantly.
            </p>
            
            {/* Tabs Selector */}
            <div className="flex flex-col sm:flex-row gap-2 bg-[var(--bg-primary)] p-2 rounded-2xl border border-[var(--border-primary)] shadow-sm max-w-md mb-8">
              <button
                onClick={() => setActiveTab('bmi')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'bmi'
                    ? 'bg-[var(--color-primary)] text-white dark:text-slate-900 shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                BMI Index
              </button>
              <button
                onClick={() => setActiveTab('water')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'water'
                    ? 'bg-[var(--color-primary)] text-white dark:text-slate-900 shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                Water Tracker
              </button>
              <button
                onClick={() => setActiveTab('calories')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'calories'
                    ? 'bg-[var(--color-primary)] text-white dark:text-slate-900 shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                Macros & Cal
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">Instant Results</h4>
                  <p className="text-[var(--text-secondary)]">Get your health metrics calculated in real time.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">Expert Guidance</h4>
                  <p className="text-[var(--text-secondary)]">Interpret your metrics with science-backed targets.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 bg-[var(--bg-primary)] p-10 rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-cyan-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/10 blur-3xl rounded-full"></div>
            
            {/* BMI Calculator Form */}
            {activeTab === 'bmi' && (
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">BMI Index Calculator</h3>
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
                        required
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
                        required
                      />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-[var(--color-primary)] hover:opacity-90 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg hover-float">
                    Calculate Now
                  </button>
                </form>

                {bmi && (
                  <div className="mt-8 p-6 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[var(--color-primary)] font-bold uppercase tracking-wider">Your BMI</p>
                        <p className="text-3xl font-black text-[var(--text-primary)]">{bmi}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-1">Status</p>
                        <p className={`text-lg font-bold ${bmiMessage === 'Normal weight' ? 'text-green-500' : 'text-amber-500'}`}>
                          {bmiMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Water Tracker Form */}
            {activeTab === 'water' && (
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Daily Water Intake target</h3>
                <form onSubmit={calculateWater} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={waterWeight}
                      onChange={(e) => setWaterWeight(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                      placeholder="e.g. 70"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Activity Level</label>
                    <select
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    >
                      <option value="sedentary">Sedentary (No Exercise)</option>
                      <option value="moderate">Moderate (Workout 2-3x/week)</option>
                      <option value="active">Active (Heavy Workout 5x/week)</option>
                      <option value="athletic">Athletic (Pro Sports / Daily Training)</option>
                    </select>
                  </div>
                  <button className="w-full py-4 bg-[var(--color-primary)] hover:opacity-90 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg hover-float">
                    Calculate Water Goal
                  </button>
                </form>

                {waterResult && (
                  <div className="mt-8 p-6 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[var(--color-primary)] font-bold uppercase tracking-wider">Recommended Daily Target</p>
                        <p className="text-3xl font-black text-[var(--text-primary)]">{waterResult} <span className="text-lg font-medium text-[var(--text-secondary)]">Liters</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-secondary)] font-bold mb-1">Equivalent</p>
                        <p className="text-lg font-bold text-blue-500">
                          ~{Math.round(waterResult * 4)} Glasses (250ml)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calorie Form */}
            {activeTab === 'calories' && (
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Calorie & Macro Estimator</h3>
                <form onSubmit={calculateCalories} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={calWeight}
                        onChange={(e) => setCalWeight(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
                        placeholder="70"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={calHeight}
                        onChange={(e) => setCalHeight(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
                        placeholder="175"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Age (yrs)</label>
                      <input
                        type="number"
                        value={calAge}
                        onChange={(e) => setCalAge(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
                        placeholder="25"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Gender</label>
                      <select
                        value={calGender}
                        onChange={(e) => setCalGender(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg p-2.5 outline-none text-sm"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Activity</label>
                      <select
                        value={calActivity}
                        onChange={(e) => setCalActivity(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg p-2.5 outline-none text-sm"
                      >
                        <option value="1.2">Sedentary</option>
                        <option value="1.375">Light</option>
                        <option value="1.55">Moderate</option>
                        <option value="1.725">Active</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-[var(--color-primary)] hover:opacity-90 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg hover-float text-sm mt-2">
                    Calculate Macros
                  </button>
                </form>

                {calResult && (
                  <div className="mt-4 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl animate-in zoom-in duration-300 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center border-b border-[var(--border-primary)] pb-3">
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold">Maintenance</p>
                        <p className="text-base font-extrabold text-[var(--text-primary)]">{calResult.maintenance} kcal</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-green-500 font-bold">Weight Loss</p>
                        <p className="text-base font-extrabold text-green-500">{calResult.loss} kcal</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-500 font-bold">Weight Gain</p>
                        <p className="text-base font-extrabold text-blue-500">{calResult.gain} kcal</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] font-bold mb-1.5 text-center">Daily Protein, Carb & Fat Targets (30/40/30 split)</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-red-500/10 p-2 rounded-lg text-red-600 dark:text-red-400 font-semibold">
                          Protein: {calResult.protein}g
                        </div>
                        <div className="bg-amber-500/10 p-2 rounded-lg text-amber-600 dark:text-amber-400 font-semibold">
                          Carbs: {calResult.carbs}g
                        </div>
                        <div className="bg-green-500/10 p-2 rounded-lg text-green-600 dark:text-green-400 font-semibold">
                          Fat: {calResult.fat}g
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default BMICalculator;

