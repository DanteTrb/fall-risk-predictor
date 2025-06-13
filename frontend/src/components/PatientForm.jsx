import React, { useState, useEffect } from 'react';
import axios from 'axios';

const fieldLabels = {
  hr_v: 'Harmonic Ratio (Vertical)',
  '%det_v': 'Determinism % (Vertical)',
  '%det_ml': 'Determinism % (Medio-Lateral)',
  '%det_ap': 'Determinism % (Antero-Posterior)',
  weigth: 'Weight (kg)',
  age_onset: 'Age at Onset',
  duration_years: 'Disease Duration (years)',
  ledd: 'LEDD (mg/day)',
  'updrs-ii': 'UPDRS-II Score',
  'updrs-iii': 'UPDRS-III Score'
};

const PatientForm = () => {
  const [formData, setFormData] = useState({
    hr_v: '',
    '%det_v': '',
    '%det_ml': '',
    '%det_ap': '',
    weigth: '',
    age_onset: '',
    duration_years: '',
    ledd: '',
    'updrs-ii': '',
    'updrs-iii': ''
  });

  const [result, setResult] = useState(null);
  const [ranges, setRanges] = useState({});

  useEffect(() => {
    axios.get('https://fall-risk-predictor.onrender.com/api/ranges/')
      .then(res => setRanges(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post('https://fall-risk-predictor.onrender.com/api/predict/', formData);
      setResult(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const inputStyle = {
    padding: '6px',
    borderRadius: '4px',
    width: '100%'
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>

      {/* 🔷 Sticky Header con logo */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        padding: '10px 20px',
        borderBottom: '1px solid #ccc',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '30px', marginRight: '10px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Fall Risk Predictor</span>
        </div>
        <a href="#info" style={{ fontSize: '14px', color: '#007bff', textDecoration: 'none' }}>ℹ️ Info</a>
      </div>

      {/* 🧠 Titolo */}
      <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>Fall Risk Prediction</h2>

        {/* 📋 Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
            {Object.keys(formData).map((key) => (
              <div key={key} style={{ flex: '1 1 45%', minWidth: '250px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  {fieldLabels[key] || key}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={ranges[key] ? `e.g. ${ranges[key].median}` : ''}
                  title={
                    ranges[key]
                      ? `Min: ${ranges[key].min}, Q1: ${ranges[key].q1}, Median: ${ranges[key].median}, Q3: ${ranges[key].q3}, Max: ${ranges[key].max}`
                      : ''
                  }
                  step="any"
                  required
                  style={inputStyle}
                />
                {ranges[key] && (
                  <small style={{ display: 'block', marginTop: '3px', color: '#555' }}>
                    Normal range: {ranges[key].q1}–{ranges[key].q3}
                  </small>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button type="submit" style={{ padding: '12px 25px', fontWeight: 'bold', fontSize: '16px' }}>
              Predict
            </button>
          </div>
        </form>

        {/* ✅ Output */}
        {result && (
          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>📊 Result:</h3>
            <p>
              <strong>Prediction:</strong> {result.prediction === 1 ? "🟠 Fallers" : "🟢 Non Fallers"}
            </p>
            <p>
              <strong>Fall Risk Probability:</strong> {(result.probability_fallers * 100).toFixed(1)}%
            </p>
            {result.probability_fallers >= 0.88 ? (
              <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ High risk of falling!</p>
            ) : (
              <p style={{ color: 'green', fontWeight: 'bold' }}>✅ Fall risk is within a safe range.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientForm;