import React, { useEffect, useState } from "react";
import axios from "axios";

const RenewalTracking = () => {
  const [renewals, setRenewals] = useState([]);
  const [filteredRenewals, setFilteredRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/subscriptions"
      );

      setRenewals(response.data);
      setFilteredRenewals(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    const filtered = renewals.filter(
      (item) =>
        item.userName.toLowerCase().includes(value.toLowerCase()) ||
        item.courseName.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredRenewals(filtered);
  };

  const renewSubscription = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/api/subscriptions/renew/${id}`
      );

      alert("Subscription Renewed Successfully");

      fetchRenewals();
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="badge bg-success">
            Active
          </span>
        );

      case "EXPIRING":
        return (
          <span className="badge bg-warning text-dark">
            Expiring Soon
          </span>
        );

      case "EXPIRED":
        return (
          <span className="badge bg-danger">
            Expired
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>
          Renewal Tracking
        </h2>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search User/Course"
          value={search}
          onChange={handleSearch}
        />

      </div>

      <table className="table table-striped table-hover shadow">

        <thead className="table-dark">

          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Course</th>
            <th>Start Date</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Renew</th>
          </tr>

        </thead>

        <tbody>

          {filteredRenewals.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No Records Found
              </td>
            </tr>
          ) : (
            filteredRenewals.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>

                <td>{item.userName}</td>

                <td>{item.courseName}</td>

                <td>{item.startDate}</td>

                <td>{item.expiryDate}</td>

                <td>
                  {getStatusBadge(item.status)}
                </td>

                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={item.status === "ACTIVE"}
                    onClick={() => renewSubscription(item.id)}
                  >
                    Renew
                  </button>
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
};

export default RenewalTracking;