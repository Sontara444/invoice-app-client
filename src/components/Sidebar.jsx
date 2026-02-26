import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, ArrowLeftRight, Wallet, FileText, BarChart2,
    Settings, HelpCircle
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '#' },
    { label: 'Transactions', icon: ArrowLeftRight, to: '#' },
    { label: 'My Wallet', icon: Wallet, to: '#' },
    { label: 'Invoices', icon: FileText, to: '/' },
    { label: 'Reports', icon: BarChart2, to: '#' },
];

const prefItems = [
    { label: 'Settings', icon: Settings, to: '#' },
    { label: 'Help Center', icon: HelpCircle, to: '#' },
];

const NavItem = ({ item, active }) => (
    <Link
        to={item.to}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
            ${active
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:bg-border-light hover:text-text-main'
            }`}
    >
        <item.icon size={18} className={active ? 'text-white' : 'text-text-label group-hover:text-text-muted'} />
        {item.label}
    </Link>
);

const Sidebar = () => {
    const { pathname } = useLocation();

    const isActive = (to) => {
        if (to === '/') return pathname === '/' || pathname.startsWith('/invoices');
        return pathname === to;
    };

    return (
        <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col bg-sidebar border-r border-border overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rotate-45 rounded-sm"></div>
                </div>
                <span className="font-bold text-lg text-text-main tracking-tight">Monefy</span>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-text-muted">U</div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-main truncate">Uxerflow</p>
                    <p className="text-xs text-text-muted truncate">Business Account</p>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 p-3 space-y-1">
                <p className="px-4 py-2 text-xs font-semibold text-text-label uppercase tracking-wider">Main Menu</p>
                {navItems.map((item) => (
                    <NavItem key={item.label} item={item} active={isActive(item.to)} />
                ))}

                <p className="px-4 py-2 mt-4 text-xs font-semibold text-text-label uppercase tracking-wider">Preference</p>
                {prefItems.map((item) => (
                    <NavItem key={item.label} item={item} active={false} />
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
