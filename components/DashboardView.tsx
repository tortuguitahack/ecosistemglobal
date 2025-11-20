
import React from 'react';
import StatsCard from './StatsCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useData } from '../hooks/useData';

const DashboardView: React.FC = () => {
    const { systems, isLoading } = useData();

    if (isLoading) {
        return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-4xl text-indigo-400"></i></div>;
    }

    const totalRevenue = systems.reduce((acc, system) => acc + system.revenue, 0);
    const activeSystems = systems.filter(s => s.status === 'active').length;
    const totalConversions = systems.reduce((acc, system) => acc + system.conversions, 0);
    const averageROI = systems.length > 0 ? systems.reduce((acc, system) => acc + system.roi, 0) / systems.length : 0;

    const categoryData = systems.reduce((acc, system) => {
        const categoryName = system.category.charAt(0).toUpperCase() + system.category.slice(1);
        if (!acc[categoryName]) {
            acc[categoryName] = { name: categoryName, value: 0 };
        }
        acc[categoryName].value += system.revenue;
        return acc;
    }, {} as { [key: string]: { name: string, value: number } });

    const pieChartData = Object.values(categoryData);
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#a4de6c', '#d0ed57', '#ff7300'];

    const topSystems = [...systems].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Ingresos Totales" value={`$${totalRevenue.toLocaleString()}`} icon="fa-dollar-sign" trend="+12.5%" trendDirection="up" />
                <StatsCard title="Sistemas Activos" value={`${activeSystems} / ${systems.length}`} icon="fa-cogs" trend="+2 esta semana" trendDirection="up" />
                <StatsCard title="Conversiones Totales" value={totalConversions.toLocaleString()} icon="fa-check-circle" trend="-1.2%" trendDirection="down" />
                <StatsCard title="ROI Promedio" value={`${averageROI.toFixed(1)}%`} icon="fa-chart-line" trend="+5%" trendDirection="up" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4">Sistemas más Rentables</h3>
                     <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topSystems} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} formatter={(value) => `$${Number(value).toLocaleString()}`} />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4">Ingresos por Categoría</h3>
                    <ResponsiveContainer width="100%" height={400}>
                         <PieChart>
                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false}>
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} formatter={(value) => `$${Number(value).toLocaleString()}`} />
                             <Legend wrapperStyle={{fontSize: "12px"}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
