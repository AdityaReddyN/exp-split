import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart, BarChart3, LineChart, TrendingUp } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import apiClient from '../utils/api';
import toast from '../utils/toast';
import './Analytics.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [group, setGroup] = useState(null);

    useEffect(() => {
        fetchAnalyticsData();
    }, [id]);

    const fetchAnalyticsData = async () => {
        try {
            const [analyticsRes, groupRes] = await Promise.all([
                apiClient.get(`/analytics/${id}`),
                apiClient.get(`/groups/${id}`)
            ]);
            setData(analyticsRes.data.data);
            setGroup(groupRes.data.data);
        } catch (error) {
            toast.error('Failed to load analytics data');
            navigate(`/groups/${id}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="text-center">
                    <div className="analytics-loading-spinner"></div>
                    <p style={{ color: 'white', marginTop: '1rem' }}>Analyzing your expenses...</p>
                </div>
            </div>
        );
    }

    // Chart Colors (Sage Green Palette)
    const colors = [
        '#93A87E', // sage-medium
        '#667558', // sage-darker
        '#A9C191', // sage-light
        '#7B8D6A', // sage-dark
        '#BFDAA4', // sage-lighter
        '#505C45', // sage-darkest
        '#D4F3B7', // sage-lightest
    ];

    const pieData = {
        labels: data.byCategory.map(c => c.category),
        datasets: [{
            data: data.byCategory.map(c => c.total),
            backgroundColor: colors,
            borderColor: 'white',
            borderWidth: 2,
        }]
    };

    const contributionData = {
        labels: data.memberContribution.map(m => m.name),
        datasets: [{
            label: 'Total Paid (₹)',
            data: data.memberContribution.map(m => m.total),
            backgroundColor: colors[0],
            borderRadius: 8,
        }]
    };

    const trendsData = {
        labels: data.trends.map(t => new Date(t.date).toLocaleDateString()),
        datasets: [{
            fill: true,
            label: 'Daily Spending (₹)',
            data: data.trends.map(t => t.total),
            borderColor: colors[0],
            backgroundColor: 'rgba(147, 168, 126, 0.2)',
            tension: 0.4,
            pointBackgroundColor: colors[0],
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: { weight: '600' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 14 },
                displayColors: true,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return (
        <div className="analytics-container">
            <div className="analytics-content">
                <div className="analytics-header">
                    <button onClick={() => navigate(`/groups/${id}`)} className="analytics-back-button">
                        <ArrowLeft size={20} />
                        <span>Back to Group</span>
                    </button>
                    <h1 className="analytics-title">Analytics: {group?.name}</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>Detailed breakdown of shared spending</p>
                </div>

                <div className="analytics-grid">
                    <div className="analytics-card">
                        <h2 className="analytics-card-title"><PieChart size={20} /> Expenses by Category</h2>
                        <div className="analytics-card-content">
                            <Pie data={pieData} options={options} />
                        </div>
                    </div>

                    <div className="analytics-card">
                        <h2 className="analytics-card-title"><BarChart3 size={20} /> Member Contribution</h2>
                        <div className="analytics-card-content">
                            <Bar data={contributionData} options={options} />
                        </div>
                    </div>

                    <div className="analytics-card analytics-card--full">
                        <h2 className="analytics-card-title"><LineChart size={20} /> Spending Trends (Last 30 Days)</h2>
                        <div className="analytics-card-content">
                            <Line data={trendsData} options={options} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
