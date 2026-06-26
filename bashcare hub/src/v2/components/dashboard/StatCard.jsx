import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Typography from '../../components/ui/Typography';

const StatCard = ({ title, value, icon: Icon, change }) => {
  return (
    <Card variant="flat" className="flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <Typography variant="label">{title}</Typography>
        <div className="p-2 rounded-lg bg-[var(--bg-accent)] text-[var(--primary)]">
          <Icon size={18} />
        </div>
      </div>
      <Typography variant="h2" className="text-2xl font-bold">
        {value}
      </Typography>
      {change && (
        <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {change} from last month
        </span>
      )}
    </Card>
  );
};

export default StatCard;
