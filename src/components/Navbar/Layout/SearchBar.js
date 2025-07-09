import React from 'react';

const SearchBar = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    className="form-control mb-3"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

export default SearchBar;
