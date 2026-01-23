import React, { useState } from 'react';
import PatientDashboard from './PatientDashboard.jsx';
import PatientProfile from './PatientProfile.jsx';

const Patient = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [patientData, setPatientData] = useState({
    name: "John Doe",
    id: "P123456",
    age: 35,
    profilePhoto: "https://via.placeholder.com/150/667eea/ffffff?text=JD"
  });

  const handleProfileClick = () => {
    setCurrentPage('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const updatePatientData = (updatedData) => {
    setPatientData(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <div style={styles.app}>
      {currentPage === 'dashboard' ? (
        <PatientDashboard 
          patientData={patientData}
          onProfileClick={handleProfileClick}
        />
      ) : (
        <PatientProfile 
          patientData={patientData}
          onBack={handleBackToDashboard}
          onUpdateProfile={updatePatientData}
        />
      )}
    </div>
  );
};

// CORRECTED styles object - make sure it's properly formatted
const styles = {
  app: {
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  }
};

export default Patient;