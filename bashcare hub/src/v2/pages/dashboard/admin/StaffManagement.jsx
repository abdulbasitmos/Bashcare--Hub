import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';
import Card from '../../ui/Card';
import Typography from '../../ui/Typography';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { User, Trash2, Edit } from 'lucide-react';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await db.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h2">Staff & Doctor Management</Typography>
      
      <Card variant="flat" className="overflow-hidden">
        {loading ? (
          <Typography>Loading staff data...</Typography>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-[var(--border)] hover:bg-[var(--bg-accent)]">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'primary' : 'outline'}>{user.role}</Badge>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button variant="ghost" className="p-2"><Edit size={16}/></Button>
                    <Button variant="ghost" className="p-2 text-red-500"><Trash2 size={16}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default StaffManagement;
