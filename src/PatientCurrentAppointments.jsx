// PatientCurrentAppointments.jsx
import React, { useState } from 'react';

const PatientCurrentAppointments = () => {
  const [appointments] = useState([
    {
      id: 1,
      doctor: 'Dr. Sarah Smith',
      specialization: 'Cardiologist',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'Confirmed',
      location: 'Room 101, Cardiology Wing'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Brown',
      specialization: 'Neurologist',
      date: '2024-01-20',
      time: '2:30 PM',
      status: 'Upcoming',
      location: 'Room 205, Neurology Department'
    },
    {
      id: 3,
      doctor: 'Dr. Emily Johnson',
      specialization: 'General Physician',
      date: '2024-01-25',
      time: '11:15 AM',
      status: 'Upcoming',
      location: 'Room 304, Main Building'
    }
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Appointments</h2>
      
      <div style={styles.appointmentList}>
        {appointments.map(appointment => (
          <div key={appointment.id} style={styles.appointmentCard}>
            <div style={styles.appointmentHeader}>
              <h3 style={styles.doctorName}>{appointment.doctor}</h3>
              <span style={{
                ...styles.statusBadge,
                ...(appointment.status === 'Confirmed' ? styles.statusConfirmed : styles.statusUpcoming)
              }}>
                {appointment.status}
              </span>
            </div>
            
            <div style={styles.appointmentDetails}>
              <div style={styles.detailItem}>
                <span style={styles.label}>Specialization:</span>
                <span style={styles.value}>{appointment.specialization}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.label}>Date:</span>
                <span style={styles.value}>{appointment.date}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.label}>Time:</span>
                <span style={styles.value}>{appointment.time}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.label}>Location:</span>
                <span style={styles.value}>{appointment.location}</span>
              </div>
            </div>
            
            <div style={styles.appointmentActions}>
              <button style={{...styles.actionBtn, ...styles.rescheduleBtn}}>Reschedule</button>
              <button style={{...styles.actionBtn, ...styles.cancelBtn}}>Cancel</button>
              <button style={{...styles.actionBtn, ...styles.directionsBtn}}>Get Directions</button>
            </div>
          </div>
        ))}
      </div>
      
      <div style={styles.upcomingSection}>
        <h3 style={styles.upcomingTitle}>Today's Appointment</h3>
        <div style={styles.todayAppointment}>
          {appointments[0] ? (
            <>
              <h4 style={styles.todayDoctor}>With {appointments[0].doctor}</h4>
              <p style={styles.todayDetail}>Time: {appointments[0].time}</p>
              <p style={styles.todayDetail}>Location: {appointments[0].location}</p>
              <button style={styles.checkInBtn}>Check In</button>
            </>
          ) : (
            <p>No appointments scheduled for today.</p>
          )}
        </div>
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
  appointmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '40px',
  },
  appointmentCard: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    },
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  doctorName: {
    margin: 0,
    color: '#1976d2',
    fontSize: '1.3rem',
  },
  statusBadge: {
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
  },
  statusConfirmed: {
    background: '#4caf50',
  },
  statusUpcoming: {
    background: '#ff9800',
  },
  appointmentDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  },
  value: {
    fontWeight: '500',
    color: '#333',
    fontSize: '1rem',
  },
  appointmentActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease',
  },
  rescheduleBtn: {
    background: '#2196f3',
    color: 'white',
  },
  cancelBtn: {
    background: '#f44336',
    color: 'white',
  },
  directionsBtn: {
    background: '#4caf50',
    color: 'white',
  },
  upcomingSection: {
    background: '#e3f2fd',
    padding: '20px',
    borderRadius: '10px',
    borderLeft: '5px solid #1976d2',
  },
  upcomingTitle: {
    marginBottom: '15px',
    color: '#1976d2',
    fontSize: '1.2rem',
  },
  todayAppointment: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
  },
  todayDoctor: {
    marginBottom: '10px',
    color: '#333',
  },
  todayDetail: {
    marginBottom: '8px',
    color: '#555',
  },
  checkInBtn: {
    background: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '16px',
  },
};

export default PatientCurrentAppointments;