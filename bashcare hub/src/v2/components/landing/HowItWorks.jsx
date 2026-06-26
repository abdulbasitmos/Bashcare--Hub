import React from 'react';

const HowItWorks = () => (
  <div className="max-w-4xl mx-auto py-12">
    <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
    <div className="flex gap-4">
      {['Register', 'Book', 'Consult'].map((step, i) => (
        <div key={i} className="flex-1 card p-6 text-center">
          <div className="w-10 h-10 bg-[var(--primary)] mx-auto rounded-full mb-4 flex items-center justify-center font-bold">{i + 1}</div>
          <h3 className="font-bold">{step}</h3>
        </div>
      ))}
    </div>
  </div>
);

export default HowItWorks;
