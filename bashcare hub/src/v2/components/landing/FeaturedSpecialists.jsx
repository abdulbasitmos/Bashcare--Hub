import React from 'react';

const specialists = [
  { name: 'Dr. Alice', spec: 'Cardiologist' },
  { name: 'Dr. Bob', spec: 'Dermatologist' },
];

const FeaturedSpecialists = () => (
  <div className="max-w-4xl mx-auto py-12">
    <h2 className="text-3xl font-bold mb-8 text-center">Top Specialists</h2>
    <div className="grid md:grid-cols-2 gap-6">
      {specialists.map((s, i) => (
        <div key={i} className="card p-6 text-center">
          <div className="w-20 h-20 bg-[var(--bg-accent)] rounded-full mx-auto mb-4" />
          <h3 className="font-bold">{s.name}</h3>
          <p className="text-sm text-[var(--text-muted)]">{s.spec}</p>
        </div>
      ))}
    </div>
  </div>
);

export default FeaturedSpecialists;
