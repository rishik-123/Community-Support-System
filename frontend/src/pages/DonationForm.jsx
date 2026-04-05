import { useState, useCallback } from 'react';
import { searchDonor, addDonation, downloadReceiptUrl } from '../services/api';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  purpose: '',
  mode: 'Cash',
};

export default function DonationForm() {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [lookup, setLookup]     = useState({ status: 'idle', message: '' }); // idle | found | notfound
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [receipt, setReceipt]   = useState(null); // { receiptNo }

  /* ── Field change ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'email') setLookup({ status: 'idle', message: '' });
  };

  /* ── Donor lookup on blur of email ── */
  const handleLookup = useCallback(async (query) => {
    if (!query || query.trim().length < 5 || !query.includes('@')) return;
    try {
      const res = await searchDonor(query.trim());
      const donor = res.data;
      if (donor && donor.email) {
        setForm(f => ({
          ...f,
          fullName: donor.fullName || f.fullName,
          phone: donor.mobile || f.phone,
        }));
        setLookup({ status: 'found', message: `✓ Donor found: ${donor.fullName}` });
      } else {
        setLookup({ status: 'notfound', message: '⚠️ Donor not found! Please register this donor first.' });
      }
    } catch {
      setLookup({ status: 'notfound', message: '⚠️ Donor not found! Please register this donor first.' });
    }
  }, []);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await addDonation({
        fullName: form.fullName,
        email:    form.email,
        phone:    form.phone,
        amount:   Number(form.amount),
        mode:     form.mode,
        purpose:  form.purpose,
        date:     form.date,
      });
      setReceipt({ receiptNo: res.data.receiptNo });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to generate invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── New donation ── */
  const handleReset = () => {
    setForm(EMPTY_FORM);
    setReceipt(null);
    setLookup({ status: 'idle', message: '' });
    setError('');
  };

  return (
    <div>
      <div className="page-header">
        <h2>New Donation Entry</h2>
        <p>Enter the donor's email to fetch their details. Donors must be registered first.</p>
      </div>

      {/* ── Success state ── */}
      {receipt ? (
        <div className="card">
          <div className="success-box">
            <h3>🎉 Invoice Generated Successfully!</h3>
            <p>
              Receipt No: <strong>{receipt.receiptNo}</strong><br />
              A copy has been sent to the donor's email address.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                className="btn-success"
                href={downloadReceiptUrl(receipt.receiptNo)}
                download
                target="_blank"
                rel="noreferrer"
              >
                ⬇ Download Invoice PDF
              </a>
              <button className="btn-secondary" onClick={handleReset}>
                + New Donation
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit}>

            {/* ── Row 1: Email & Name ── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={e => e.target.value && handleLookup(e.target.value)}
                  placeholder="donor@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Auto-filled if donor exists"
                  required
                />
              </div>
            </div>

            {/* Lookup badge */}
            {lookup.status !== 'idle' && (
              <div className={`lookup-badge ${lookup.status === 'found' ? 'lookup-found' : 'lookup-new'}`}>
                {lookup.message}
              </div>
            )}

            {/* ── Row 2: Phone & Amount ── */}
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
                <label className="form-label">Donation Amount (₹) *</label>
                <input
                  className="form-input"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* ── Row 3: Date & Purpose ── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  className="form-input"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input
                  className="form-input"
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="e.g. Education Fund, General"
                />
              </div>
            </div>

            {/* ── Payment Mode ── */}
            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <div className="radio-group">
                {['Cash', 'Online'].map(m => (
                  <label key={m} className="radio-option">
                    <input
                      type="radio"
                      name="mode"
                      value={m}
                      checked={form.mode === m}
                      onChange={handleChange}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="btn-primary" type="submit" disabled={submitting || lookup.status !== 'found' || !form.email}>
              {submitting ? 'Generating Invoice…' : '🧾 Generate Invoice & Send Receipt'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
