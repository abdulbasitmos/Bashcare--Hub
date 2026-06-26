import React, { useState } from 'react';

const FAQ = () => {
  const [open, setOpen] = useState(null);
  const items = [
    { q: "Is my data secure?", a: "Yes, we are HIPAA compliant." },
    { q: "How do I book?", a: "Register, find a doctor, and click book." },
  ];
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">FAQ</h2>
      {items.map((item, i) => (
        <div key={i} className="card p-4 mb-4">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left font-bold">{item.q}</button>
          {open === i && <p className="mt-2 text-sm">{item.a}</p>}
        </div>
      ))}
    </div>
  );
};

export default FAQ;
