import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { allSearchableItems } = useSearch();
  
  const query = searchParams.get('q') || '';
  
  const filteredResults = query.trim() 
    ? allSearchableItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Navbar />
      <PageHeader 
        title={`Search Results${query ? ` for "${query}"` : ''}`}
        subtitle={`Found ${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''}`}
        breadcrumb="Search"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">No results found</h2>
            <p className="text-gray-600 mb-8">
              {query ? `We couldn't find anything matching "${query}". Try searching for something else.` : 'Enter a search term to find what you\'re looking for.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center">
                  {category}
                  <span className="ml-3 text-lg font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {items.length}
                  </span>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(item.link)}
                      className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">{item.title}</h3>
                        <span className="text-xs font-semibold text-[var(--color-primary)] bg-blue-50 px-2 py-1 rounded">
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
