import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../src/firebase/firebase"; // Adjust path as needed

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Step 1: Sign in using Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Get user data from Firestore using UID
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const userRole = (userData.role || "").toLowerCase(); // Case-insensitive

      Swal.fire({
        title: "Success!",
        text: "Login successful!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        switch (userRole) {
          case "superadmin":
            navigate("/superadmindashboard");
            break;
          case "admin":
            navigate("/admindashboard");
            break;
          case "manager":
            navigate("/managerdashboard");
            break;
          case "employer":
            navigate("/employedashboard");
            break;
          default:
            Swal.fire({
              title: "Access Denied",
              text: "You are not authorized to access this portal",
              icon: "error",
              confirmButtonText: "OK",
            });
        }
      });
    } else {
      throw new Error("User data not found in Firestore.");
    }
  } catch (error) {
    Swal.fire({
      title: "Login Failed",
      text: error.message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};


  return (
    <div className="login-container">
      <div className="login-card shadow-lg" style={{ width: "610px", maxWidth: "1000px" }}>
        <div className="text-center mb-3">
          <div className="navbar-logo d-inline-flex align-items-center">
            <i className="fas fa-anchor text-primary me-2"></i>
            <span className="navbar-brand mb-0">Varnaz</span>
          </div>
        </div>

        <h5 className="login-title mb-4 text-center">Login</h5>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group mb-3">
            <label htmlFor="email" className="login-label">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="login-input form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group mb-4 position-relative">
            <label htmlFor="password" className="login-label">
              Password:
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="login-input form-control pe-5"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="position-absolute login-eye-icon"
              style={{
                fontSize: "1.5rem",
                right: "15px",
                top: "51px",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button type="submit" className="btn login-submit-btn">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
