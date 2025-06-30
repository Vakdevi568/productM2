// ✅ Updated Dashboard.jsx with POST request (filters sent in body)

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KpiCard from '../components/KpiCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FaBoxOpen, FaChartBar, FaPercent, FaCubes, FaDollarSign } from 'react-icons/fa';
import { Spin, Select, DatePicker } from 'antd';
import './Dashboard.css';

const { Option } = Select;
const { RangePicker } = DatePicker;
const API_BASE = 'http://localhost:8000/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({});
    const [topProducts, setTopProducts] = useState([]);
    const [leastProducts, setLeastProducts] = useState([]);
    const [categoryComparison, setCategoryComparison] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        time: []
    });
    const [activeChart, setActiveChart] = useState('top'); // 'top', 'least', 'category'

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await axios.get(`${API_BASE}/filters/`);
                const catList = Array.isArray(res.data) ? res.data : res.data.categories || [];
                setCategories(catList.map(c => c.name));
            } catch (err) {
                console.warn('Error fetching filters', err);
                setCategories([]);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const body = {};
                if (filters.category) body.category = filters.category;
                if (filters.time[0] && filters.time[1]) {
                    body.start = filters.time[0];
                    body.end = filters.time[1];
                }

                const [kpiRes, topRes, leastRes, catRes] = await Promise.all([
                    axios.post(`${API_BASE}/kpis/`, body),
                    axios.post(`${API_BASE}/top-products/`, body),
                    axios.post(`${API_BASE}/least-sold-products/`, body),
                    axios.post(`${API_BASE}/category-comparison/`, body)
                ]);

                setKpis(kpiRes.data);
                setTopProducts(topRes.data || []);
                setLeastProducts(leastRes.data || []);
                setCategoryComparison(catRes.data || []);
            } catch (error) {
                console.error('Error loading dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleShowAll = () => {
        setActiveChart('all');
    };

    const tooltipFormatter = (value, name) => {
        return [isNaN(value) ? 0 : value, name];
    };

    return (
        <div
            className="dashboard"
            style={{
                minHeight: '100vh',
                background: '#fff7e6' // orange-tinted background
            }}
        >
            <h2 className="dashboard-title">
                <FaChartBar color="#fa8c16" style={{ marginRight: 10 }} />
                Product Performance Dashboard
            </h2>

            <div className="dashboard-filters">
                <Select
                    placeholder="Category"
                    allowClear
                    style={{ width: 160 }}
                    onChange={v => handleFilterChange('category', v)}
                >
                    {categories.map(c => (
                        <Option key={c} value={c}>{c}</Option>
                    ))}
                </Select>

                <RangePicker
                    style={{ marginLeft: 10 }}
                    onChange={dates =>
                        handleFilterChange('time', dates ? [dates[0]?.format('YYYY-MM-DD'), dates[1]?.format('YYYY-MM-DD')] : [])
                    }
                />
            </div>

            {/* Chart selection buttons */}
            <div style={{ margin: '20px 0' }}>
                <button
                    onClick={() => setActiveChart('top')}
                    style={{ marginRight: 10, background: activeChart === 'top' ? '#1890ff' : '#f0f0f0', color: activeChart === 'top' ? '#fff' : '#000', border: 'none', padding: '8px 16px', borderRadius: 4 }}
                >
                    Top Sold
                </button>
                <button
                    onClick={() => setActiveChart('least')}
                    style={{ marginRight: 10, background: activeChart === 'least' ? '#faad14' : '#f0f0f0', color: activeChart === 'least' ? '#fff' : '#000', border: 'none', padding: '8px 16px', borderRadius: 4 }}
                >
                    Least Sold
                </button>
                <button
                    onClick={() => setActiveChart('category')}
                    style={{ marginRight: 10, background: activeChart === 'category' ? '#52c41a' : '#f0f0f0', color: activeChart === 'category' ? '#fff' : '#000', border: 'none', padding: '8px 16px', borderRadius: 4 }}
                >
                    Category-wise Comparison
                </button>
                <button
                    onClick={handleShowAll}
                    style={{ background: activeChart === 'all' ? '#722ed1' : '#f0f0f0', color: activeChart === 'all' ? '#fff' : '#000', border: 'none', padding: '8px 16px', borderRadius: 4 }}
                >
                    Complete Analysis
                </button>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <Spin size="large" tip="Loading dashboard..." />
                </div>
            ) : (
                <>
                    <div className="kpi-container">
                        <KpiCard
                            title="Units Sold"
                            value={kpis.units_sold}
                            icon={<FaCubes color="#1890ff" size={28} />}
                            color="#f0f5ff"
                        />
                        <KpiCard
                            title="Revenue per SKU"
                            value={kpis.revenue_per_sku?.toFixed(2)}
                            icon={<FaDollarSign color="#52c41a" size={28} />}
                            color="#e6fffb"
                        />
                        <KpiCard
                            title="Return %"
                            value={kpis.return_percent ? `${kpis.return_percent.toFixed(2)}%` : '0%'}
                            icon={<FaPercent color="#faad14" size={28} />}
                            color="#fffbe6"
                        />
                        <KpiCard
                            title="Out-of-stock Count"
                            value={kpis.out_of_stock_count}
                            icon={<FaBoxOpen color="#f5222d" size={28} />}
                            color="#fff1f0"
                        />
                    </div>

                    {(activeChart === 'top' || activeChart === 'all') && (
                        <div className="dashboard-section" style={{ borderRadius: 12, padding: 24, background: '#fff7e6' }}>
                            <h3 style={{ color: '#fa8c16' }}>Top 10 Products by Units Sold</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={topProducts.slice(0, 10)} margin={{ left: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="product_name" type="category" width={180} />
                                    <Tooltip formatter={tooltipFormatter} contentStyle={{ backgroundColor: '#1890ff', color: '#fff', borderRadius: 8 }} />
                                    <Bar dataKey="units_sold" fill="url(#colorTop)" name="Units Sold" />
                                    <defs>
                                        <linearGradient id="colorTop" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#1890ff" />
                                            <stop offset="100%" stopColor="#52c41a" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {(activeChart === 'least' || activeChart === 'all') && (
                        <div className="dashboard-section" style={{ borderRadius: 12, padding: 24, background: '#fff7e6' }}>
                            <h3 style={{ color: '#fa8c16' }}>Least Sold Products</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={leastProducts.slice(0, 10)} margin={{ left: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="product_name" type="category" width={180} />
                                    <Tooltip formatter={tooltipFormatter} contentStyle={{ backgroundColor: '#faad14', color: '#fff', borderRadius: 8 }} />
                                    <Bar dataKey="units_sold" fill="url(#colorLeast)" name="Units Sold" />
                                    <defs>
                                        <linearGradient id="colorLeast" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#faad14" />
                                            <stop offset="100%" stopColor="#f5222d" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {(activeChart === 'category' || activeChart === 'all') && (
                        <div className="dashboard-section" style={{ borderRadius: 12, padding: 24, background: '#fff7e6' }}>
                            <h3 style={{ color: '#fa8c16' }}>Category-wise Sales Comparison</h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={categoryComparison} margin={{ left: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category_name" angle={-30} textAnchor="end" interval={0} height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total_revenue" stackId="a" fill="#ffc658" name="Revenue" />
                                    <Bar dataKey="total_units_sold" stackId="a" fill="#82ca9d" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
