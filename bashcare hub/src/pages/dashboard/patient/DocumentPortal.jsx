import React, { useState, useEffect } from 'react';
import { FileUp, FileText } from 'lucide-react';
import { db } from '../../../utils/db';

const DocumentPortal = ({ user }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await db.getDocuments(user.id);
        setDocuments(docs);
      } catch (err) {
        console.error("Error fetching docs:", err);
      }
    };
    fetchDocs();
  }, [user.id]);

  const handleUpload = async (e) => {
    // Mock upload
    const newDoc = { name: e.target.files[0].name, date: new Date().toISOString() };
    await db.uploadDocument({ ...newDoc, patientId: user.id });
    setDocuments([...documents, newDoc]);
  };

  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold mb-6">Document Portal</h2>
      <div className="mb-6">
        <label className="btn-primary p-3 rounded-lg flex items-center gap-2 cursor-pointer w-fit">
          <FileUp size={20} /> Upload Document
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      <div className="space-y-4">
        {documents.map((doc, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <FileText className="text-[var(--primary)]" />
            <div>
              <p className="font-semibold">{doc.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{new Date(doc.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentPortal;
