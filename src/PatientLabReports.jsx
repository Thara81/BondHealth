// PatientLabReports.jsx
import React, { useState } from 'react';

const PatientLabReports = () => {
  const [reports] = useState([
    {
      id: 1,
      testName: 'Complete Blood Count',
      date: '2024-01-10',
      status: 'Reviewed',
      lab: 'City Diagnostics',
      isUnread: false,
      fileUrl: '#'
    },
    {
      id: 2,
      testName: 'Lipid Profile',
      date: '2024-01-05',
      status: 'Pending Review',
      lab: 'Metro Labs',
      isUnread: true,
      fileUrl: '#'
    },
    {
      id: 3,
      testName: 'Liver Function Test',
      date: '2023-12-20',
      status: 'Reviewed',
      lab: 'HealthFirst Labs',
      isUnread: false,
      fileUrl: '#'
    },
    {
      id: 4,
      testName: 'Thyroid Panel',
      date: '2023-12-15',
      status: 'Reviewed',
      lab: 'City Diagnostics',
      isUnread: false,
      fileUrl: '#'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredReports = reports.filter(report => {
    if (filter === 'unread') return report.isUnread;
    if (filter === 'recent') {
      const reportDate = new Date(report.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return reportDate > thirtyDaysAgo;
    }
    return true;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Lab Reports</h2>
      
      <div style={styles.reportsHeader}>
        <div style={styles.filterOptions}>
          <button 
            style={{
              ...styles.filterBtn,
              ...(filter === 'all' ? styles.filterBtnActive : {})
            }}
            onClick={() => setFilter('all')}
          >
            All Reports
          </button>
          <button 
            style={{
              ...styles.filterBtn,
              ...(filter === 'recent' ? styles.filterBtnActive : {})
            }}
            onClick={() => setFilter('recent')}
          >
            Recent
          </button>
          <button 
            style={{
              ...styles.filterBtn,
              ...(filter === 'unread' ? styles.filterBtnActive : {})
            }}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
        </div>
        <button style={styles.uploadBtn}>Upload New Report</button>
      </div>

      <div style={styles.reportsList}>
        {filteredReports.map(report => (
          <div 
            key={report.id} 
            style={{
              ...styles.reportItem,
              ...(report.isUnread ? styles.reportItemUnread : {})
            }}
          >
            <div style={styles.reportIcon}>📊</div>
            <div style={styles.reportContent}>
              <div style={styles.reportHeader}>
                <h3 style={styles.testName}>{report.testName}</h3>
                <span style={{
                  ...styles.reportStatus,
                  ...(report.status === 'Reviewed' ? styles.statusReviewed : styles.statusPending)
                }}>
                  {report.status}
                </span>
              </div>
              <div style={styles.reportDetails}>
                <span style={styles.date}>Date: {report.date}</span>
                <span style={styles.lab}>Lab: {report.lab}</span>
              </div>
            </div>
            <div style={styles.reportActions}>
              <button style={styles.viewBtn}>View Report</button>
              <button style={styles.downloadBtn}>Download</button>
              {report.isUnread && (
                <span style={styles.unreadBadge}>NEW</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h3>No reports found</h3>
          <p>You don't have any lab reports matching the selected filter.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
    fontSize: '1.8rem',
  },
  reportsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  filterOptions: {
    display: 'flex',
    gap: '10px',
  },
  filterBtn: {
    padding: '10px 20px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#e0e0e0',
    },
  },
  filterBtnActive: {
    background: '#1976d2',
    color: 'white',
  },
  uploadBtn: {
    padding: '10px 20px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#388e3c',
    },
  },
  reportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  reportItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
    },
  },
  reportItemUnread: {
    background: '#e8f5e9',
    borderLeft: '5px solid #4caf50',
  },
  reportIcon: {
    fontSize: '2rem',
    marginRight: '20px',
  },
  reportContent: {
    flex: 1,
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  testName: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#333',
  },
  reportStatus: {
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
  },
  statusReviewed: {
    background: '#4caf50',
  },
  statusPending: {
    background: '#ff9800',
  },
  reportDetails: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#666',
  },
  date: {
    padding: '3px 10px',
    background: '#f5f5f5',
    borderRadius: '4px',
  },
  lab: {
    padding: '3px 10px',
    background: '#f5f5f5',
    borderRadius: '4px',
  },
  reportActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  viewBtn: {
    padding: '8px 16px',
    background: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  downloadBtn: {
    padding: '8px 16px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  unreadBadge: {
    padding: '3px 10px',
    background: '#ff5722',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '20px',
  },
};

export default PatientLabReports;