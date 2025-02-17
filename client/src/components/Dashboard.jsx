import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    users: [],
    orgUnits: [],
    groups: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/google/me', {
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        });
        console.log(response.data);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          // Redirect to login if unauthorized
          navigate('/');
          return;
        }
        setError(err.response?.data?.error || 'An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the useEffect
    navigate(0);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Loading data...</h2>
        <p>Please wait while we fetch your Google Workspace data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={retryFetch}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      <section>
        <h2>Google Workspace Users</h2>
        {data.users?.length > 0 ? (
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Org Unit (Department)</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id || user.primaryEmail}>
                  <td>{user.primaryEmail}</td>
                  <td>{user.name?.fullName || user.name || 'N/A'}</td>
                  <td>{user.orgUnitPath || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </section>

      <section>
        <h2>Organizational Units</h2>
        {data.orgUnits?.length > 0 ? (
          <ul>
            {data.orgUnits.map((unit) => (
              <li key={unit.orgUnitPath}>
                {unit.name || 'Unnamed Unit'} ({unit.orgUnitPath})
              </li>
            ))}
          </ul>
        ) : (
          <p>No organizational units found.</p>
        )}
      </section>

      <section>
        <h2>Groups</h2>
        {data.groups?.length > 0 ? (
          <ul>
            {data.groups.map((group) => (
              <li key={group.id}>
                {group.name || 'Unnamed Group'} - {group.email || 'No email'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No groups found.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
