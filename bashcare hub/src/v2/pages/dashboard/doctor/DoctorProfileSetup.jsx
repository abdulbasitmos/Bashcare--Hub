import React, { useState, useEffect } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import Card from '../../components/ui/Card';
import Typography from '../../components/ui/Typography';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { db } from '../../../utils/db';

const DoctorProfileSetup = ({ user }) => {
  const [profile, setProfile] = useState({ bio: '', category: '', availability: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic to update doctor profile
    console.log('Profile updated:', profile);
    setLoading(false);
  };

  return (
    <Card variant="glass" className="p-8 max-w-2xl">
      <Typography variant="h2" className="mb-6">Complete Your Profile</Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Bio" placeholder="Short professional summary..." value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
        <Input label="Category" placeholder="e.g., Cardiology" value={profile.category} onChange={(e) => setProfile({...profile, category: e.target.value})} />
        <Input label="Availability" placeholder="e.g., Mon-Fri, 9am-5pm" value={profile.availability} onChange={(e) => setProfile({...profile, availability: e.target.value})} />
        <Button type="submit" disabled={loading}>Save Profile</Button>
      </form>
    </Card>
  );
};

export default DoctorProfileSetup;
