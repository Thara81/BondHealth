// PatientPrescriptions.jsx
import React, { useState } from 'react';

const PatientPrescriptions = () => {
  const [prescriptions] = useState([
    {
      id: 1,
      doctor: 'Dr. Sarah Smith',
      date: '2024-01-10',
      medications: [
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' }
      ],
      instructions: 'Take with food. Avoid alcohol.'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Brown',
      date: '2023-12-15',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '90 days' }
      ],
      instructions: 'Take in the morning. Monitor blood pressure regularly.'
    }
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Prescriptions</h2>
      
      <div style={styles.prescriptionList}>
        {prescriptions.map(prescription => (
          <div key={prescription.id} style={styles.prescriptionCard}>
            <div style={styles.prescriptionHeader}>
              <h3 style={styles.prescriptionTitle}>
                Prescribed by {prescription.doctor}
              </h3>
              <span style={styles.prescriptionDate}>{prescription.date}</span>
            </div>
            
            <div style={styles.medicationsList}>
              <h4 style={styles.medicationsTitle}>Medications:</h4>
              {prescription.medications.map((med, index) => (
                <div key={index} style={styles.medicationItem}>
                  <div style={styles.medName}>{med.name}</div>
                  <div style={styles.medDetails}>
                    <span style={styles.medDetail}>Dosage: {med.dosage}</span>
                    <span style={styles.medDetail}>Frequency: {med.frequency}</span>
                    <span style={styles.medDetail}>Duration: {med.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={styles.instructions}>
              <strong>Instructions:</strong> {prescription.instructions}
            </div>
            
            <div style={styles.prescriptionActions}>
              <button style={{...styles.actionBtn, ...styles.refillBtn}}>Request Refill</button>
              <button style={{...styles.actionBtn, ...styles.printBtn}}>Print Prescription</button>
              <button style={{...styles.actionBtn, ...styles.shareBtn}}>Share with Pharmacy</button>
            </div>
          </div>
        ))}
      </div>
      
      <div style={styles.pharmacyInfo}>
        <h3 style={styles.pharmacyTitle}>Preferred Pharmacy</h3>
        <div style={styles.pharmacyCard}>
          <div style={styles.pharmacyDetails}>
            <h4 style={styles.pharmacyName}>City Pharmacy</h4>
            <p style={styles.pharmacyAddress}>123 Medical Street, Health City</p>
            <p style={styles.pharmacyPhone}>Phone: (555) 123-4567</p>
            <p style={styles.pharmacyHours}>Open: 8:00 AM - 10:00 PM</p>
          </div>
          <button style={styles.changePharmacyBtn}>Change Pharmacy</button>
        </div>
      </div>

      {prescriptions.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💊</div>
          <h3>No prescriptions yet</h3>
          <p>Your prescriptions will appear here after your appointments.</p>
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
  prescriptionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    marginBottom: '40px',
  },
  prescriptionCard: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    },
  },
  prescriptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e3f2fd',
  },
  prescriptionTitle: {
    margin: 0,
    color: '#1976d2',
    fontSize: '1.3rem',
  },
  prescriptionDate: {
    padding: '5px 15px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  medicationsList: {
    marginBottom: '20px',
  },
  medicationsTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '1.1rem',
  },
  medicationItem: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  medName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '8px',
  },
  medDetails: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    fontSize: '14px',
    color: '#666',
  },
  medDetail: {
    padding: '3px 10px',
    background: 'white',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  instructions: {
    padding: '15px',
    background: '#fff8e1',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#5d4037',
    borderLeft: '4px solid #ffb300',
  },
  prescriptionActions: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease',
  },
  refillBtn: {
    background: '#ff9800',
    color: 'white',
    '&:hover': {
      background: '#f57c00',
    },
  },
  printBtn: {
    background: '#2196f3',
    color: 'white',
    '&:hover': {
      background: '#1976d2',
    },
  },
  shareBtn: {
    background: '#4caf50',
    color: 'white',
    '&:hover': {
      background: '#388e3c',
    },
  },
  pharmacyInfo: {
    background: '#e8f5e9',
    padding: '25px',
    borderRadius: '10px',
    borderLeft: '5px solid #4caf50',
  },
  pharmacyTitle: {
    marginBottom: '20px',
    color: '#2e7d32',
    fontSize: '1.2rem',
  },
  pharmacyCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  pharmacyDetails: {
    flex: 1,
  },
  pharmacyName: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '1.2rem',
  },
  pharmacyAddress: {
    margin: '0 0 5px 0',
    color: '#666',
  },
  pharmacyPhone: {
    margin: '0 0 5px 0',
    color: '#666',
  },
  pharmacyHours: {
    margin: 0,
    color: '#666',
  },
  changePharmacyBtn: {
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#e0e0e0',
    },
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

export default PatientPrescriptions;