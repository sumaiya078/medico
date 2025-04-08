import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/admin';
import Loading from '../common/Loading';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers(user.token);
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user.token]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const updatedUser = await updateUserRole(userId, newRole, user.token);
      setUsers(users.map(u => 
        u._id === userId ? updatedUser : u
      ));
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setUpdatingId(userId);
    try {
      await deleteUser(userId, user.token);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management-container">
      <h1>User Management</h1>
      
      <div className="users-table">
        <div className="table-header">
          <div className="header-cell">Name</div>
          <div className="header-cell">Email</div>
          <div className="header-cell">Role</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {users.length === 0 ? (
          <div className="no-users">No users found</div>
        ) : (
          users.map(userItem => (
            <div key={userItem._id} className="table-row">
              <div className="table-cell">{userItem.name}</div>
              <div className="table-cell">{userItem.email}</div>
              <div className="table-cell">
                <select
                  value={userItem.role}
                  onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                  disabled={updatingId === userItem._id || userItem._id === user.id}
                  className="role-select"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="table-cell actions">
                {userItem._id !== user.id && (
                  <button
                    onClick={() => handleDelete(userItem._id)}
                    disabled={updatingId === userItem._id}
                    className="delete-btn"
                  >
                    {updatingId === userItem._id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .user-management-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 2rem;
        }
        
        .users-table {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 120px;
          background-color: #3498db;
          color: white;
          font-weight: 500;
        }
        
        .header-cell {
          padding: 1rem;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 120px;
          border-bottom: 1px solid #eee;
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .table-cell {
          padding: 1rem;
          display: flex;
          align-items: center;
        }
        
        .no-users {
          padding: 2rem;
          text-align: center;
          color: #666;
        }
        
        .role-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }
        
        .role-select:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }
        
        .actions {
          justify-content: flex-end;
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
        
        .delete-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #e74c3c;
          padding: 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .table-header {
            display: none;
          }
          
          .table-row {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 0.5rem;
            border-bottom: 1px solid #eee;
          }
          
          .table-cell {
            padding: 0.5rem 0;
          }
          
          .table-cell::before {
            content: attr(data-label);
            font-weight: 500;
            color: #3498db;
            margin-right: 0.5rem;
          }
          
          .actions {
            justify-content: flex-start;
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;