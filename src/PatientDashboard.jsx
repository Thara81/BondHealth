import React, { useState } from 'react';
import PatientCurrentAppointments from './PatientCurrentAppointments.jsx';
import PatientBookAppointment from './PatientBookAppointments.jsx';
import PatientLabReports from './PatientLabReports.jsx';
import PatientPrescriptions from './PatientPrescriptions.jsx';

const PatientDashboard = ({ patientData, onProfileClick }) => {
  const [activeTab, setActiveTab] = useState('current');

  const renderContent = () => {
    switch (activeTab) {
      case 'current':
        return <PatientCurrentAppointments />;
      case 'book':
        return <PatientBookAppointment />;
      case 'lab':
        return <PatientLabReports />;
      case 'prescriptions':
        return <PatientPrescriptions />;
      default:
        return <PatientCurrentAppointments />;
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.profileSection}>
          <div 
            style={styles.profilePhotoContainer}
            onClick={onProfileClick}
          >
            <img 
              src={patientData.profilePhoto} 
              alt="Profile" 
              style={styles.profilePhoto}
            />
            <div style={styles.photoOverlay}>View Profile</div>
          </div>
        </div>
        
        <div style={styles.patientInfo}>
          <h1 style={styles.patientName}>{patientData.name}</h1>
          <div style={styles.patientDetails}>
            <span style={styles.patientId}>ID: {patientData.id}</span>
            <span style={styles.patientAge}>Age: {patientData.age}</span>
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div style={styles.separator}></div>

      {/* Main Content Area */}
      <div style={styles.content}>
        {/* Left Sidebar - Navigation Buttons */}
        <div style={styles.sidebar}>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'current' ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveTab('current')}
          >
            📅 Current Appointment
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'book' ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveTab('book')}
          >
            🩺 Book Appointment
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'lab' ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveTab('lab')}
          >
            📊 Lab Reports
          </button>
          <button 
            style={{
              ...styles.navButton,
              ...(activeTab === 'prescriptions' ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveTab('prescriptions')}
          >
            💊 Prescriptions
          </button>
        </div>

        {/* Right Content Area */}
        <div style={styles.contentArea}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// FIXED: Removed duplicate profilePhotoContainer
const styles = {
  dashboard: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  profileSection: {
    position: 'relative',
  },
  // SINGLE profilePhotoContainer definition:
  profilePhotoContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '4px solid white',
    position: 'relative',
    '&:hover $profilePhoto': {
      transform: 'scale(1.1)',
    },
    '&:hover $photoOverlay': {
      opacity: 1,
    },
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '5px',
    textAlign: 'center',
    fontSize: '12px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  patientInfo: {
    flex: 1,
    marginLeft: '30px',
  },
  patientName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  patientDetails: {
    display: 'flex',
    gap: '20px',
    fontSize: '1.2rem',
    opacity: 0.9,
  },
  patientId: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '5px 15px',
    borderRadius: '20px',
  },
  patientAge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '5px 15px',
    borderRadius: '20px',
  },
  separator: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #ddd, transparent)',
    margin: '0 30px',
  },
  content: {
    display: 'flex',
    minHeight: '600px',
  },
  sidebar: {
    width: '250px',
    background: '#f8f9fa',
    padding: '20px',
    borderRight: '1px solid #e0e0e0',
  },
  navButton: {
    width: '100%',
    padding: '15px',
    marginBottom: '10px',
    border: 'none',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid transparent',
    '&:hover': {
      background: '#e3f2fd',
      transform: 'translateX(5px)',
    },
  },
  navButtonActive: {
    background: '#1976d2',
    color: 'white',
    borderLeft: '4px solid #0d47a1',
  },
  contentArea: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
  },
};

export default PatientDashboard;