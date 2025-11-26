import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getUser, isAdmin, logout } from '../utils/auth';
import { getImageURL } from '../utils/config';
import './UserDetail.css';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const currentUser = getUser();

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      setUser(response.data.data.user);
      setFormData(response.data.data.user);
    } catch (error) {
      toast.error('Failed to fetch user details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setProfileImage(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.name && (!formData.name.trim() || formData.name.trim().length < 3)) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10-15 digits';
    }

    if (formData.pincode && !/^\d{4,10}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 4-10 digits';
    }

    if (formData.address && formData.address.length > 150) {
      newErrors.address = 'Address must not exceed 150 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'profile_image' && key !== '__v') {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }

      const response = await api.put(`/users/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.data.user);
      setFormData(response.data.data.user);
      setEditing(false);
      setProfileImage(null);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="user-detail-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if current user can edit/delete
  const canEdit = isAdmin() || currentUser._id === user._id;
  const canDelete = isAdmin() && currentUser._id !== user._id;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="user-detail-container">
      <div className="user-detail-header">
        {isAdmin() && (
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
        )}
        {!isAdmin() && (
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        )}
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">
            Edit User
          </button>
        )}
        {canDelete && (
          <button onClick={handleDelete} className="btn btn-danger">
            Delete User
          </button>
        )}
      </div>

      <div className="user-detail-card card">
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="user-profile-section">
              {user.profile_image ? (
                <img
                  src={getImageURL(user.profile_image)}
                  alt={user.name}
                  className="profile-image-large"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              {!user.profile_image && (
                <div className="profile-placeholder">No Image</div>
              )}
              <div className="form-group">
                <label>Update Profile Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                />
                {profileImage && (
                  <p style={{ marginTop: '5px', color: '#28a745' }}>
                    New image selected: {profileImage.name}
                  </p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleChange}
                />
                {errors.pincode && (
                  <span className="error-message">{errors.pincode}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  rows="3"
                />
                {errors.address && (
                  <span className="error-message">{errors.address}</span>
                )}
              </div>

              {isAdmin() && (
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role || 'user'}
                    onChange={handleChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(user);
                  setProfileImage(null);
                  setErrors({});
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="user-info-view">
            {!isAdmin() && currentUser._id === user._id && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '1px solid #dee2e6'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  Welcome, {user.name}
                </h3>
                <p style={{ margin: 0, color: '#666' }}>
                  This is your profile page. You can edit your information by clicking the Edit User button above.
                </p>
              </div>
            )}
            <div className="user-profile-section">
              {user.profile_image ? (
                <>
                  <img
                    src={getImageURL(user.profile_image)}
                    alt={user.name}
                    className="profile-image-large"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = document.querySelector('.profile-placeholder-fallback');
                      if (placeholder) placeholder.style.display = 'block';
                    }}
                  />
                  <div className="profile-placeholder profile-placeholder-fallback" style={{ display: 'none' }}>
                    No Image
                  </div>
                </>
              ) : (
                <div className="profile-placeholder">No Image</div>
              )}
            </div>

            <div className="user-details-grid">
              <div className="detail-item">
                <label>Name:</label>
                <span>{user.name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{user.phone}</span>
              </div>
              <div className="detail-item">
                <label>State:</label>
                <span>{user.state}</span>
              </div>
              <div className="detail-item">
                <label>City:</label>
                <span>{user.city}</span>
              </div>
              <div className="detail-item">
                <label>Country:</label>
                <span>{user.country}</span>
              </div>
              <div className="detail-item">
                <label>Pincode:</label>
                <span>{user.pincode}</span>
              </div>
              <div className="detail-item">
                <label>Address:</label>
                <span>{user.address || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Role:</label>
                <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                  {user.role}
                </span>
              </div>
              <div className="detail-item">
                <label>Created At:</label>
                <span>{new Date(user.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Updated At:</label>
                <span>{new Date(user.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;

