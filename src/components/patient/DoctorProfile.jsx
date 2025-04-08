import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorById } from '../../services/doctor';
import Loading from '../common/Loading';

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorById(id);
        setDoctor(data);
      } catch (err) {
        setError(err.message || 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!doctor) return <div>Doctor not found</div>;

  return (
    <div className="doctor-profile-container">
      <div className="profile-header">
        <div className="profile-image">
          <img src={doctor.profile.image || '/images/doctor-avatar.png'} alt={doctor.name} />
        </div>
        <div className="profile-info">
          <h1>{doctor.name}</h1>
          <p className="specialization">{doctor.profile.specialization}</p>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span className="rating-value">4.8 (120 reviews)</span>
          </div>
          {user && user.role === 'patient' && (
            <a 
              href={`/patient/doctors/${doctor._id}/book`} 
              className="book-btn"
            >
              Book Appointment
            </a>
          )}
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h2>About</h2>
          <p>{doctor.profile.bio || 'No bio available'}</p>
        </div>

        <div className="detail-section">
          <h2>Qualifications</h2>
          <ul className="qualifications-list">
            {doctor.profile.qualifications.map((qual, index) => (
              <li key={index}>{qual}</li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h2>Experience</h2>
          <p>{doctor.profile.experience} years of experience</p>
        </div>

        <div className="detail-section">
          <h2>Consultation Fee</h2>
          <p>${doctor.profile.consultationFee}</p>
        </div>
      </div>

      <style jsx>{`
        .doctor-profile-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .profile-header {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          align-items: center;
        }
        
        .profile-image img {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #3498db;
        }
        
        .profile-info {
          flex: 1;
        }
        
        .profile-info h1 {
          margin: 0 0 0.5rem;
          color: #2c3e50;
        }
        
        .specialization {
          color: #3498db;
          font-weight: 500;
          font-size: 1.2rem;
          margin: 0 0 1rem;
        }
        
        .rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 0;
        }
        
        .stars {
          color: #f39c12;
          font-size: 1.2rem;
        }
        
        .rating-value {
          color: #666;
        }
        
        .book-btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        
        .book-btn:hover {
          background-color: #2980b9;
        }
        
        .profile-details {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .detail-section {
          margin-bottom: 2rem;
        }
        
        .detail-section h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .qualifications-list {
          list-style-type: none;
          padding: 0;
        }
        
        .qualifications-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .qualifications-list li:last-child {
          border-bottom: none;
        }
        
        .error-message {
          color: #e74c3c;
          padding: 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .rating {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorProfile;