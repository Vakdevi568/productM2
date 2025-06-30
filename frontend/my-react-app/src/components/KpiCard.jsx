import React from 'react';
import './KpiCard.css';

const KpiCard = ({ title, value }) => {
  return (
    <div className="kpi-card">
      <h4>{title}</h4>
      <p title={value}>{value}</p>
    </div>
  );
};

export default KpiCard;

