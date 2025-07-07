import { useEffect, useState } from 'react';
import axios from 'axios';
import KpiCard from '../components/KpiCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FaBoxOpen, FaChartBar, FaPercent, FaCubes, FaDollarSign } from 'react-icons/fa';
import { Spin, Select, Button, InputNumber, DatePicker, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
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
    const [categoryFilter, setCategoryFilter] = useState(undefined);
    const [customDays, setCustomDays] = useState(null);
    const [customDateFilter, setCustomDateFilter] = useState([]);
    const [filters, setFilters] = useState({ category: '', start: '', end: '' });

    useEffect(() => {
        axios.get(`${API_BASE}/filters/`)
            .then(res => setCategories((res.data.categories || []).map(c => c.name || c)))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const body = {};
                if (filters.category) body.category = filters.category;
                if (filters.start) body.start = filters.start;
                if (filters.end) body.end = filters.end;

                const [kpiRes, topRes, leastRes, catRes] = await Promise.all([
                    axios.post(`${API_BASE}/kpis/`, body),
                    axios.post(`${API_BASE}/top-products/`, body),
                    axios.post(`${API_BASE}/least-sold-products/`, body),
                    axios.post(`${API_BASE}/category-comparison/`, body),
                ]);

                setKpis(kpiRes.data);
                setTopProducts(topRes.data || []);
                setLeastProducts(leastRes.data || []);
                setCategoryComparison(catRes.data || []);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters]);

    const today = new Date();
    const getDateNDaysAgo = (n) => {
        const date = new Date();
        date.setDate(date.getDate() - n);
        return date.toISOString().split('T')[0];
    };

    const handleApplyCustomDays = () => {
        if (customDays && customDays > 0) {
            const end = today.toISOString().split('T')[0];
            const start = getDateNDaysAgo(customDays);
            setFilters({ category: categoryFilter || '', start, end });
        }
    };

    const handleApplyDateFilter = () => {
        if (customDateFilter.length === 1) {
            const date = customDateFilter[0].format('YYYY-MM-DD');
            setFilters({ category: categoryFilter || '', start: date, end: date });
        } else if (customDateFilter.length === 2) {
            const start = customDateFilter[0].format('YYYY-MM-DD');
            const end = customDateFilter[1].format('YYYY-MM-DD');
            setFilters({ category: categoryFilter || '', start, end });
        }
    };

    const resetFilters = () => {
        setCategoryFilter(undefined);
        setCustomDays(null);
        setCustomDateFilter([]);
        setFilters({ category: '', start: '', end: '' });
    };

    const tooltipFormatter = (value, name) => [isNaN(value) ? 0 : value, name];

    return (
        <div className="dashboard" style={{ minHeight: '100vh', background: '#fff7e6' }}>
            <h2 className="dashboard-title">
                <FaChartBar color="#fa8c16" style={{ marginRight: 10 }} />
                Product Performance Dashboard
            </h2>

            <div className="dashboard-filters" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Select
                    placeholder="Select Category"
                    value={categoryFilter}
                    allowClear
                    style={{ width: 200 }}
                    onChange={value => {
                        setCategoryFilter(value);
                        setFilters(prev => ({ ...prev, category: value || '' }));
                    }}
                >
                    {categories.map(c => (
                        <Option key={c} value={c}>{c}</Option>
                    ))}
                </Select>

                <Space>
                    <InputNumber
                        placeholder="N days"
                        min={1}
                        value={customDays}
                        onChange={setCustomDays}
                        style={{ width: 120 }}
                    />
                    <Button onClick={handleApplyCustomDays}>Apply N Days</Button>
                </Space>

                <Space>
                    <RangePicker
                        value={customDateFilter}
                        onChange={setCustomDateFilter}
                        format="YYYY-MM-DD"
                        style={{ width: 280 }}
                    />
                    <Button onClick={handleApplyDateFilter}>Apply Date Filter</Button>
                </Space>

                <Button onClick={resetFilters}>Reset</Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 100 }}>
                    <Spin size="large" tip="Loading dashboard..." />
                </div>
            ) : (
                <>
                    <div className="kpi-container">
                        <KpiCard title="Units Sold" value={kpis.units_sold} icon={<FaCubes color="#1890ff" size={28} />} color="#f0f5ff" />
                        <KpiCard title="Revenue per SKU" value={kpis.revenue_per_sku?.toFixed(2)} icon={<FaDollarSign color="#52c41a" size={28} />} color="#e6fffb" />
                        <KpiCard title="Return %" value={kpis.return_percent ? `${kpis.return_percent.toFixed(2)}%` : '0%'} icon={<FaPercent color="#faad14" size={28} />} color="#fffbe6" />
                        <KpiCard title="Out-of-stock Count" value={kpis.out_of_stock_count} icon={<FaBoxOpen color="#f5222d" size={28} />} color="#fff1f0" />
                    </div>

                    <div className="dashboard-section">
                        <h3>Top Products by Units Sold</h3>
                        {topProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>No data available.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={Math.max(300, topProducts.length * 40)}>
                                <BarChart layout="vertical" data={topProducts}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="product_name" type="category" width={200} />
                                    <Tooltip formatter={tooltipFormatter} />
                                    <Bar dataKey="units_sold" fill="#1890ff" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="dashboard-section">
                        <h3>Least Sold Products</h3>
                        {leastProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>No data available.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={Math.max(300, leastProducts.length * 40)}>
                                <BarChart layout="vertical" data={leastProducts}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="product_name" type="category" width={200} />
                                    <Tooltip formatter={tooltipFormatter} />
                                    <Bar dataKey="units_sold" fill="#faad14" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="dashboard-section">
                        <h3>Category-wise Sales Comparison</h3>
                        {categoryComparison.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>No data available.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={categoryComparison}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category_name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total_revenue" stackId="a" fill="#ffc658" name="Revenue" />
                                    <Bar dataKey="total_units_sold" stackId="a" fill="#82ca9d" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
