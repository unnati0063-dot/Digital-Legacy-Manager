import React from 'react';

const StatCard = ({ title, count, icon, color = '#1e3a8a', bgColor = '#eff6ff', subtitle, onClick }) => {
  return (
    <div
      className="card-modern p-3 d-flex align-items-center justify-content-between"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div>
        <span className="text-muted d-block small fw-medium text-uppercase" style={{ letterSpacing: '0.04em' }}>
          {title}
        </span>
        <h3 className="fw-bold mt-1 mb-0 text-dark">{count ?? 0}</h3>
        {subtitle && <small className="text-secondary fw-semibold mt-1 d-block">{subtitle}</small>}
      </div>
      <div
        className="stat-icon-wrapper"
        style={{
          backgroundColor: bgColor,
          color: color,
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};

export default StatCard;
