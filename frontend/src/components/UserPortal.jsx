import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main"; // Import the context
import axios from "axios"; // Import axios for API calls

const UserPortal = () => {
  const { user, symptomsResults = [] } = useContext(Context); // Ensure symptomsResults defaults to an empty array
  const [storedSymptoms, setStoredSymptoms] = useState([]); // Local state to store symptomsResults from localStorage
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort order: descending
  const [sortKey, setSortKey] = useState("symptom"); // Default sort key: symptom
  const [appointments, setAppointments] = useState([]); // Local state for appointments

  useEffect(() => {
    console.log("User data:", user); // Log the user object
    // Check if there are symptoms results in localStorage when the component mounts
    const symptomsFromLocalStorage = localStorage.getItem("symptomsResults");
    if (symptomsFromLocalStorage) {
      setStoredSymptoms(JSON.parse(symptomsFromLocalStorage));
    }
  }, []);

  // Fetch appointments for the logged-in user
  useEffect(() => {
    if (user) {
      axios
        .get(`/api/v1/appointment/my-appointments`) // Adjust the endpoint based on your API
        .then((response) => {
          console.log("API Response for Appointments:", response.data);
          setAppointments(response.data.appointments || []); // Ensure appointments default to an empty array
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
        });
    }
  }, [user]); // Fetch appointments when user changes

  // Combine the symptomsResults from context with the stored symptoms
  const displayedSymptoms = [...storedSymptoms, ...symptomsResults];

  // Function to handle sorting based on selected key and order
  const handleSort = (key) => {
    if (sortKey === key) {
      // If the same column is clicked, toggle the order (asc/desc)
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If a new column is clicked, set the new key and default to descending order
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  // Filter out the symptoms that have "N/A" or no analyzedAt value
  const filteredSymptoms = displayedSymptoms.filter(
    (symptom) => symptom.analyzedAt && symptom.analyzedAt !== "N/A"
  );

  // Sort the symptomsResults based on the sort key and order
  const sortedSymptoms = [...filteredSymptoms].sort((a, b) => {
    let valueA = a[sortKey];
    let valueB = b[sortKey];

    // If sorting by date, ensure the dates are compared correctly
    if (sortKey === "analyzedAt") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-portal">
      <div className="greeting-center">
        <h1>
          Hello, {user.firstName || "User"} {user.lastName || ""}
        </h1>
      </div>

      <div className="user-details-card">
        {/* Display user details */}
        <div className="user-details">
          <p>
            <strong>Phone:</strong> {user.phone || "N/A"}
          </p>
          <p>
            <strong>Nic:</strong> {user.nic || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "N/A"}
          </p>
        </div>
      </div>

      {/* Conditionally render the symptoms results */}
      {sortedSymptoms?.length > 0 && (
        <div className="symptoms-results">
          <h3>Analyzed Symptoms:</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Department</th>
                <th>Recommended Tests</th>
                <th>
                  Analyzed At
                  <button
                    onClick={() => handleSort("analyzedAt")}
                    className="sort-icon"
                  >
                    <span
                      className={
                        sortKey === "analyzedAt"
                          ? sortOrder === "asc"
                            ? "asc"
                            : "desc"
                          : ""
                      }
                    >
                      ↓↑
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSymptoms.map((result, index) => (
                <tr key={index}>
                  <td>{result.symptom}</td>
                  <td>{result.department || "N/A"}</td>
                  <td>
                    {result.recommended_tests?.length > 0
                      ? result.recommended_tests.join(", ")
                      : "No tests available"}
                  </td>
                  <td>{result.analyzedAt || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display Appointments */}
      <div className="appointments-results">
  <h3>Your Appointments:</h3>
  {appointments?.length > 0 ? (
    <table className="appointments-table">
      <thead>
        <tr>
          <th>Doctor</th>
          <th>Department</th>
          <th>Appointment Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appointment, index) => (
          <tr key={index}>
            <td>
              {appointment?.doctor?.firstName || appointment?.doctorId?.firstName || "N/A"}{" "}
              {appointment?.doctor?.lastName || appointment?.doctorId?.lastName || ""}
            </td>
            <td>{appointment.department || "N/A"}</td>
            <td>
              {appointment.appointment_date
                ? new Date(appointment.appointment_date).toLocaleString()
                : "N/A"}
            </td>
            <td>{appointment.status || "Pending"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No appointments to display yet.</p>
  )}
</div>

        
    
      
    </div>
  );
};

export default UserPortal;
