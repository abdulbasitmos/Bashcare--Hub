
const ImageGallery = () => {
  const images = [
    { url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=800", title: "Modern Facilities" },
    { url: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800", title: "Advanced Surgery" },
    { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800", title: "Diagnostic Lab" },
    { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800", title: "Patient Care" },
    { url: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=800", title: "Specialized Equipment" },
    { url: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800", title: "Dental Care" }
  ];

  return (
    <section className="py-12 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4">Inside Bashcare Hub</h2>
          <p className="text-xl text-[var(--text-secondary)]">Take a look at our world-class medical environment.</p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, i) => (
            <div key={i} className="relative group overflow-hidden rounded-[2rem] shadow-xl transform hover:scale-[1.02] transition-all duration-500">
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <h4 className="text-white text-xl font-bold">{img.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageGallery;

