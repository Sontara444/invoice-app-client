import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, FileText, CheckCircle, Clock,
    ArrowUpRight, ArrowDownRight, TrendingUp,
    Plus, Calendar, Search, Bell
} from 'lucide-react';
import { getAllInvoices } from '../services/invoiceApi';
import { formatCurrency } from '../utils/formatters';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-sidebar p-6 rounded-2xl border border-border">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-success-bg text-success' : 'bg-red-50 text-red-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}
                </div>
            )}
        </div>
        <div>
            <p className="text-xs font-semibold text-text-label uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-black text-text-main">{value}</p>
        </div>
    </div>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0,
        paidCount: 0,
        totalCount: 0
    });

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await getAllInvoices();
                setInvoices(data);

                // Calculate Stats
                const revenue = data.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
                const pending = data.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
                const paid = data.filter(inv => inv.status === 'PAID').length;

                setStats({
                    totalRevenue: revenue,
                    pendingAmount: pending,
                    paidCount: paid,
                    totalCount: data.length
                });
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const recentInvoices = invoices.slice(0, 5);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-text-muted text-sm mt-4 animate-pulse">Loading dashboard...</p>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-8 py-4 bg-sidebar border-b border-border sticky top-0 z-10">
                <div className="flex items-center gap-3 bg-background rounded-xl px-4 py-2 w-64">
                    <Search size={16} className="text-text-label" />
                    <input
                        type="text"
                        placeholder="Search stats..."
                        className="bg-transparent text-sm text-text-main placeholder:text-text-label outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-xl hover:bg-background text-text-muted transition-colors">
                        <Bell size={18} />
                    </button>
                    <button
                        onClick={() => navigate('/invoices/new')}
                        className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-colors"
                    >
                        <Plus size={16} /> New Invoice
                    </button>
                </div>
            </header>

            <div className="flex-1 p-8 space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-text-main tracking-tight">Financial Overview</h1>
                    <p className="text-text-muted text-sm">Welcome back! Here's what's happening with your business today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={TrendingUp}
                        color="bg-primary"
                        trend="up"
                        trendValue="+12.5%"
                    />
                    <StatCard
                        title="Pending Amount"
                        value={formatCurrency(stats.pendingAmount)}
                        icon={Clock}
                        color="bg-amber-500"
                    />
                    <StatCard
                        title="Paid Invoices"
                        value={stats.paidCount}
                        icon={CheckCircle}
                        color="bg-emerald-500"
                        trend="up"
                        trendValue="+4"
                    />
                    <StatCard
                        title="Total Invoices"
                        value={stats.totalCount}
                        icon={FileText}
                        color="bg-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Invoices */}
                    <div className="bg-sidebar rounded-2xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-base font-bold text-text-main">Recent Invoices</h2>
                            <button onClick={() => navigate('/')} className="text-xs font-bold text-primary hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-border">
                            {recentInvoices.map((inv) => (
                                <div key={inv._id} className="p-4 flex items-center justify-between hover:bg-background transition-colors cursor-pointer" onClick={() => navigate(`/invoices/${inv._id}`)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border text-primary font-bold">
                                            {inv.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main">{inv.customerName}</p>
                                            <p className="text-xs text-text-muted">{inv.invoiceNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-text-main">{formatCurrency(inv.total)}</p>
                                        <p className="text-xs text-text-muted">{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            ))}
                            {recentInvoices.length === 0 && (
                                <div className="p-12 text-center text-text-muted text-sm italic">
                                    No invoices created yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions / Chart Placeholder */}
                    <div className="space-y-6">
                        <div className="bg-sidebar rounded-2xl border border-border p-6 h-full flex flex-col justify-center items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary">
                                <TrendingUp size={32} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-main">Grow your business</h2>
                                <p className="text-sm text-text-muted max-w-xs mx-auto">Create and send professional invoices in seconds to get paid faster.</p>
                            </div>
                            <button
                                onClick={() => navigate('/invoices/new')}
                                className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-hover transition-all flex items-center gap-2 group"
                            >
                                <Plus size={20} />
                                Create New Invoice
                                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
