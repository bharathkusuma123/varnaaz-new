import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebase';
import Swal from 'sweetalert2';
import './EmployeeRegistration.css';

const EmployeeRegistration = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: ''
    });
    const [showPassword, setShowPassword] = useState(false);

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

            // Save user data in Firestore with UID as doc ID
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                createdAt: serverTimestamp()
            });

            Swal.fire({
                title: 'Success!',
                text: 'Admin registered successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            setFormData({
                fullName: '',
                email: '',
                password: '',
                phone: '',
                role: 'admin'
            });

        } catch (error) {
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-card shadow-lg">
                <div className="text-center mb-3">
                    <div className="navbar-logo d-inline-flex align-items-center">
                        <i className="fas fa-anchor text-primary me-2"></i>
                        <span className="navbar-brand mb-0">Varnaz</span>
                    </div>
                </div>

                <h5 className="dashboard-title mb-4 text-center">Register New Employee</h5>

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

                    <div className="form-group mb-3">
                        <label htmlFor="role" className="form-label">Role:</label>
                        <select
                            id="role"
                            name="role"
                            className="form-input"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="employer">Employee</option>
                        </select>
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
                        <span className="position-absolute eye-icon" onClick={togglePasswordVisibility}>
                            {showPassword ? '🙈' : '👁'}
                        </span>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                        <button type="submit" className="btn submit-btn">Register Employee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeRegistration;
