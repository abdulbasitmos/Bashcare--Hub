import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Pill,
  Clock,
  Activity,
  BarChart3,
  Calendar,
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { db } from '../../../utils/db';

const CHART_COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  cyan: '#06b6d4'
};

const STATUS_COLORS = {
  pending: CHART_COLORS.amber,
  confirmed: CHART_COLORS.blue,
  completed: CHART_COLORS.green,
  rejected: CHART_COLORS.red,
  cancelled: CHART_COLORS.purple
};

const DoctorAnalytics = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'all'

  const fetchData = useCallback(async () => {
    try {
      const [appts, prescs, recs] = await Promise.all([
        db.getDoctorAppointments(user.id),
        db.getDoctorPrescriptions(user.id),
        db.getDoctorRecords(user.id)
      ]);
      setAppointments(Array.isArray(appts) ? appts : []);
      setPrescriptions(Array.isArray(prescs) ? prescs : []);
      setRecords(Array.isArray(recs) ? recs : []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAppointments([]);
      setPrescriptions([]);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date filtering
  const filterByDate = useCallback((items) => {
    if (dateRange === 'all') return items;
    const now = new Date();
    let startDate;
    if (dateRange === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return items.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return !isNaN(itemDate.getTime()) && itemDate >= startDate;
    });
  }, [dateRange]);

  const filteredAppointments = useMemo(() => filterByDate(appointments), [appointments, filterByDate]);
  const filteredPrescriptions = useMemo(() => filterByDate(prescriptions), [prescriptions, filterByDate]);
  const filteredRecords = useMemo(() => filterByDate(records), [records, filterByDate]);

  // Performance Stats
  const stats = useMemo(() => {
    const totalAppts = filteredAppointments.length;
    const completedAppts = filteredAppointments.filter(a => a.status === 'completed').length;
    const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;
    const uniquePatients = [...new Set(filteredAppointments.map(a => a.patientId))].length;

    return [
      {
        label: 'Unique Patients',
        value: uniquePatients.toString(),
        icon: <Users size={22} />,
        bg: 'bg-blue-50/50 ',
        iconColor: 'text-[#2563EB] ',
        trend: totalAppts > 0 ? '+' + uniquePatients : '0',
        trendUp: true
      },
      {
        label: 'Completion Rate',
        value: completionRate + '%',
        icon: <CheckCircle2 size={22} />,
        bg: 'bg-green-50 ',
        iconColor: 'text-green-600 ',
        trend: completedAppts + ' completed',
        trendUp: completionRate >= 70
      },
      {
        label: 'Total Appointments',
        value: totalAppts.toString(),
        icon: <Calendar size={22} />,
        bg: 'bg-purple-50 ',
        iconColor: 'text-purple-600 ',
        trend: filteredAppointments.filter(a => a.status === 'pending').length + ' pending',
        trendUp: null
      },
      {
        label: 'Prescriptions',
        value: filteredPrescriptions.length.toString(),
        icon: <Pill size={22} />,
        bg: 'bg-amber-50 ',
        iconColor: 'text-amber-600 ',
        trend: filteredRecords.length + ' records',
        trendUp: true
      }
    ];
  }, [filteredAppointments, filteredPrescriptions, filteredRecords]);

  // Weekly appointments bar chart data
  const weeklyChartData = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayCounts = dayNames.map(() => ({ confirmed: 0, completed: 0, pending: 0, rejected: 0 }));

    filteredAppointments.forEach(appt => {
      const date = new Date(appt.date);
      if (isNaN(date.getTime())) return;
      let dayIndex = date.getDay() - 1;
      if (dayIndex < 0) dayIndex = 6; // Sunday
      const status = appt.status || 'pending';
      if (dayCounts[dayIndex][status] !== undefined) {
        dayCounts[dayIndex][status]++;
      }
    });

    return dayNames.map((name, i) => ({
      name,
      Confirmed: dayCounts[i].confirmed,
      Completed: dayCounts[i].completed,
      Pending: dayCounts[i].pending,
      Rejected: dayCounts[i].rejected
    }));
  }, [filteredAppointments]);

  // Appointment status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const statusCounts = {};
    filteredAppointments.forEach(appt => {
      const status = appt.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name] || CHART_COLORS.cyan
    }));
  }, [filteredAppointments]);

  // Monthly trend data (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en', { month: 'short' });
      const monthAppts = appointments.filter(a => {
        const aDate = new Date(a.date);
        return aDate.getMonth() === date.getMonth() && aDate.getFullYear() === date.getFullYear();
      });
      months.push({
        name: monthName,
        Appointments: monthAppts.length,
        Completed: monthAppts.filter(a => a.status === 'completed').length
      });
    }
    return months;
  }, [appointments]);

  // Recent activity feed
  const recentActivity = useMemo(() => {
    const activities = [];

    filteredAppointments.slice(0, 8).forEach(appt => {
      activities.push({
        id: appt._id || appt.id,
        type: 'appointment',
        icon: <Calendar size={16} />,
        text: `${appt.status === 'completed' ? 'Completed' : appt.status === 'confirmed' ? 'Accepted' : 'Received'} appointment with ${appt.patientName || 'Patient'}`,
        status: appt.status,
        date: appt.date || appt.createdAt,
        color: STATUS_COLORS[appt.status] || CHART_COLORS.blue
      });
    });

    filteredPrescriptions.slice(0, 5).forEach(presc => {
      activities.push({
        id: presc._id || presc.id,
        type: 'prescription',
        icon: <Pill size={16} />,
        text: `Issued ${presc.medication || 'prescription'} to ${presc.patientName || 'Patient'}`,
        status: 'active',
        date: presc.date || presc.createdAt,
        color: CHART_COLORS.amber
      });
    });

    filteredRecords.slice(0, 5).forEach(rec => {
      activities.push({
        id: rec._id || rec.id,
        type: 'record',
        icon: <FileText size={16} />,
        text: `Created record "${rec.diagnosis || 'Medical Record'}" for ${rec.patientName || 'Patient'}`,
        status: rec.category,
        date: rec.date || rec.createdAt,
        color: CHART_COLORS.purple
      });
    });

    // Sort by date descending
    activities.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    return activities.slice(0, 12);
  }, [filteredAppointments, filteredPrescriptions, filteredRecords]);



  if (loading) {
    return (
      <div className="p-8 text-center font-bold text-slate-500">
        <Activity size={32} className="mx-auto mb-4 animate-pulse text-[var(--color-primary)]" />
        Generating analytics report...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/5   p-8 rounded-[24px] border border-blue-50/50 ">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
            <Sparkles size={14} /> Analytics & Performance
          </div>
          <h1 className="text-3xl font-black text-slate-900 ">Clinical Insights</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            Track your clinical performance, appointment trends, and practice metrics.
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex bg-white  p-1.5 rounded-2xl self-start lg:self-center border border-slate-200/50 ">
          {[
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' }
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === range.id
                  ? 'bg-white  text-[var(--color-primary)] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
                  : 'text-slate-500 hover:text-slate-900 dark:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-secondary)]  p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]  flex items-center gap-4 group hover:shadow-md transition-all"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} transition-all group-hover:scale-105`}>
              <span className={stat.iconColor}>{stat.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-slate-900 ">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-center gap-1 mt-1">
                {stat.trendUp !== null && (
                  stat.trendUp
                    ? <ArrowUpRight size={12} className="text-[#22C55E]" />
                    : <ArrowDownRight size={12} className="text-[#EF4444]" />
                )}
                <span className="text-[10px] font-bold text-slate-500">{stat.trend}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Appointments Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[var(--bg-secondary)]  p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] "
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900  flex items-center gap-2">
                <BarChart3 size={20} className="text-[var(--color-primary)]" />
                Appointment Distribution
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Appointments by day of the week</p>
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Confirmed" fill={CHART_COLORS.blue} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Completed" fill={CHART_COLORS.green} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pending" fill={CHART_COLORS.amber} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Rejected" fill={CHART_COLORS.red} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-center">
              <div>
                <BarChart3 size={48} className="mx-auto text-gray-200  mb-4" />
                <p className="text-slate-500 font-medium text-sm">No appointment data for the selected period.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-secondary)]  p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] "
        >
          <h2 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
            <Activity size={20} className="text-[var(--color-primary)]" />
            Status Breakdown
          </h2>

          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontWeight: 700 }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-center">
              <div>
                <Activity size={40} className="mx-auto text-gray-200  mb-3" />
                <p className="text-slate-500 font-medium text-sm">No data available.</p>
              </div>
            </div>
          )}

          {/* Legend Details */}
          <div className="mt-4 space-y-2">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-3 py-2 bg-[#f8fafc]  rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-xs font-bold text-slate-900 ">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-500">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[var(--bg-secondary)]  p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] "
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900  flex items-center gap-2">
                <TrendingUp size={20} className="text-[var(--color-primary)]" />
                6-Month Trend
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Appointments and completions over time</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Appointments"
                stroke={CHART_COLORS.blue}
                strokeWidth={2.5}
                fill="url(#colorAppointments)"
              />
              <Area
                type="monotone"
                dataKey="Completed"
                stroke={CHART_COLORS.green}
                strokeWidth={2.5}
                fill="url(#colorCompleted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--bg-secondary)]  p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] "
        >
          <h2 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
            <Clock size={20} className="text-[var(--color-primary)]" />
            Recent Activity
          </h2>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <motion.div
                key={activity.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-3 p-3.5 bg-[#f8fafc]  rounded-2xl border border-[var(--border-primary)]  hover:shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 transition-all"
              >
                <div
                  className="p-2 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: activity.color + '15', color: activity.color }}
                >
                  {activity.icon}
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-semibold text-slate-900  leading-relaxed line-clamp-2">
                    {activity.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest"
                      style={{ backgroundColor: activity.color + '15', color: activity.color }}
                    >
                      {activity.status}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">
                      {activity.date ? new Date(activity.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <Clock size={32} className="mx-auto text-gray-200  mb-3" />
                <p className="text-xs font-bold text-slate-500">No recent activity found.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 p-8 rounded-[24px] text-white shadow-xl shadow-blue-600/20"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Performance Summary</h3>
            <p className="text-blue-100 text-sm font-medium">
              {dateRange === 'week' ? 'This week' : dateRange === 'month' ? 'This month' : 'All time'} you've handled{' '}
              <span className="font-black text-white">{filteredAppointments.length} appointments</span>,
              issued <span className="font-black text-white">{filteredPrescriptions.length} prescriptions</span>,
              and created <span className="font-black text-white">{filteredRecords.length} medical records</span>.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black">
                {filteredAppointments.length > 0
                  ? Math.round((filteredAppointments.filter(a => a.status === 'completed').length / filteredAppointments.length) * 100)
                  : 0}%
              </p>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">Success Rate</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <p className="text-3xl font-black">{[...new Set(filteredAppointments.map(a => a.patientId))].length}</p>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">Patients Served</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[var(--bg-secondary)]  p-4 rounded-2xl shadow-xl border border-[var(--border-primary)] ">
      <p className="text-xs font-black text-slate-900  mb-2 uppercase tracking-wider">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
          {entry.name}: <span className="font-bold text-slate-900 ">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default DoctorAnalytics;
