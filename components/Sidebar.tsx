
import React from 'react';
import { View } from '../types';

interface NavItemProps {
  view: View;
  currentView: View;
  setView: (view: View) => void;
  icon: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ view, currentView, setView, icon, label }) => {
  const isActive = currentView === view;
  return (
    <div
      onClick={() => setView(view)}
      className={`flex items-center px-6 py-3 cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 border-l-4 ${isActive ? 'bg-gray-700 border-indigo-500 text-white' : 'border-transparent'}`}
    >
      <i className={`fas ${icon} w-6 text-center text-lg mr-4 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`}></i>
      <span className="font-medium">{label}</span>
    </div>
  );
};

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
    const navItems = [
        { view: View.Dashboard, icon: 'fa-chart-line', label: 'Dashboard' },
        { view: View.AllSystems, icon: 'fa-cogs', label: 'All Systems' },
        { view: View.Marketing, icon: 'fa-bullhorn', label: 'Marketing' },
        { view: View.Ecommerce, icon: 'fa-shopping-cart', label: 'E-commerce' },
        { view: View.Social, icon: 'fa-share-alt', label: 'Social Media' },
        { view: View.Productivity, icon: 'fa-tasks', label: 'Productivity' },
        { view: View.Education, icon: 'fa-graduation-cap', label: 'Education' },
        { view: View.Finance, icon: 'fa-dollar-sign', label: 'Finance' },
        { view: View.HR, icon: 'fa-users', label: 'RRHH' },
        { view: View.Support, icon: 'fa-headset', label: 'Support' },
        { view: View.Analytics, icon: 'fa-chart-bar', label: 'Analytics' },
        { view: View.Integrations, icon: 'fa-plug', label: 'Integrations' },
    ];

    return (
        <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-2xl z-30 hidden lg:block">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white tracking-wider">
            <i className="fas fa-robot text-indigo-400"></i> n8n Revenue Pro
            </h1>
        </div>
        <nav className="mt-4">
            {navItems.map(item => (
                <NavItem key={item.view} {...item} currentView={currentView} setView={setView} />
            ))}
        </nav>
        </aside>
    );
};

export default Sidebar;
