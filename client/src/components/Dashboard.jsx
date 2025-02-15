import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState({
    users: [],
    orgUnits: [],
    groups: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    axios
      .get('http://localhost:3000/api/google/me', { withCredentials: true })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error importing data:', err);
        setError('Failed to load data.');
        setLoading(false);
      });
  }, []);

 console.log(data)
  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      <section>
        <h2>Google Workspace Users</h2>
        {data.users.length > 0 ? (
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
                  <td>{user.name.fullName || user.name}</td>
                  <td>{user.orgUnitPath}</td>
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
        {data.orgUnits.length > 0 ? (
          <ul>
            {data.orgUnits.map((unit) => (
              <li key={unit.orgUnitPath}>
                {unit.name} ({unit.orgUnitPath})
              </li>
            ))}
          </ul>
        ) : (
          <p>No organizational units found.</p>
        )}
      </section>

      <section>
        <h2>Groups</h2>
        {data.groups.length > 0 ? (
          <ul>
            {data.groups.map((group) => (
              <li key={group.id}>
                {group.name} - {group.email}
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
