import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus } from '../../services/doctor';
import Loading from '../common/Loading';
import { format } from 'date-fns';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getDoctorAppointments(user.token);
        setAppointments(data);
      } catch (err) {
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user.token]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      const updatedAppointment = await updateAppointmentStatus(
        appointmentId, 
        newStatus, 
        user.token
      );
      setAppointments(appointments.map(appt => 
        appt._id === appointmentId ? updatedAppointment : appt
      ));
    } catch (err) {
      setError(err.message || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="doctor-appointments-container">
      <h1>Your Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="no-appointments">
          You don't have any appointments scheduled yet.
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(appointment => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-info">
                <div className="patient-info">
                  <h3>{appointment.patient.name}</h3>
                  <p className="email">{appointment.patient.email}</p>
                </div>
                
                <div className="appointment-details">
                  <div className="detail">
                    <span className="label">Date:</span>
                    <span className="value">
                      {format(new Date(appointment.slot.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Time:</span>
                    <span className="value">
                      {appointment.slot.startTime} - {appointment.slot.endTime}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Reason:</span>
                    <span className="value">{appointment.reason || 'Not specified'}</span>
                  </div>
                </div>
              </div>
              
              <div className="appointment-status">
                <div className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </div>
                
                {appointment.status === 'booked' && (
                  <div className="status-actions">
                    <button
                      onClick={() => handleStatusChange(appointment._id, 'completed')}
                      disabled={updatingId === appointment._id}
                      className="complete-btn"
                    >
                      {updatingId === appointment._id ? 'Updating...' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                      disabled={updatingId === appointment._id}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .doctor-appointments-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 2rem;
        }
        
        .no-appointments {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          color: #666;
        }
        
        .appointments-list {
          display: grid;
          gap: 1.5rem;
        }
        
        .appointment-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
        }
        
        .appointment-info {
          flex: 1;
        }
        
        .patient-info h3 {
          margin: 0 0 0.25rem;
          color: #2c3e50;
        }
        
        .email {
          color: #666;
          margin: 0 0 1rem;
          font-size: 0.9rem;
        }
        
        .appointment-details {
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
        
        .appointment-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
        }
        
        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .status-badge.booked {
          background-color: #ebf5fb;
          color: #3498db;
        }
        
        .status-badge.completed {
          background-color: #e8f8f5;
          color: #1abc9c;
        }
        
        .status-badge.cancelled {
          background-color: #fdedec;
          color: #e74c3c;
        }
        
        .status-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .complete-btn, .cancel-btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .complete-btn {
          background-color: #e8f8f5;
          color: #1abc9c;
          border: 1px solid #1abc9c;
        }
        
        .complete-btn:hover {
          background-color: #d1f2eb;
        }
        
        .cancel-btn {
          background-color: #f8f9fa;
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }
        
        .cancel-btn:hover {
          background-color: #fadbd8;
        }
        
        .complete-btn:disabled, .cancel-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #e74c3c;
          padding: 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .appointment-card {
            flex-direction: column;
          }
          
          .appointment-status {
            align-items: flex-start;
          }
          
          .appointment-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorAppointments;