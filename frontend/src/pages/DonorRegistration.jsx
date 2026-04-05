import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDonor } from '../services/api';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  pan: '',
  aadhaar: '',
};

export default function DonorRegistration() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError('Email Address is required to register a donor.');
      return;
    }
    
    setError('');
    setLoading(true);
    setSuccess(false);
    
    try {
      await addDonor({
        fullName: form.fullName,
        email: form.email,
        mobile: form.phone,
        address: form.address,
        pan: form.pan,
        aadhaar: form.aadhaar,
      });
      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to register donor. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Register New Donor</h2>
        <p>Add a new donor to the database with their identity details to enable invoice generation.</p>
      </div>

      <div className="card">
        {success ? (
          <div className="success-box" style={{ marginTop: 0, marginBottom: '24px' }}>
            <h3>🎉 Donor Registered Successfully!</h3>
            <p>The donor can now be looked up by email on the Donation Entry page.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn-success" onClick={() => navigate('/donate')}>
                → Go to Donation Entry
              </button>
              <button className="btn-secondary" onClick={() => setSuccess(false)}>
                + Register Another Donor
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* ── Row 1: Name & Email ── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="donor@example.com"
                  required
                />
              </div>
            </div>

            {/* ── Row 2: Phone & Address ── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Residential / Billing Address</label>
                <input
                  className="form-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full address (optional)"
                />
              </div>
            </div>

            {/* ── Row 3: PAN & Aadhaar ── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  className="form-input"
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="10-character PAN (optional)"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input
                  className="form-input"
                  name="aadhaar"
                  value={form.aadhaar}
                  onChange={handleChange}
                  placeholder="12-digit Aadhaar (optional)"
                />
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Registering Donor…' : 'Save Donor Details'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
