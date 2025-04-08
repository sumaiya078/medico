import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorAvailability, setAvailability } from '../../services/doctor';
import Loading from '../common/Loading';

const AvailabilityForm = () => {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const data = await getDoctorAvailability(user.token);
        setAvailabilities(data);
      } catch (err) {
        setError(err.message || 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [user.token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError('Please fill all fields');
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      const newAvailability = await setAvailability(formData, user.token);
      setAvailabilities([...availabilities, newAvailability]);
      setFormData({
        date: '',
        startTime: '09:00',
        endTime: '17:00',
      });
    } catch (err) {
      setError(err.message || 'Failed to set availability');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) return;
    
    try {
      // Add API call to delete availability
      setAvailabilities(availabilities.filter(a => a._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete availability');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="availability-container">
      <h1>Manage Your Availability</h1>
      
      <div className="availability-form-container">
        <h2>Add New Availability</h2>
        <form onSubmit={handleSubmit} className="availability-form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="time-inputs">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Availability'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
      
      <div className="availability-list-container">
        <h2>Your Available Slots</h2>
        
        {availabilities.length === 0 ? (
          <p className="no-availability">No availability slots added yet</p>
        ) : (
          <div className="availability-list">
            {availabilities.map(slot => (
              <div key={slot._id} className="availability-item">
                <div className="slot-info">
                  <div className="slot-date">
                    {new Date(slot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="slot-time">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .availability-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 2rem;
        }
        
        h2 {
          color: #3498db;
          margin-bottom: 1.5rem;
        }
        
        .availability-form-container {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .availability-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }
        
        .form-group input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .time-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .submit-btn {
          padding: 0.75rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .submit-btn:hover {
          background-color: #2980b9;
        }
        
        .submit-btn:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #e74c3c;
          padding: 0.5rem;
          background-color: #fadbd8;
          border-radius: 4px;
          margin-top: 1rem;
        }
        
        .availability-list-container {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .no-availability {
          color: #666;
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }
        
        .availability-list {
          display: grid;
          gap: 1rem;
        }
        
        .availability-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 4px;
          transition: all 0.3s;
        }
        
        .availability-item:hover {
          background-color: #f8f9fa;
        }
        
        .slot-info {
          flex: 1;
        }
        
        .slot-date {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .slot-time {
          color: #3498db;
          font-size: 0.9rem;
        }
        
        .delete-btn {
          padding: 0.5rem 1rem;
          background-color: #f8f9fa;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .delete-btn:hover {
          background-color: #fadbd8;
        }
        
        @media (max-width: 768px) {
          .time-inputs {
            grid-template-columns: 1fr;
          }
          
          .availability-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AvailabilityForm;