import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Helper Icon Components (Memoized for performance) ---
const SortIcon = React.memo(({ className }) => (<svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path></svg>));
const SortUpIcon = React.memo(() => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path></svg>));
const SortDownIcon = React.memo(() => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path></svg>));

// --- Child Components for better structure and performance ---

const StatCard = React.memo(({ title, value, colorClass }) => (
    <div className="bg-card p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
));

const Statistics = ({ summary }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registrations" value={summary.total} colorClass="text-foreground" />
        <StatCard title="Pending" value={summary.pending} colorClass="text-yellow-500" />
        <StatCard title="Approved" value={summary.approved} colorClass="text-green-500" />
        <StatCard title="Checked-In" value={summary.checkedIn} colorClass="text-blue-500" />
    </div>
);

const FilterPanel = ({ filters, onFilterChange, selectedCount, onBulkAction, onSearch }) => (
    <div className="bg-card p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input 
                type="text" 
                placeholder="Search by name or roll no..."
                onChange={onSearch}
                className="bg-background border border-input p-2 rounded-md lg:col-span-1"
            />
            <select name="year" value={filters.year} onChange={onFilterChange} className="bg-background border border-input p-2 rounded-md"><option value="">All Years</option>{[1, 2, 3].map(y => <option key={y} value={y}>Year {y}</option>)}</select>
            <select name="section" value={filters.section} onChange={onFilterChange} className="bg-background border border-input p-2 rounded-md"><option value="">All Sections</option>{['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(s => <option key={s} value={s}>{s}</option>)}</select>
            <select name="status" value={filters.status} onChange={onFilterChange} className="bg-background border border-input p-2 rounded-md"><option value="all">All Statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="checkedIn">Checked-In</option></select>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
            <button onClick={() => onBulkAction('approve')} disabled={selectedCount === 0} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md font-semibold disabled:opacity-50">Approve ({selectedCount})</button>
            <button onClick={() => onBulkAction('reject')} disabled={selectedCount === 0} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md font-semibold disabled:opacity-50">Reject ({selectedCount})</button>
        </div>
    </div>
);

const SortableHeader = React.memo(({ children, name, sortConfig, onSort }) => {
    const isSorted = sortConfig.key === name;
    const direction = isSorted ? sortConfig.direction : 'none';
    return (
        <th className="p-4 cursor-pointer hover:bg-muted whitespace-nowrap" onClick={() => onSort(name)}>
            <div className="flex items-center gap-2">{children}{isSorted ? (direction === 'ascending' ? <SortUpIcon /> : <SortDownIcon />) : <SortIcon className="text-muted-foreground/50" />}</div>
        </th>
    );
});

const RegistrationRow = React.memo(({ reg, isSelected, onSelect, onAction }) => (
    <tr className={`border-b hover:bg-muted ${isSelected ? 'bg-primary/10' : ''}`}>
        <td className="p-4"><input type="checkbox" checked={isSelected} onChange={() => onSelect(reg._id)} /></td>
        <td className="p-4 font-medium whitespace-nowrap">{reg.name}</td>
        <td className="p-4 font-mono whitespace-nowrap">{reg.rollNo}</td>
        <td className="p-4 whitespace-nowrap">{reg.year} / {reg.section}</td>
        <td className="p-4 whitespace-nowrap">{reg.mobile}</td>
        <td className="p-4 text-muted-foreground whitespace-nowrap">{new Date(reg.registeredAt).toLocaleString()}</td>
        <td className="p-4 text-muted-foreground whitespace-nowrap">{reg.attended ? new Date(reg.attendedAt).toLocaleString() : '—'}</td>
        <td className="p-4">
            {reg.status === 'pending' ? (
                <div className="flex gap-2">
                    <button onClick={() => onAction('approve', [reg._id])} className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Approve</button>
                    <button onClick={() => onAction('reject', [reg._id])} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                </div>
            ) : reg.attended ? (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Checked-In</span>
            ) : (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
            )}
        </td>
    </tr>
));

const RegistrationTable = ({ registrations, selected, onSelect, onSelectAll, sortConfig, onSort, onAction, loading }) => (
    <div className="bg-card border rounded-lg overflow-x-auto relative">
        {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10"></div>}
        <table className="min-w-full text-sm text-left">
            <thead className="bg-muted border-b">
                <tr>
                    <th className="p-4"><input type="checkbox" onChange={onSelectAll} checked={selected.length > 0 && selected.length === registrations.length} /></th>
                    <SortableHeader name="name" sortConfig={sortConfig} onSort={onSort}>Name</SortableHeader>
                    <SortableHeader name="rollNo" sortConfig={sortConfig} onSort={onSort}>Roll No</SortableHeader>
                    <th className="p-4 whitespace-nowrap">Year / Section</th>
                    <th className="p-4">Mobile</th>
                    <SortableHeader name="registeredAt" sortConfig={sortConfig} onSort={onSort}>Registered</SortableHeader>
                    <SortableHeader name="attendedAt" sortConfig={sortConfig} onSort={onSort}>Checked In</SortableHeader>
                    <th className="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                {registrations.length === 0 ? (
                    <tr><td colSpan="8" className="text-center p-8 text-muted-foreground">No registrations match your filters.</td></tr>
                ) : (
                    registrations.map(reg => (
                        <RegistrationRow 
                            key={reg._id} 
                            reg={reg} 
                            isSelected={selected.includes(reg._id)} 
                            onSelect={onSelect} 
                            onAction={onAction}
                        />
                    ))
                )}
            </tbody>
        </table>
    </div>
);

// --- Main Dashboard Component ---
const AdminDashboardPage = () => {
    const [registrations, setRegistrations] = useState([]);
    const [selected, setSelected] = useState([]);
    const [filters, setFilters] = useState({ year: '', section: '', status: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'registeredAt', direction: 'descending' });

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/registrations`, { headers: { 'x-auth-token': token }, params: { year: filters.year, section: filters.section } });
            setRegistrations(res.data);
            setSelected([]);
        } catch (err) { toast.error('Failed to fetch registrations.'); } finally { setLoading(false); }
    }, [filters.year, filters.section]);

    useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

    const processedRegistrations = useMemo(() => {
        let items = [...registrations];
        
        // Search filter
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            items = items.filter(reg => 
                reg.name.toLowerCase().includes(lowercasedTerm) || 
                reg.rollNo.toLowerCase().includes(lowercasedTerm)
            );
        }

        // Status filter
        if (filters.status !== 'all') {
            items = items.filter(reg => {
                if (filters.status === 'pending') return reg.status === 'pending';
                if (filters.status === 'approved') return reg.status === 'approved' && !reg.attended;
                if (filters.status === 'checkedIn') return reg.attended;
                return true;
            });
        }
        
        // Sorting
        if (sortConfig.key) {
            items.sort((a, b) => {
                if (sortConfig.key === 'attendedAt' && (!a.attendedAt || !b.attendedAt)) {
                    return !a.attendedAt ? 1 : -1;
                }
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [registrations, filters.status, sortConfig, searchTerm]);

    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
    const handleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    const handleSelectAll = (e) => setSelected(e.target.checked ? processedRegistrations.map(r => r._id) : []);
    const handleAction = async (action, ids) => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const promise = action === 'approve' ? axios.put(`${API_URL}/api/admin/approve`, { ids }, config) : axios.delete(`${API_URL}/api/admin/reject`, { data: { ids }, ...config });
        toast.promise(promise, {
            loading: `Processing...`,
            success: () => { fetchRegistrations(); return `Successfully processed.`; },
            error: `Action failed.`,
        });
    };

    const downloadCSV = () => {
        if (registrations.length === 0) return toast.error("No data to export.");
        const headers = ["Name", "RollNo", "Year", "Section", "Mobile", "Status", "Attended", "CheckInTime", "RegisteredAt"];
        const csvRows = [headers.join(','), ...processedRegistrations.map(row => [`"${row.name}"`, `"${row.rollNo}"`, row.year, row.section, `"${row.mobile}"`, row.status, row.attended, row.attendedAt ? `"${new Date(row.attendedAt).toLocaleString()}"` : 'N/A', `"${new Date(row.registeredAt).toLocaleString()}"`].join(','))];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'registrations.csv');
        link.click();
        link.remove();
    };

    const summary = useMemo(() => ({
        total: registrations.length,
        approved: registrations.filter(r => r.status === 'approved').length,
        pending: registrations.filter(r => r.status === 'pending').length,
        checkedIn: registrations.filter(r => r.attended).length,
    }), [registrations]);
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Link to="/admin/scanner" className="md:hidden flex-grow px-4 py-2 bg-blue-600 text-white text-center rounded-md font-semibold hover:bg-blue-700">Go to Scanner</Link>
                    <button onClick={downloadCSV} className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary-hover">Download CSV</button>
                </div>
            </div>
            
            <Statistics summary={summary} />

            <FilterPanel 
                filters={filters}
                onFilterChange={(e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                selectedCount={selected.length}
                onBulkAction={(action) => handleAction(action, selected)}
                onSearch={(e) => setSearchTerm(e.target.value)}
            />

            <RegistrationTable 
                registrations={processedRegistrations}
                selected={selected}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                sortConfig={sortConfig}
                onSort={handleSort}
                onAction={handleAction}
                loading={loading}
            />
        </div>
    );
};

export default AdminDashboardPage;