import { useState } from 'react';

const AppointmentSystem = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    doctor: '',
    date: '',
    time: '',
    name: '',
    email: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
    { name: 'Dr. Michael Chen', specialty: 'Neurology' },
    { name: 'Dr. Emily White', specialty: 'Pediatrics' },
    { name: 'Dr. Robert Miller', specialty: 'Orthopedics' }
  ];

  const timeSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  return (
    <section className="py-12 bg-[var(--bg-primary)] border-t border-[var(--border-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4 sm:text-3xl md:text-4xl">Book an Appointment</h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Schedule a session with one of our specialized medical professionals in just a few steps.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-[3rem] shadow-2xl overflow-hidden border border-[var(--border-primary)]">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/3 bg-[var(--color-primary)] p-12 text-white dark:text-slate-900 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-8">Book Your Visit</h2>
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`flex items-center gap-4 ${step >= i ? 'opacity-100' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                        step === i 
                          ? 'bg-[var(--bg-secondary)] text-[var(--color-primary)] dark:text-slate-900 border-[var(--bg-secondary)]' 
                          : 'border-white dark:border-slate-900'
                      }`}>
                        {i}
                      </div>
                      <span className="font-bold">
                        {i === 1 ? 'Choose Service' : i === 2 ? 'Select Time' : 'Patient Details'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 text-sm opacity-75 hidden md:block">
                Need urgent help? Call emergency line 24/7.
              </div>
            </div>

            {/* Form Content */}
            <div className="md:w-2/3 p-12 bg-[var(--bg-secondary)]">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Select a Specialty</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {doctors.map(doc => (
                      <button
                        key={doc.name}
                        onClick={() => {
                          setFormData({...formData, doctor: doc.name, service: doc.specialty});
                          nextStep();
                        }}
                        className="flex items-center justify-between p-4 border-2 border-[var(--border-primary)] rounded-2xl hover:border-[var(--color-primary)] hover:bg-[var(--bg-primary)] transition-all text-left group"
                      >
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{doc.specialty}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{doc.name}</p>
                        </div>
                        <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Available Slots</h3>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl mb-6 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => {
                          setFormData({...formData, time});
                          nextStep();
                        }}
                        className="p-3 border-2 border-[var(--border-primary)] rounded-xl hover:border-[var(--color-primary)] hover:text-[var(--text-primary)] text-sm font-bold text-[var(--text-secondary)] transition-all"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  <button onClick={prevStep} className="mt-8 text-[var(--color-primary)] font-bold hover:opacity-85 transition-opacity">Back</button>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Final Confirmation</h3>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <div className="p-6 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] mt-6">
                      <p className="text-sm text-[var(--color-primary)] font-bold uppercase mb-2">Summary</p>
                      <p className="text-[var(--text-primary)] font-bold">{formData.service} with {formData.doctor}</p>
                      <p className="text-[var(--text-secondary)] text-sm">{formData.date} at {formData.time}</p>
                    </div>
                    <button 
                      onClick={() => alert('Appointment Booked! We will contact you soon.')}
                      className="w-full py-4 bg-[var(--color-primary)] text-[var(--bg-secondary)] dark:text-slate-900 rounded-2xl font-bold shadow-xl hover:opacity-90 transform hover:-translate-y-0.5 transition-all"
                    >
                      Confirm Booking
                    </button>
                    <button onClick={prevStep} className="w-full text-center text-[var(--text-secondary)] font-bold mt-4 hover:opacity-80 transition-opacity">Back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSystem;

