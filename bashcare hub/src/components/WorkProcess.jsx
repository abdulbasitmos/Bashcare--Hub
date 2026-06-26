
const WorkProcess = () => {
  const steps = [
    {
      number: '01',
      title: 'Online Consultation',
      description: 'Book a virtual appointment with our specialists from the comfort of your home.',
      color: 'bg-[var(--color-primary)]'
    },
    {
      number: '02',
      title: 'Professional Diagnosis',
      description: 'Visit our modern clinic for a comprehensive physical examination and tests.',
      color: 'bg-indigo-600'
    },
    {
      number: '03',
      title: 'Personalized Treatment',
      description: 'Receive a custom healthcare plan tailored specifically to your medical needs.',
      color: 'bg-[var(--bg-primary)]0'
    },
    {
      number: '04',
      title: 'Ongoing Care',
      description: 'Access 24/7 support and follow-up sessions to ensure your full recovery.',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <section className="py-12 bg-[var(--bg-secondary)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4">How We Care For You</h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Our streamlined process ensures you receive the best medical attention at every step of your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-[var(--bg-primary)] group-hover:bg-blue-200 transition-colors -z-10"></div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-3xl ${step.color} text-white flex items-center justify-center text-3xl font-black mb-8 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-300`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{step.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-[var(--bg-primary)] rounded-[3rem] p-12 lg:flex items-center justify-between border border-blue-100">
          <div className="lg:max-w-xl">
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Ready to start your health journey?</h3>
            <p className="text-lg text-gray-600 mb-8 lg:mb-0">
              Join over 15,000 satisfied patients who have found their way to better health through Bashcare Hub's expert services.
            </p>
          </div>
          <button className="px-10 py-5 bg-[var(--color-primary)] text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transform hover:-translate-y-1 transition-all">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;

