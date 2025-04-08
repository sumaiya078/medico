import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllDoctors } from '../../services/doctor';
import { Link } from 'react-router-dom';
import Loading from '../common/Loading';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (err) {
        setError(err.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.profile.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === 'all' || 
                                 doctor.profile.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(doctors.map(doctor => doctor.profile.specialization))];

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="doctor-list-container">
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Specializations</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="no-results">No doctors found matching your criteria</div>
      ) : (
        <div className="doctors-grid">
          {filteredDoctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-image">
                <img src={doctor.profile.image || '/images/doctor-avatar.png'} alt={doctor.name} />
              </div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p className="specialization">{doctor.profile.specialization}</p>
                <p className="experience">{doctor.profile.experience} years experience</p>
                <p className="qualifications">
                  {doctor.profile.qualifications.join(', ')}
                </p>
                <div className="doctor-actions">
                  <Link to={`/patient/doctors/${doctor._id}`} className="view-profile">
                    View Profile
                  </Link>
                  {user && user.role === 'patient' && (
                    <Link 
                      to={`/patient/doctors/${doctor._id}/book`} 
                      className="book-btn"
                    >
                      Book Appointment
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .doctor-list-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .search-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }
        
        .no-results {
          text-align: center;
          padding: 2rem;
          font-size: 1.2rem;
          color: #666;
        }
        
        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }
        
        .doctor-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .doctor-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .doctor-image img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .doctor-info {
          padding: 1.5rem;
        }
        
        .doctor-info h3 {
          margin: 0 0 0.5rem;
          color: #2c3e50;
        }
        
        .specialization {
          color: #3498db;
          font-weight: 500;
          margin: 0 0 0.5rem;
        }
        
        .experience, .qualifications {
          color: #666;
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
        }
        
        .doctor-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .view-profile, .book-btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-size: 0.9rem;
          transition: background-color 0.3s;
        }
        
        .view-profile {
          background-color: #f8f9fa;
          color: #2c3e50;
          border: 1px solid #ddd;
        }
        
        .view-profile:hover {
          background-color: #e9ecef;
        }
        
        .book-btn {
          background-color: #3498db;
          color: white;
          border: none;
        }
        
        .book-btn:hover {
          background-color: #2980b9;
        }
        
        .error-message {
          color: #e74c3c;
          padding: 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .search-filters {
            flex-direction: column;
          }
          
          .doctors-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorList;