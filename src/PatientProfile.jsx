// PatientProfile.jsx
import React, { useState } from 'react';

const PatientProfile = ({ patientData, onBack, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...patientData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={styles.profilePage}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div style={styles.profileContainer}>
        <div style={styles.profileHeader}>
          <div style={styles.profilePhotoSection}>
            <img 
              src={formData.profilePhoto} 
              alt="Profile" 
              style={styles.profilePhotoLarge}
            />
            {isEditing && (
              <label style={styles.changePhotoBtn}>
                Change Photo
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <div style={styles.profileInfo}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.profileInput}
                />
                <div style={styles.profileDetailsEdit}>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    style={styles.detailInput}
                  />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    style={styles.detailInput}
                  />
                </div>
              </>
            ) : (
              <>
                <h1 style={styles.profileName}>{formData.name}</h1>
                <div style={styles.profileDetails}>
                  <span style={styles.detailBadge}>ID: {formData.id}</span>
                  <span style={styles.detailBadge}>Age: {formData.age}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Profile Information */}
        <div style={styles.profileDetailsSection}>
          <h2 style={styles.sectionTitle}>Personal Information</h2>
          {isEditing ? (
            <div style={styles.editForm}>
              <div style={styles.formGroup}>
                <label>Email:</label>
                <input type="email" style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Phone:</label>
                <input type="tel" style={styles.formInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Address:</label>
                <textarea style={{...styles.formInput, height: '80px'}} />
              </div>
              <div style={styles.formGroup}>
                <label>Emergency Contact:</label>
                <input type="text" style={styles.formInput} />
              </div>
            </div>
          ) : (
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <strong>Email:</strong> john.doe@example.com
              </div>
              <div style={styles.infoItem}>
                <strong>Phone:</strong> (123) 456-7890
              </div>
              <div style={styles.infoItem}>
                <strong>Address:</strong> 123 Main St, City, State
              </div>
              <div style={styles.infoItem}>
                <strong>Emergency Contact:</strong> Jane Doe (987) 654-3210
              </div>
              <div style={styles.infoItem}>
                <strong>Blood Group:</strong> O+
              </div>
              <div style={styles.infoItem}>
                <strong>Allergies:</strong> Penicillin
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Button */}
        <div style={styles.profileActions}>
          {isEditing ? (
            <div style={styles.editActions}>
              <button style={styles.saveBtn} onClick={handleSave}>
                Save Changes
              </button>
              <button 
                style={styles.cancelBtn}
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ ...patientData });
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              style={styles.editProfileBtn}
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  profilePage: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '10px 0',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  profileContainer: {
    background: 'white',
    borderRadius: '10px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '40px',
  },
  profilePhotoSection: {
    textAlign: 'center',
  },
  profilePhotoLarge: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '5px solid #f0f0f0',
  },
  changePhotoBtn: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 16px',
    background: '#1976d2',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    color: '#333',
  },
  profileDetails: {
    display: 'flex',
    gap: '20px',
  },
  detailBadge: {
    padding: '8px 16px',
    backgroundColor: '#e3f2fd',
    borderRadius: '20px',
    color: '#1976d2',
    fontWeight: '500',
  },
  profileInput: {
    fontSize: '2rem',
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '10px',
  },
  profileDetailsEdit: {
    display: 'flex',
    gap: '10px',
  },
  detailInput: {
    padding: '8px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    width: '150px',
  },
  profileDetailsSection: {
    margin: '40px 0',
  },
  sectionTitle: {
    marginBottom: '20px',
    color: '#333',
    borderBottom: '2px solid #1976d2',
    paddingBottom: '10px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  infoItem: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: '4px solid #1976d2',
    color: '#555',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formInput: {
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  profileActions: {
    marginTop: '40px',
    textAlign: 'center',
  },
  editProfileBtn: {
    background: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '18px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#1565c0',
    },
  },
  editActions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },
  saveBtn: {
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#4caf50',
    color: 'white',
  },
  cancelBtn: {
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#0472ef',
    color: 'white',
  },
};

export default PatientProfile;