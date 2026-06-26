import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { db } from '../../utils/db';
import { useSearch } from '../context/SearchContext';

const Learn = () => {
  const [articles, setArticles] = useState([]);
  const { searchQuery } = useSearch();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await db.getArticles();
        setArticles(data);
      } catch (err) {
        console.error("Error fetching articles:", err);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">Health Educational Hub</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article, i) => (
            <div key={i} className="card p-6">
              <h2 className="text-xl font-bold mb-2">{article.title}</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">{article.excerpt}</p>
              <button className="btn-primary p-2">Read More</button>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Learn;
