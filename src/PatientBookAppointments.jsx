// PatientBookAppointment.jsx
import React, { useState } from 'react';

const PatientBookAppointment = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    date: '',
    timeSlot: '',
    reason: ''
  });

  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'General Medicine'
  ];

  const doctors = {
    'Cardiology': ['Dr. Sarah Smith', 'Dr. Robert Johnson'],
    'Neurology': ['Dr. Michael Brown', 'Dr. Jennifer Wilson'],
    'Orthopedics': ['Dr. David Lee', 'Dr. Amanda Taylor'],
    'Pediatrics': ['Dr. Lisa Martinez'],
    'Dermatology': ['Dr. Kevin White'],
    'General Medicine': ['Dr. Emily Johnson', 'Dr. Thomas Clark']
  };

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Appointment booked:', formData);
    alert('Appointment booked successfully!');
    setFormData({
      department: '',
      doctor: '',
      date: '',
      timeSlot: '',
      reason: ''
    });
    setStep(1);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Book New Appointment</h2>
      
      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} style={styles.step}>
            <div style={{
              ...styles.stepNumber,
              ...(step >= stepNum ? styles.stepNumberActive : {})
            }}>
              {stepNum}
            </div>
            <div style={styles.stepLabel}>
              {stepNum === 1 && 'Select Department'}
              {stepNum === 2 && 'Choose Doctor'}
              {stepNum === 3 && 'Select Time'}
              {stepNum === 4 && 'Confirm'}
            </div>
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div style={styles.bookingForm}>
        {step === 1 && (
          <div style={styles.formStep}>
            <h3 style={styles.stepTitle}>Step 1: Select Department</h3>
            <div style={styles.departmentGrid}>
              {departments.map(dept => (
                <button
                  key={dept}
                  style={{
                    ...styles.departmentCard,
                    ...(formData.department === dept ? styles.departmentCardSelected : {})
                  }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, department: dept }));
                    handleNext();
                  }}
                >
                  <div style={styles.deptIcon}>🏥</div>
                  <span>{dept}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={styles.formStep}>
            <h3 style={styles.stepTitle}>Step 2: Choose Doctor</h3>
            <div style={styles.doctorList}>
              {doctors[formData.department]?.map(doctor => (
                <div
                  key={doctor}
                  style={{
                    ...styles.doctorCard,
                    ...(formData.doctor === doctor ? styles.doctorCardSelected : {})
                  }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, doctor }));
                    handleNext();
                  }}
                >
                  <div style={styles.doctorInfo}>
                    <div style={styles.doctorIcon}>👨‍⚕️</div>
                    <div>
                      <h4 style={styles.doctorName}>{doctor}</h4>
                      <p style={styles.doctorSpecialization}>{formData.department}</p>
                      <p style={styles.availability}>Available Slots: 5</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button style={styles.backButton} onClick={handleBack}>
              ← Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={styles.formStep}>
            <h3 style={styles.stepTitle}>Step 3: Select Date & Time</h3>
            <div style={styles.datetimeSelection}>
              <div style={styles.datePicker}>
                <label style={styles.label}>Select Date:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={styles.dateInput}
                />
              </div>
              
              <div style={styles.timeSlots}>
                <label style={styles.label}>Available Time Slots:</label>
                <div style={styles.slotGrid}>
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      style={{
                        ...styles.timeSlot,
                        ...(formData.timeSlot === slot ? styles.timeSlotSelected : {})
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.reasonInput}>
                <label style={styles.label}>Reason for Visit:</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your symptoms..."
                  rows="3"
                  style={styles.reasonTextarea}
                />
              </div>
            </div>
            <div style={styles.formActions}>
              <button style={styles.backButton} onClick={handleBack}>
                ← Back
              </button>
              <button 
                style={{
                  ...styles.nextButton,
                  ...(!formData.date || !formData.timeSlot ? styles.buttonDisabled : {})
                }}
                onClick={handleNext}
                disabled={!formData.date || !formData.timeSlot}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={styles.formStep}>
            <h3 style={styles.stepTitle}>Step 4: Confirm Appointment</h3>
            <div style={styles.confirmationDetails}>
              <div style={styles.detailRow}>
                <strong>Department:</strong> {formData.department}
              </div>
              <div style={styles.detailRow}>
                <strong>Doctor:</strong> {formData.doctor}
              </div>
              <div style={styles.detailRow}>
                <strong>Date:</strong> {formData.date}
              </div>
              <div style={styles.detailRow}>
                <strong>Time Slot:</strong> {formData.timeSlot}
              </div>
              <div style={styles.detailRow}>
                <strong>Reason:</strong> {formData.reason}
              </div>
            </div>
            
            <div style={styles.formActions}>
              <button style={styles.backButton} onClick={handleBack}>
                ← Back
              </button>
              <button style={styles.confirmButton} onClick={handleSubmit}>
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
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
  stepIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '25px',
      left: 0,
      right: 0,
      height: '2px',
      background: '#e0e0e0',
      zIndex: 1,
    },
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  stepNumber: {
    width: '50px',
    height: '50px',
    background: '#e0e0e0',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginBottom: '10px',
    border: '5px solid white',
    fontSize: '1.2rem',
  },
  stepNumberActive: {
    background: '#1976d2',
  },
  stepLabel: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
  bookingForm: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  formStep: {
    minHeight: '400px',
  },
  stepTitle: {
    marginBottom: '30px',
    color: '#333',
    fontSize: '1.3rem',
  },
  departmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  departmentCard: {
    padding: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    fontSize: '1rem',
    '&:hover': {
      borderColor: '#1976d2',
      transform: 'translateY(-2px)',
    },
  },
  departmentCardSelected: {
    borderColor: '#1976d2',
    background: '#e3f2fd',
  },
  deptIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  doctorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px',
  },
  doctorCard: {
    padding: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#1976d2',
    },
  },
  doctorCardSelected: {
    borderColor: '#1976d2',
    background: '#e3f2fd',
  },
  doctorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  doctorIcon: {
    fontSize: '2.5rem',
  },
  doctorName: {
    margin: '0 0 5px 0',
    fontSize: '1.2rem',
    color: '#333',
  },
  doctorSpecialization: {
    margin: '0 0 5px 0',
    color: '#666',
  },
  availability: {
    color: '#4caf50',
    fontWeight: 'bold',
    margin: 0,
  },
  datetimeSelection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  datePicker: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  timeSlots: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  reasonInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
  },
  dateInput: {
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    maxWidth: '300px',
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
  },
  timeSlot: {
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
    '&:hover': {
      borderColor: '#1976d2',
    },
  },
  timeSlotSelected: {
    borderColor: '#1976d2',
    background: '#e3f2fd',
    color: '#1976d2',
  },
  reasonTextarea: {
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    maxWidth: '500px',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px',
  },
  backButton: {
    padding: '12px 24px',
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#e0e0e0',
    },
  },
  nextButton: {
    padding: '12px 24px',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#1565c0',
    },
  },
  confirmButton: {
    padding: '12px 24px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#388e3c',
    },
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  confirmationDetails: {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '10px',
    marginBottom: '30px',
    fontSize: '1rem',
    lineHeight: '1.6',
  },
  detailRow: {
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
    color: '#555',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
};

export default PatientBookAppointment;