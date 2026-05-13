import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Zap, AlertCircle } from 'lucide-react';
import { PageLoader, SkeletonLoader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import budgetService from '../services/budgetService';
import resourceService from '../services/resourceService';
import programService from '../services/programService';
import { formatCurrency, formatDate, handleApiError } from '../utils/helpers';
import './Dashboard.css';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState([]);
  const [resources, setResources] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState({
    totalAllocated: 0,
    totalResources: 0,
    activePrograms: 0,
    totalPrograms: 0,
    inactivePrograms: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allocData, resourceData, programData] = await Promise.all([
        budgetService.getAllAllocations(),
        resourceService.getAllAllocatedResources(),
        programService.getAllPrograms(),
      ]);

      setAllocations(allocData || []);
      setResources(resourceData || []);
      setPrograms(programData || []);

      // Calculate stats
      const totalAllocated = allocData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const uniquePrograms = new Set(allocData?.map(a => a.programId) || []).size;
      
      // Count program statuses
      const totalPrograms = programData?.length || 0;
      const activePrograms = programData?.filter(p => p.status === 'ACTIVE').length || 0;
      const inactivePrograms = totalPrograms - activePrograms;

      setStats({
        totalAllocated,
        totalResources: resourceData?.length || 0,
        activePrograms: uniquePrograms,
        totalPrograms,
        inactivePrograms,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader fullScreen={false} />;
  }

  const statCards = [
    {
      title: 'Total Budget Allocated',
      value: formatCurrency(stats.totalAllocated),
      icon: DollarSign,
      color: 'primary',
      trend: 'Completed',
    },
    {
      title: 'Resources Allocated',
      value: stats.totalResources,
      icon: Zap,
      color: 'secondary',
      trend: 'programs',
    },
    {
      title: 'Budget Allocated Programs',
      value: stats.activePrograms,
      icon: TrendingUp,
      color: 'info',
      trend: 'ongoing',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="dashboard-header" variants={itemVariants}>
        <h2>Dashboard</h2>
        <p className="text-muted">Welcome back, Program Manager</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="stats-grid" variants={containerVariants}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              className={`stat-card stat-${card.color}`}
              variants={itemVariants}
              whileHover={{ translateY: -5, boxShadow: '0 10px 25px rgba(30, 77, 139, 0.2)' }}
            >
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{card.title}</p>
                <h3>{card.value}</h3>
                <span className="stat-trend">{card.trend}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Program Status Summary */}
      <motion.div className="program-status-summary" variants={itemVariants}>
        <div className="status-item">
          <div className="status-label">Total</div>
          <div className="status-value">{stats.totalPrograms}</div>
        </div>
        <div className="status-divider"></div>
        <div className="status-item">
          <div className="status-label">Active</div>
          <div className="status-value" style={{ color: '#198754' }}>{stats.totalPrograms - stats.inactivePrograms}</div>
        </div>
        <div className="status-divider"></div>
        <div className="status-item">
          <div className="status-label">Inactive</div>
          <div className="status-value status-inactive">{stats.inactivePrograms}</div>
        </div>
      </motion.div>

      {/* Recent Programs Section */}
      <motion.div className="dashboard-section" variants={itemVariants}>
        <div className="section-header">
          <h3>Recent Programs</h3>
          <Link to="/create-programs" className="link-primary">
            View All →
          </Link>
        </div>

        {programs && programs.length > 0 ? (
          <motion.div
            className="programs-grid"
            variants={containerVariants}
          >
            {programs.slice().reverse().slice(0, 3).map((program, index) => (
              <motion.div
                key={program.programId}
                className="program-card"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="program-header">
                  <h5>{program.title}</h5>
                  <span className={`badge badge-${program.status === 'ACTIVE' ? 'success' : program.status === 'CLOSED' ? 'danger' : 'warning'}`}>
                    {program.status}
                  </span>
                </div>
                <p className="program-description">{program.description?.substring(0, 100)}...</p>
                <div className="program-footer">
                  <span className="program-budget">{formatCurrency(program.budget)}</span>
                  <span className="program-id">#{program.programId}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title="No Programs Yet"
            message="Create your first financial program to get started"
          />
        )}
      </motion.div>

      {/* Allocations Section */}
      <motion.div className="dashboard-section" variants={itemVariants}>
        <div className="section-header">
          <h3>Recent Budget Allocations</h3>
          <Link to="/create-budget" state={{ viewMode: 'list' }} className="link-primary">
            View All →
          </Link>
        </div>

        {allocations && allocations.length > 0 ? (
          <motion.div
            className="allocations-grid"
            variants={containerVariants}
          >
            {allocations.slice().reverse().slice(0, 3).map((alloc, index) => (
              <motion.div
                key={alloc.allocationId}
                className="allocation-card"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="allocation-header">
                  <h5>Program #{alloc.programId}</h5>
                  <span className={`badge badge-${alloc.status === 'ALLOCATED' ? 'success' : 'danger'}`}>
                    {alloc.status}
                  </span>
                </div>
                <p className="allocation-date">
                  {new Date(alloc.date).toLocaleDateString('en-IN')}
                </p>
                <div className="allocation-footer">
                  <span className="allocation-amount">{formatCurrency(alloc.amount)}</span>
                  <span className="allocation-id">ID: {alloc.allocationId}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title="No Allocations Yet"
            message="Start by creating your first budget allocation"
          />
        )}
      </motion.div>

      {/* Resources Section */}
      <motion.div className="dashboard-section" variants={itemVariants}>
        <div className="section-header">
          <h3>Allocated Resources</h3>
          <Link to="/allocate-resources" state={{ viewMode: 'list' }} className="link-primary">
            View All →
          </Link>
        </div>

        {resources && resources.length > 0 ? (
          <motion.div
            className="resources-grid"
            variants={containerVariants}
          >
            {resources.slice().reverse().slice(0, 6).map((resource, index) => (
              <motion.div
                key={resource.resourceId}
                className="resource-card"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="resource-type">{resource.type}</div>
                <h5>Program #{resource.programId}</h5>
                <p className="resource-quantity">
                  Quantity: <strong>{resource.quantity}</strong>
                </p>
                <span className={`badge badge-${resource.status === 'AVAILABLE' ? 'info' : 'warning'}`}>
                  {resource.status}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title="No Resources Allocated"
            message="Allocate resources to your programs to get started"
          />
        )}
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        className="quick-tips"
        variants={itemVariants}
      >
        <div className="tips-header">
          <AlertCircle size={20} />
          <h4>Quick Tips</h4>
        </div>
        <ul className="tips-list">
          <li>Monitor your budget allocations regularly</li>
          <li>Ensure all resources are properly tracked</li>
          <li>Use the budget summary for detailed analysis</li>
          <li>Maintain accurate program IDs for consistency</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
