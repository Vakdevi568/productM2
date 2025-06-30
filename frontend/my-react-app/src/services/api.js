import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchKPIs = async () => {
  const res = await axios.get(`${API_BASE}/kpis/`);
  return res.data;
};

export const fetchTopProducts = async () => {
  const res = await axios.get(`${API_BASE}/top-products/`);
  return res.data;
};

export const fetchLeastSoldProducts = async () => {
  const res = await axios.get(`${API_BASE}/least-sold/`);
  return res.data;
};

export const fetchMostReturnedProducts = async () => {
  const res = await axios.get(`${API_BASE}/most-returned/`);
  return res.data;
};

export const fetchOutOfStockProducts = async () => {
  const res = await axios.get(`${API_BASE}/out-of-stock/`);
  return res.data;
};

export const fetchCategoryComparison = async () => {
  const res = await axios.get(`${API_BASE}/category-comparison/`);
  return res.data;
};

