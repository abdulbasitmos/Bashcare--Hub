import React from 'react';

const testimonials = [
  { name: 'Sarah J.', text: 'Bashcare made managing my appointments so easy!' },
  { name: 'Dr. Smith', text: 'An incredibly efficient platform for practice management.' },
];

const Testimonials = () => (
  <div className="max-w-4xl mx-auto py-12">
    <h2 className="text-3xl font-bold mb-8 text-center">What People Say</h2>
    <div className="grid md:grid-cols-2 gap-6">
      {testimonials.map((t, i) => (
        <div key={i} className="card p-6">
          <p className="italic mb-4">"{t.text}"</p>
          <p className="font-bold">- {t.name}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Testimonials;
