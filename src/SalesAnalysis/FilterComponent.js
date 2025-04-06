import React from "react";
import Typography from '@mui/material/Typography';

import { FormControl, Select, MenuItem, InputLabel, Button } from "@mui/material";

const FilterComponent = ({ filters, setFilters, applyFilters }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div>
      <FormControl variant="outlined" style={{ marginRight: "10px" }}>
        <InputLabel>Gender</InputLabel>
        <Select
          name="gender"
          value={filters.gender}
          onChange={handleChange}
        >
          <MenuItem value=""><em>Any</em></MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
        </Select>
      </FormControl>

      <FormControl variant="outlined" style={{ marginRight: "10px" }}>
        <InputLabel>Age Range</InputLabel>
        <Select
          name="ageRange"
          value={filters.ageRange}
          onChange={handleChange}
        >
          <MenuItem value=""><em>Any</em></MenuItem>
          <MenuItem value="18-25">18-25</MenuItem>
          <MenuItem value="26-35">26-35</MenuItem>
          <MenuItem value="36-45">36-45</MenuItem>
          <MenuItem value="46-55">46-55</MenuItem>
          <MenuItem value="56-65">56-65</MenuItem>
          <MenuItem value="66+">66+</MenuItem>
        </Select>
      </FormControl>

      <FormControl variant="outlined" style={{ marginRight: "10px" }}>
        <InputLabel>Customer Category</InputLabel>
        <Select
          name="customerCategory"
          value={filters.customerCategory}
          onChange={handleChange}
        >
          <MenuItem value=""><em>Any</em></MenuItem>
          <MenuItem value="Seniors">Seniors</MenuItem>
          <MenuItem value="Adults">Adults</MenuItem>
          <MenuItem value="Teens">Teens</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );
};

export default FilterComponent;