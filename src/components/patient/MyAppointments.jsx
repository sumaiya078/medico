import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientAppointments, cancelAppointment } from '../../services/patient';
import Loading from '../common/Loading';
import { format } from 'date-fns';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getPatientAppointments(user.token);
        setAppointments(data);
      } catch (err) {
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user.token]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    setCancellingId(appointmentId);
    try {
      await cancelAppointment(appointmentId, user.token);
      setAppointments(appointments.map(appt => 
        appt._id === appointmentId ? { ...appt, status: 'cancelled' } : appt
      ));
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-appointments-container">
      <h1>My Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>You don't have any appointments yet.</p>
          <a href="/patient/doctors" className="find-doctor-btn">
            Find a Doctor
          </a>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(appointment => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-info">
                <div className="doctor-info">
                  <h3>Dr. {appointment.doctor.name}</h3>
                  <p className="specialization">{appointment.doctor.profile.specialization}</p>
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
                    <span className="label">Status:</span>
                    <span className={`status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  {appointment.reason && (
                    <div className="detail">
                      <span className="label">Reason:</span>
                      <span className="value">{appointment.reason}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="appointment-actions">
                {appointment.status === 'booked' && (
                  <button
                    onClick={() => handleCancel(appointment._id)}
                    disabled={cancellingId === appointment._id}
                    className="cancel-btn"
                  >
                    {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .my-appointments-container {
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
          padding: 3rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .no-appointments p {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        
        .find-doctor-btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        
        .find-doctor-btn:hover {
          background-color: #2980b9;
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
        
        .doctor-info h3 {
          margin: 0 0 0.25rem;
          color: #2c3e50;
        }
        
        .specialization {
          color: #3498db;
          font-weight: 500;
          margin: 0 0 1rem;
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
        
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .status.booked {
          background-color: #ebf5fb;
          color: #3498db;
        }
        
        .status.completed {
          background-color: #e8f8f5;
          color: #1abc9c;
        }
        
        .status.cancelled {
          background-color: #fdedec;
          color: #e74c3c;
        }
        
        .appointment-actions {
          display: flex;
          align-items: flex-start;
        }
        
        .cancel-btn {
          padding: 0.5rem 1rem;
          background-color: #f8f9fa;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .cancel-btn:hover {
          background-color: #fadbd8;
        }
        
        .cancel-btn:disabled {
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
          
          .appointment-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MyAppointments;