import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebase';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './AdminRegistrationForm.css';

const AdminRegistrationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Get the superadmin UID passed from SuperadminDashboard
    const { superadminUid } = location.state || {};
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'admin'
    });
    const [showPassword, setShowPassword] = useState(false);

    console.log("Superadmin UID received:", superadminUid); // Verify in console

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Prepare admin data with superadmin UID
            const adminData = {
                uid: user.uid,
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role,
                superadmin_uid: superadminUid, // Store superadmin UID here
                createdAt: serverTimestamp()
            };

            console.log("Saving admin data:", adminData);

            // Save user data in Firestore with UID as doc ID
            await setDoc(doc(db, 'users', user.uid), adminData);

            Swal.fire({
                title: 'Success!',
                text: 'Admin registered successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Navigate back to superadmin dashboard with the superadminUid
                navigate('/superadmindashboard', { state: { uid: superadminUid } });
            });

            // Reset form
            setFormData({
                fullName: '',
                email: '',
                password: '',
                phone: '',
                role: 'admin'
            });

        } catch (error) {
            console.error("Registration error:", error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleBack = () => {
        navigate('/superadmindashboard', { state: { uid: superadminUid } });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-card shadow-lg">
                <div className="text-center mb-3">
                    <div className="navbar-logo d-inline-flex align-items-center">
                        <i className="fas fa-anchor text-primary me-2"></i>
                        <span className="navbar-brand mb-0">Varnaz</span>
                    </div>
                </div>

                <h5 className="dashboard-title mb-4 text-center">Register New Admin</h5>

                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label htmlFor="fullName" className="form-label">Full Name:</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className="form-input"
                            placeholder="Enter full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label htmlFor="role" className="form-label">Role:</label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            className="form-input"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            readOnly
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label htmlFor="phone" className="form-label">Phone:</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-input"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group mb-4 position-relative">
                        <label htmlFor="password" className="form-label">Password:</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span 
                            className="position-absolute eye-icon" 
                            onClick={togglePasswordVisibility}
                            style={{ cursor: 'pointer' }}
                        >
                            {showPassword ? '🙈' : '👁'}
                        </span>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                        <button type="button" className="btn btn-secondary" onClick={handleBack}>
                            Back to Dashboard
                        </button>
                        <button type="submit" className="btn submit-btn">Register Admin</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRegistrationForm;