// FilterModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const FilterModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    date: '',
    productType: '',
    productSubtype: '',
    customerCategory: '',
    customerGender: '',
    ageRange: '',
    country: '',
    region: '',
    salesAmount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = () => {
    onApplyFilters(filters); // Aplică filtrele și trimite-le înapoi
    onClose(); // Închide modalul
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        content: {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          padding: '20px',
          borderRadius: '10px',
        },
      }}
    >
      <h2>Select Filters</h2>
      <div>
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
        />
      </div>
      {/* Altele filtre */}
      <button onClick={handleSubmit}>Apply Filters</button>
      <button onClick={onClose}>Cancel</button>
    </Modal>
  );
};

export default FilterModal; // Asigură-te că este exportat corect
