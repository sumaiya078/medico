import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorById, bookAppointment } from '../../services/doctor';
import Loading from '../common/Loading';

const AppointmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorAndSlots = async () => {
      try {
        const data = await getDoctorById(id);
        setDoctor(data.doctor);
        setAvailableSlots(data.availableSlots);
      } catch (err) {
        setError(err.message || 'Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorAndSlots();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await bookAppointment({
        doctorId: id,
        slotId: selectedSlot,
        reason,
      }, user.token);
      navigate('/patient/appointments');
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!doctor) return <div>Doctor not found</div>;

  return (
    <div className="appointment-form-container">
      <h1>Book Appointment with Dr. {doctor.name}</h1>
      <p className="specialization">{doctor.profile.specialization}</p>
      
      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-group">
          <label>Available Time Slots</label>
          {availableSlots.length === 0 ? (
            <p className="no-slots">No available slots. Please check back later.</p>
          ) : (
            <div className="time-slots">
              {availableSlots.map(slot => (
                <div 
                  key={slot._id} 
                  className={`time-slot ${selectedSlot === slot._id ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot._id)}
                >
                  <div className="slot-date">
                    {new Date(slot.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="slot-time">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="reason">Reason for Appointment</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your symptoms or reason for the appointment"
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={!selectedSlot || submitting}
          >
            {submitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate(`/patient/doctors/${id}`)}
          >
            Cancel
          </button>
        </div>
        
        {error && <div className="form-error">{error}</div>}
      </form>

      <style jsx>{`
        .appointment-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }
        
        .specialization {
          color: #3498db;
          font-weight: 500;
          margin-bottom: 2rem;
        }
        
        .appointment-form {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
          margin-bottom: 2rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }
        
        .no-slots {
          color: #666;
          font-style: italic;
        }
        
        .time-slots {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .time-slot {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        
        .time-slot:hover {
          border-color: #3498db;
          background-color: #f8fafc;
        }
        
        .time-slot.selected {
          border-color: #3498db;
          background-color: #ebf5fb;
        }
        
        .slot-date {
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .slot-time {
          color: #3498db;
          font-size: 0.9rem;
        }
        
        textarea {
          width: 100%;
          min-height: 120px;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
        }
        
        textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .submit-btn, .cancel-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .submit-btn {
          background-color: #3498db;
          color: white;
          border: none;
        }
        
        .submit-btn:hover {
          background-color: #2980b9;
        }
        
        .submit-btn:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
        
        .cancel-btn {
          background-color: #f8f9fa;
          color: #2c3e50;
          border: 1px solid #ddd;
        }
        
        .cancel-btn:hover {
          background-color: #e9ecef;
        }
        
        .form-error {
          color: #e74c3c;
          margin-top: 1rem;
          padding: 0.5rem;
          background-color: #fadbd8;
          border-radius: 4px;
        }
        
        .error-message {
          color: #e74c3c;
          padding: 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .time-slots {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentForm;