import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';
import Card from '../../ui/Card';
import Typography from '../../ui/Typography';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

const AdminVerificationMonitor = () => {
  const [doctors, setDoctors] = useState([]);

  const fetchDoctors = async () => {
    const data = await db.getDoctors();
    setDoctors(data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <Card variant="flat" className="p-6">
      <Typography variant="h2" className="mb-6">Doctor Verification Monitor</Typography>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-4">Doctor</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map(doc => (
            <tr key={doc._id} className="border-t border-[var(--border)]">
              <td className="p-4">{doc.name}</td>
              <td className="p-4">
                <Badge variant={doc.status === 'active' ? 'success' : 'warning'}>
                  {doc.status}
                </Badge>
              </td>
              <td className="p-4">
                <Button variant="ghost" size="sm">Review</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default AdminVerificationMonitor;
