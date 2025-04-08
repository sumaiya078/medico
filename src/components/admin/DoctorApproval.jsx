import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingDoctors, approveDoctor, rejectDoctor } from '../../services/admin';
import Loading from '../common/Loading';

const DoctorApproval = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchPendingDoctors = async () => {
      try {
        const data = await getPendingDoctors(user.token);
        setDoctors(data);
      } catch (err) {
        setError(err.message || 'Failed to load pending doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchPendingDoctors();
  }, [user.token]);

  const handleApprove = async (doctorId) => {
    setProcessingId(doctorId);
    try {
      await approveDoctor(doctorId, user.token);
      setDoctors(doctors.filter(d => d._id !== doctorId));
    } catch (err) {
      setError(err.message || 'Failed to approve doctor');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (doctorId) => {
    if (!window.confirm('Are you sure you want to reject this doctor?')) return;
    
    setProcessingId(doctorId);
    try {
      await rejectDoctor(doctorId, user.token);
      setDoctors(doctors.filter(d => d._id !== doctorId));
    } catch (err) {
      setError(err.message || 'Failed to reject doctor');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="doctor-approval-container">
      <h1>Doctor Approval Requests</h1>
      
      {doctors.length === 0 ? (
        <div className="no-pending">
          No pending doctor approval requests
        </div>
      ) : (
        <div className="doctors-list">
          {doctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p className="email">{doctor.email}</p>
                
                <div className="doctor-details">
                  <div className="detail">
                    <span className="label">Specialization:</span>
                    <span className="value">{doctor.profile.specialization}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Experience:</span>
                    <span className="value">{doctor.profile.experience} years</span>
                  </div>
                  <div className="detail">
                    <span className="label">Qualifications:</span>
                    <span className="value">{doctor.profile.qualifications.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="approval-actions">
                <button
                  onClick={() => handleApprove(doctor._id)}
                  disabled={processingId === doctor._id}
                  className="approve-btn"
                >
                  {processingId === doctor._id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(doctor._id)}
                  disabled={processingId === doctor._id}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .doctor-approval-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 2rem;
        }
        
        .no-pending {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          color: #666;
        }
        
        .doctors-list {
          display: grid;
          gap: 1.5rem;
        }
        
        .doctor-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
        }
        
        .doctor-info {
          flex: 1;
        }
        
        .doctor-info h3 {
          margin: 0 0 0.25rem;
          color: #2c3e50;
        }
        
        .email {
          color: #666;
          margin: 0 0 1rem;
          font-size: 0.9rem;
        }
        
        .doctor-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .detail {
          display: flex;
          flex-direction: column;
        }
        
        .label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.25rem;
        }
        
        .value {
          font-weight: 500;
        }
        
        .approval-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .approve-btn, .reject-btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }
        
        .approve-btn {
          background-color: #e8f8f5;
          color: #1abc9c;
          border: 1px solid #1abc9c;
        }
        
        .approve-btn:hover {
          background-color: #d1f2eb;
        }
        
        .reject-btn {
          background-color: #f8f9fa;
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }
        
        .reject-btn:hover {
          background-color: #fadbd8;
        }
        
        .approve-btn:disabled, .reject-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #e74c3c;
          padding: 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .doctor-card {
            flex-direction: column;
          }
          
          .approval-actions {
            flex-direction: row;
          }
          
          .doctor-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorApproval;