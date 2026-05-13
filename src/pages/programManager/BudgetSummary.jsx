import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Search } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { PageLoader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import budgetService from '../services/budgetService';
import { formatCurrency, showError } from '../utils/helpers';
import './Pages.css';

export const BudgetSummary = () => {
  const [programId, setProgramId] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!programId.trim()) {
      showError('Please enter a Program ID');
      return;
    }

    setLoading(true);
    try {
      const data = await budgetService.getBudgetSummary(parseInt(programId));
      setSummary(data);
      setSearched(true);
    } catch (error) {
      setSummary(null);
      setSearched(true);
      showError(error.message || 'Failed to fetch budget summary');
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = summary ? [
    {
      label: 'Base Budget',
      value: formatCurrency(summary.baseBudget),
      icon: '💰',
      color: 'primary',
    },
    {
      label: 'Total Allocated',
      value: formatCurrency(summary.totalAllocated),
      icon: '📊',
      color: 'secondary',
    },
    {
      label: 'Remaining Base',
      value: formatCurrency(summary.remainingBase),
      icon: '📈',
      color: 'success',
    },
    {
      label: 'Total Used',
      value: formatCurrency(summary.totalUsed),
      icon: '💸',
      color: 'warning',
    },
    {
      label: 'Remaining Allocated',
      value: formatCurrency(summary.remainingAllocated),
      icon: '✅',
      color: 'info',
    },
  ] : [];

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="header-content">
          <BarChart2 size={32} />
          <div>
            <h2>Budget Summary Of Programs</h2>
            <p className="text-muted">View detailed budget information for your programs</p>
          </div>
        </div>
      </div>

      {/* Search Bar - Single Line */}
      <motion.form
        onSubmit={handleSearch}
        className="search-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input
          type="number"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          placeholder="Enter Program ID"
          min="1"
          disabled={loading}
          className="form-control"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          <Search size={18} />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </motion.form>

      <div className="page-content single-column">

        {/* Summary Results */}
        {loading && <PageLoader fullScreen={false} />}

        {searched && !loading && summary && (
          <motion.div
            className="summary-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="summary-header">
              <h3>Program #{summary.programId} - Budget Summary</h3>
            </div>

            <div className="summary-cards">
              {summaryCards.map((card, index) => (
                <motion.div
                  key={index}
                  className={`summary-card summary-${card.color}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ translateY: -5 }}
                >
                  <div className="card-icon">{card.icon}</div>
                  <div className="card-info">
                    <p className="card-label">{card.label}</p>
                    <h5 className="card-value">{card.value}</h5>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Budget Analysis */}
            <motion.div
              className="card mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-header">
                <h4>Budget Analysis</h4>
              </div>
              <div className="card-body">
                <div className="analysis-container">
                  {/* Left Side - Utilization */}
                  <div className="analysis-left">
                    <div className="analysis-row">
                      <span className="label">Budget Utilization Rate:</span>
                      <span className="value fw-bold">
                        {summary.baseBudget > 0
                          ? `${(
                              ((summary.totalAllocated || 0) /
                                summary.baseBudget) *
                              100
                            ).toFixed(2)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                      <div className="progress" style={{ height: '18px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${
                              summary.baseBudget > 0
                                ? (
                                    ((summary.totalAllocated || 0) /
                                      summary.baseBudget) *
                                    100
                                  ).toFixed(2)
                                : 0
                            }%`,
                            minWidth: '2px',
                          }}
                          aria-valuenow={summary.totalAllocated}
                          aria-valuemin="0"
                          aria-valuemax={summary.baseBudget}
                        >
                          {summary.baseBudget > 0 && ((summary.totalAllocated || 0) / summary.baseBudget) * 100 > 15
                            ? `${(
                                ((summary.totalAllocated || 0) /
                                  summary.baseBudget) *
                                100
                              ).toFixed(2)}%`
                            : ''}
                        </div>
                      </div>
                      {summary.baseBudget > 0 && ((summary.totalAllocated || 0) / summary.baseBudget) * 100 <= 15 && (
                        <div style={{ marginTop: '0.5rem', color: '#1e4d8b', fontWeight: '700' }}>
                          {`${(
                            ((summary.totalAllocated || 0) / summary.baseBudget) * 100
                          ).toFixed(2)}%`}
                        </div>
                      )}
                    </div>

                    <div className="analysis-row mt-3">
                      <span className="label">Status:</span>
                      <span className={`badge badge-${(summary.remainingBase || 0) > 0 ? 'success' : 'danger'}`}>
                        {(summary.remainingBase || 0) > 0 ? '✓ Healthy' : '⚠ Low Balance'}
                      </span>
                    </div>
                  </div>

                  {/* Right Side - Pie Chart */}
                  <div className="analysis-right">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Base Budget',
                              value: summary.baseBudget,
                              fill: '#1e4d8b',
                            },
                            {
                              name: 'Total Allocated',
                              value: summary.totalAllocated || 0,
                              fill: '#f77f00',
                            },
                            {
                              name: 'Remaining Base',
                              value: Math.max(0, summary.remainingBase || 0),
                              fill: '#198754',
                            },
                            {
                              name: 'Total Used',
                              value: summary.totalUsed || 0,
                              fill: '#ffc107',
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#1e4d8b" />
                          <Cell fill="#f77f00" />
                          <Cell fill="#198754" />
                          <Cell fill="#ffc107" />
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #dee2e6',
                            borderRadius: '0.375rem',
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{
                            paddingTop: '1rem',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {searched && !loading && !summary && (
          <EmptyState
            title="Program Not Found"
            message={`No budget summary found for Program ID: ${programId}`}
          />
        )}

        {!searched && (
          <EmptyState
            title="Search for Program Budget"
            message="Enter a Program ID above to view its budget summary and analysis"
          />
        )}
      </div>
    </motion.div>
  );
};

export default BudgetSummary;
