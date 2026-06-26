import React from 'react';
import { Download } from 'lucide-react';
import { db } from '../../utils/db';

const WellnessReportGenerator = ({ user }) => {
  const handleGenerate = async () => {
    try {
      await db.generateWellnessReport(user.id);
      alert("Wellness report generated successfully!");
    } catch (err) {
      console.error("Error generating report:", err);
    }
  };

  return (
    <button 
      onClick={handleGenerate}
      className="bg-[#2563EB] text-white hover:bg-blue-700 p-4 rounded-2xl flex items-center gap-2 w-full justify-center font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
    >
      <Download size={20} /> Download Wellness Report
    </button>
  );
};

export default WellnessReportGenerator;
