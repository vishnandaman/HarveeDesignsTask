import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getUser, logout, isAdmin } from '../utils/auth';
import { getImageURL } from '../utils/config';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const currentUser = getUser();

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [currentPage, searchTerm, filterState, filterCity, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterState) params.state = filterState;
      if (filterCity) params.city = filterCity;

      const response = await api.get('/users', { params });
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get unique states and cities for filters
  const uniqueStates = [...new Set(users.map((u) => u.state))].sort();
  const uniqueCities = [...new Set(users.map((u) => u.city))].sort();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>User Management Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {currentUser?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Filters */}
        <div className="filters-card card">
          <h3>Search & Filter</h3>
          <div className="filters-grid">
            <div className="form-group">
              <label>Search (Name/Email)</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or email..."
              />
            </div>

            <div className="form-group">
              <label>Filter by State</label>
              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Filter by City</label>
              <select
                value={filterCity}
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          {loading ? (
            <div className="spinner"></div>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>
              No users found
            </p>
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')}>
                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('email')}>
                        Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Phone</th>
                      <th onClick={() => handleSort('state')}>
                        State {sortBy === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('city')}>
                        City {sortBy === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          {user.profile_image ? (
                            <img
                              src={getImageURL(user.profile_image)}
                              alt={user.name}
                              className="profile-thumbnail"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          {user.name}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.state}</td>
                        <td>{user.city}</td>
                        <td>
                          <span
                            className={`role-badge ${
                              user.role === 'admin' ? 'admin' : 'user'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => navigate(`/user/${user._id}`)}
                            className="btn btn-primary"
                            style={{ marginRight: '5px', padding: '5px 10px' }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="btn btn-danger"
                            style={{ padding: '5px 10px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

