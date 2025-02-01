import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main"; 
import axios from "axios"; 

const UserPortal = () => {
  const { user, symptomsResults = [] } = useContext(Context);
  const [storedSymptoms, setStoredSymptoms] = useState([]); 
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortKey, setSortKey] = useState("symptom"); 
  const [appointments, setAppointments] = useState([]); 

  useEffect(() => {
    console.log("User data:", user); 
    
    const symptomsFromLocalStorage = localStorage.getItem("symptomsResults");
    if (symptomsFromLocalStorage) {
      setStoredSymptoms(JSON.parse(symptomsFromLocalStorage));
    }
  }, []);

  
  useEffect(() => {
    if (user) {
      axios
        .get(`/api/v1/appointment/my-appointments`)
        .then((response) => {
          console.log("API Response for Appointments:", response.data);
          setAppointments(response.data.appointments || []); 
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
        });
    }
  }, [user]); 

 
  const displayedSymptoms = [...storedSymptoms, ...symptomsResults];

  
  const handleSort = (key) => {
    if (sortKey === key) {
      
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  
  const filteredSymptoms = displayedSymptoms.filter(
    (symptom) => symptom.analyzedAt && symptom.analyzedAt !== "N/A"
  );

  
  const sortedSymptoms = [...filteredSymptoms].sort((a, b) => {
    let valueA = a[sortKey];
    let valueB = b[sortKey];

   
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
