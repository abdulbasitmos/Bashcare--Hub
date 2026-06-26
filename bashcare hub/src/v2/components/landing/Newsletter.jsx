import React from 'react';

const Newsletter = () => (
  <div className="bg-[var(--bg-accent)] py-12 text-center">
    <h2 className="text-2xl font-bold mb-4">Stay Healthy</h2>
    <input type="email" placeholder="Email" className="p-2 border rounded-lg mr-2" />
    <button className="btn-primary p-2 px-6">Subscribe</button>
  </div>
);

export default Newsletter;
