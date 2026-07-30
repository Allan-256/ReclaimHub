import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#ff6b6b', '#51cf66', '#ffd93d', '#4fc3f7', '#a29bfe', '#fd79a8'];

const Charts = ({ items, isDarkMode }) => {
  const theme = {
    textColor: isDarkMode ? 'white' : '#1a1a2e',
    textSecondary: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    gridColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };

  // Prepare data for status chart
  const statusData = [
    { name: 'Lost', value: items.filter(item => item.status === 'lost').length },
    { name: 'Found', value: items.filter(item => item.status === 'found').length },
    { name: 'Claimed', value: items.filter(item => item.status === 'claimed').length },
  ];

  // Prepare data for category chart
  const categories = ['Electronics', 'Books', 'Clothing', 'Accessories', 'Documents', 'Other'];
  const categoryData = categories.map(cat => ({
    name: cat,
    value: items.filter(item => item.category === cat).length,
  })).filter(d => d.value > 0);

  // Prepare data for monthly trend
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = monthNames.map((month, index) => {
    const monthItems = items.filter(item => {
      const date = new Date(item.createdAt);
      return date.getMonth() === index;
    });
    return {
      name: month,
      lost: monthItems.filter(item => item.status === 'lost').length,
      found: monthItems.filter(item => item.status === 'found').length,
    };
  });

  // If no data, show empty state
  if (items.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        border: '1px solid ' + (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
      }}>
        <p style={{ color: theme.textSecondary, fontSize: '16px' }}>
          No data available to display charts. Start adding items!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '24px',
    }}>
      {/* Status Pie Chart */}
      <div style={{
        padding: '20px',
        background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        border: '1px solid ' + (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
      }}>
        <h3 style={{ color: theme.textColor, margin: '0 0 16px 0', fontSize: '16px' }}>
          Item Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Bar Chart */}
      <div style={{
        padding: '20px',
        background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        border: '1px solid ' + (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
      }}>
        <h3 style={{ color: theme.textColor, margin: '0 0 16px 0', fontSize: '16px' }}>
          Items by Category
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
            <XAxis dataKey="name" tick={{ fill: theme.textSecondary, fontSize: 11 }} />
            <YAxis tick={{ fill: theme.textSecondary, fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#1a237e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trend Line Chart */}
      <div style={{
        padding: '20px',
        background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        border: '1px solid ' + (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
        gridColumn: '1 / -1',
      }}>
        <h3 style={{ color: theme.textColor, margin: '0 0 16px 0', fontSize: '16px' }}>
          Monthly Item Trends
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
            <XAxis dataKey="name" tick={{ fill: theme.textSecondary, fontSize: 11 }} />
            <YAxis tick={{ fill: theme.textSecondary, fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="lost" stroke="#ff6b6b" strokeWidth={2} />
            <Line type="monotone" dataKey="found" stroke="#51cf66" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
