import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, PieChart, Shield, Users } from 'lucide-react';
import authUtils from '../utils/auth';
import './Landing.css';

export default function Landing() {
    const navigate = useNavigate();
    const isAuthenticated = authUtils.isAuthenticated();

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className="landing-nav glass-card">
                <div className="nav-logo">
                    <PieChart className="logo-icon" size={28} />
                    <span className="logo-text">XPenseFlow</span>
                </div>
                <div className="nav-actions">
                    {isAuthenticated ? (
                        <button onClick={() => navigate('/dashboard')} className="btn-primary">
                            Go to Dashboard
                        </button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="btn-ghost">
                                Login
                            </button>
                            <button onClick={() => navigate('/register')} className="btn-primary">
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-content animate-fade-in">
                    <h1 className="hero-title">
                        Effortless Group<br />
                        <span className="text-gradient">Budgeting & Expenses.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Keep your group finances in check. Track shared budgets, split bills, and settle debts seamlessly with XPenseFlow.
                    </p>
                    <div className="hero-cta-wrapper">
                        <button onClick={handleGetStarted} className="btn-hero">
                            Start Budgeting Now <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="features-section">
                <h2 className="section-title">Why use XPenseFlow?</h2>
                <div className="features-grid">
                    <div className="feature-card glass-card">
                        <div className="feature-icon icon-users">
                            <Users size={32} />
                        </div>
                        <h3>Group Expenses</h3>
                        <p>Create groups for trips, housemates, or projects. Add members and start tracking instantly.</p>
                    </div>

                    <div className="feature-card glass-card">
                        <div className="feature-icon icon-chart">
                            <PieChart size={32} />
                        </div>
                        <h3>Smart Splitting</h3>
                        <p>Split equally, by percentage, or exact amounts. We handle the math for you.</p>
                    </div>

                    <div className="feature-card glass-card">
                        <div className="feature-icon icon-shield">
                            <Shield size={32} />
                        </div>
                        <h3>Secure Payments</h3>
                        <p>Integrated payment gateways allow you to settle up debts directly within the app.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <PieChart size={24} />
                        <span>XPenseFlow</span>
                    </div>
                    <p className="copyright">© 2024 XPenseFlow. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
