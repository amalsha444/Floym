
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types ---

type PaymentMode = 'UPI' | 'Cash' | 'Bank Transfer';

interface Service {
  id: string;
  category: 'German' | 'Prometric' | 'Other';
  name: string;
  price: number;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  batch: string;
  startDate: string;
  status: 'Active' | 'Completed' | 'Dropped';
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  mode: PaymentMode;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  serviceIds: string[];
  totalAmount: number;
  payments: PaymentRecord[];
  createdAt: string;
}

interface ExamBooking {
  id: string;
  studentId: string;
  level: string;
  date: string;
  status: 'Booked' | 'Pending' | 'Passed' | 'Failed';
  qvpStatus: string;
  notes: string;
}

interface Expense {
  id: string;
  category: 'Rent' | 'Salary' | 'Marketing' | 'Utilities' | 'Others';
  date: string;
  amount: number;
  description: string;
}

// --- Initial Mock Data ---

const INITIAL_SERVICES: Service[] = [
  { id: 'g1', category: 'German', name: 'A1', price: 15000 },
  { id: 'g2', category: 'German', name: 'A2', price: 15000 },
  { id: 'g3', category: 'German', name: 'B1', price: 18000 },
  { id: 'g4', category: 'German', name: 'B2', price: 20000 },
  { id: 'p1', category: 'Prometric', name: '15 Day Online', price: 5000 },
  { id: 'p2', category: 'Prometric', name: 'Unlimited Class', price: 12000 },
  { id: 'p3', category: 'Prometric', name: 'Offline Crash', price: 8000 },
];

// --- Utils ---

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// --- Components ---

const App = () => {
  const [view, setView] = useState<'dashboard' | 'students' | 'billing' | 'exams' | 'expenses' | 'services'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistence State
  const [students, setStudents] = useState<Student[]>(() => JSON.parse(localStorage.getItem('floym_students') || '[]'));
  const [services, setServices] = useState<Service[]>(() => JSON.parse(localStorage.getItem('floym_services') || JSON.stringify(INITIAL_SERVICES)));
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem('floym_invoices') || '[]'));
  const [exams, setExams] = useState<ExamBooking[]>(() => JSON.parse(localStorage.getItem('floym_exams') || '[]'));
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('floym_expenses') || '[]'));

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('floym_students', JSON.stringify(students));
    localStorage.setItem('floym_services', JSON.stringify(services));
    localStorage.setItem('floym_invoices', JSON.stringify(invoices));
    localStorage.setItem('floym_exams', JSON.stringify(exams));
    localStorage.setItem('floym_expenses', JSON.stringify(expenses));
  }, [students, services, invoices, exams, expenses]);

  // Calculations for Dashboard
  const stats = useMemo(() => {
    const totalIncome = invoices.reduce((acc, inv) => acc + inv.payments.reduce((pAcc, p) => pAcc + p.amount, 0), 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const pendingPayments = invoices.reduce((acc, inv) => {
      const paid = inv.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
      return acc + (inv.totalAmount - paid);
    }, 0);
    const upcomingExamsCount = exams.filter(e => new Date(e.date) >= new Date()).length;

    return {
      totalStudents: students.length,
      totalIncome,
      totalExpenses,
      pendingPayments,
      upcomingExams: upcomingExamsCount,
      netProfit: totalIncome - totalExpenses
    };
  }, [students, invoices, expenses, exams]);

  // Helper for Print View
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);

  const handlePrint = (invoice: Invoice) => {
    setActivePrintInvoice(invoice);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 no-print hidden md:flex flex-col border-r border-slate-800`}>
        <div className="p-6 font-bold text-xl border-b border-slate-800 flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="bg-indigo-600 p-2 rounded text-xs flex-shrink-0">FL</span>
          {isSidebarOpen && <span>FLOYM Hub</span>}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'billing', label: 'Billing', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { id: 'exams', label: 'Exams', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { id: 'expenses', label: 'Expenses', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'services', label: 'Services', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${view === item.id ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {isSidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 hover:bg-slate-800 flex justify-center border-t border-slate-800">
           {isSidebarOpen ? '❮ Collapse' : '❯'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen relative flex flex-col no-print">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 capitalize">{view}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">{new Date().toDateString()}</span>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 border border-indigo-200">A</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {view === 'dashboard' && <Dashboard stats={stats} exams={exams} students={students} />}
          {view === 'students' && <StudentsManager students={students} setStudents={setStudents} />}
          {view === 'billing' && <BillingManager invoices={invoices} setInvoices={setInvoices} students={students} services={services} onPrint={handlePrint} />}
          {view === 'exams' && <ExamManager exams={exams} setExams={setExams} students={students} />}
          {view === 'expenses' && <ExpenseManager expenses={expenses} setExpenses={setExpenses} />}
          {view === 'services' && <ServicesManager services={services} setServices={setServices} />}
        </div>
      </main>

      {/* Print View Only */}
      {activePrintInvoice && <PrintInvoice invoice={activePrintInvoice} students={students} services={services} onClose={() => setActivePrintInvoice(null)} />}
    </div>
  );
};

// --- View: Dashboard ---
const Dashboard = ({ stats, exams, students }: { stats: any, exams: ExamBooking[], students: Student[] }) => {
  const upcoming = exams.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon="users" color="bg-blue-100 text-blue-600" />
        <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon="cash" color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpenses)} icon="minus" color="bg-rose-100 text-rose-600" />
        <StatCard title="Pending Payments" value={formatCurrency(stats.pendingPayments)} icon="clock" color="bg-amber-100 text-amber-600" />
        <StatCard title="Upcoming Exams" value={stats.upcomingExams} icon="calendar" color="bg-indigo-100 text-indigo-600" />
        <StatCard title="Net Profit" value={formatCurrency(stats.netProfit)} icon="chart" color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Quick Exam Overview</h3>
          <div className="space-y-4">
            {upcoming.length > 0 ? upcoming.map(e => {
              const student = students.find(s => s.id === e.studentId);
              return (
                <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900">{student?.name || 'Unknown Student'}</div>
                    <div className="text-sm text-slate-500 font-medium">{e.level} • {e.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">{e.date}</div>
                    <span className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">{e.qvpStatus}</span>
                  </div>
                </div>
              );
            }) : <div className="text-slate-400 py-8 text-center italic">No upcoming exams scheduled</div>}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Financial Metrics</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-slate-600">Expenses Utilization</span>
                <span className="text-slate-900">{stats.totalIncome > 0 ? Math.round((stats.totalExpenses / stats.totalIncome) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${Math.min(100, stats.totalIncome > 0 ? (stats.totalExpenses / stats.totalIncome) * 100 : 0)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-slate-600">Pending Collection Ratio</span>
                <span className="text-slate-900">{formatCurrency(stats.pendingPayments)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${Math.min(100, stats.totalIncome + stats.pendingPayments > 0 ? (stats.pendingPayments / (stats.totalIncome + stats.pendingPayments)) * 100 : 0)}%` }}></div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
               <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Estimated Net Profit</div>
               <div className="text-3xl font-black text-indigo-900">{formatCurrency(stats.netProfit)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-xl ${color} flex-shrink-0`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
    </div>
  </div>
);

// --- View: Students Manager ---
const StudentsManager = ({ students, setStudents }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', phone: '', email: '', course: 'German A1', batch: '', startDate: new Date().toISOString().split('T')[0], status: 'Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      ...(formData as Student),
      id: generateId()
    };
    setStudents([...students, newStudent]);
    setShowModal(false);
    setFormData({ name: '', phone: '', email: '', course: 'German A1', batch: '', startDate: new Date().toISOString().split('T')[0], status: 'Active' });
  };

  const filtered = students.filter((s: Student) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <button onClick={() => setShowModal(true)} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Enroll Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Contact Details</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Course Info</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s: Student) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="font-semibold">{s.phone}</div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-bold text-indigo-600">{s.course}</div>
                    <div className="text-xs text-slate-500 font-medium">{s.batch}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{s.startDate}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 font-bold uppercase tracking-wider rounded-full ${s.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : s.status === 'Completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-12 text-center text-slate-400 font-medium">No students found matching your criteria</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">New Enrollment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Full Name</label>
                  <input required className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Phone Number</label>
                  <input required className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Email</label>
                  <input type="email" required className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Course Level</label>
                  <select className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                    <option>German A1</option>
                    <option>German A2</option>
                    <option>German B1</option>
                    <option>German B2</option>
                    <option>Prometric 15 Day</option>
                    <option>Prometric Unlimited</option>
                    <option>Prometric Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Batch</label>
                  <input className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} placeholder="e.g. June 2024" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Start Date</label>
                  <input type="date" required className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Status</label>
                  <select className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Dropped</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-black shadow-lg shadow-indigo-100">Confirm Enrollment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- View: Billing Manager ---
const BillingManager = ({ invoices, setInvoices, students, services, onPrint }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');

  const createInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const total = selectedServices.reduce((acc, id) => acc + (services.find((s: Service) => s.id === id)?.price || 0), 0);
    const newInvoice: Invoice = {
      id: generateId(),
      invoiceNumber: `INV-${1000 + invoices.length + 1}`,
      studentId: selectedStudent,
      serviceIds: selectedServices,
      totalAmount: total,
      payments: paymentAmount > 0 ? [{ id: generateId(), date: new Date().toISOString().split('T')[0], amount: paymentAmount, mode: paymentMode }] : [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setInvoices([newInvoice, ...invoices]);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedStudent('');
    setSelectedServices([]);
    setPaymentAmount(0);
    setPaymentMode('UPI');
  };

  const addPayment = (invoiceId: string, amount: number, mode: PaymentMode) => {
    setInvoices(invoices.map((inv: Invoice) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          payments: [...inv.payments, { id: generateId(), date: new Date().toISOString().split('T')[0], amount, mode }]
        };
      }
      return inv;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Billing History</h2>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 flex items-center gap-2 font-bold shadow-lg shadow-emerald-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {invoices.map((inv: Invoice) => {
          const student = students.find((s: Student) => s.id === inv.studentId);
          const paidAmount = inv.payments.reduce((acc, p) => acc + p.amount, 0);
          const balance = inv.totalAmount - paidAmount;
          return (
            <div key={inv.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-indigo-300 transition-all hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black bg-slate-900 px-2 py-0.5 rounded text-white uppercase tracking-widest">{inv.invoiceNumber}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${balance === 0 ? 'bg-green-50 text-green-700 border-green-200' : balance === inv.totalAmount ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {balance === 0 ? 'Fully Paid' : balance === inv.totalAmount ? 'Payment Pending' : 'Partially Paid'}
                  </span>
                </div>
                <h3 className="font-black text-xl text-slate-900">{student?.name || 'Deleted Account'}</h3>
                <div className="text-xs text-slate-400 font-bold flex gap-4 mt-1 uppercase tracking-tighter">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    {inv.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    {inv.serviceIds.length} Items
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 border-l border-slate-100 pl-6">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Total Fee</div>
                  <div className="text-xl font-black text-slate-900">{formatCurrency(inv.totalAmount)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Balance Due</div>
                  <div className={`text-xl font-black ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(balance)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                <button onClick={() => onPrint(inv)} className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors flex items-center justify-center group" title="Print/Save Invoice">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </button>
                {balance > 0 && (
                  <button 
                    onClick={() => {
                      const amt = prompt(`Enter payment for ${student?.name}. Balance: ${formatCurrency(balance)}`);
                      if (amt && !isNaN(parseFloat(amt))) {
                         addPayment(inv.id, Math.min(balance, parseFloat(amt)), 'UPI');
                      }
                    }}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-50"
                  >
                    Pay
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {invoices.length === 0 && <div className="p-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl font-medium">No invoices found. Use the button above to create your first bill.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Generate Learning Bill</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <form onSubmit={createInvoice} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Student Selection</label>
                    <select required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 bg-white font-bold" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                      <option value="">-- Choose Account --</option>
                      {students.map((s: Student) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Initial Collection (₹)</label>
                    <input type="number" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-bold text-indigo-600 text-lg" value={paymentAmount} onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Payment Channel</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['UPI', 'Cash', 'Bank Transfer'].map(mode => (
                        <label key={mode} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMode === mode ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/10' : 'hover:bg-slate-50 border-slate-200'}`}>
                          <input type="radio" className="w-4 h-4 text-indigo-600" checked={paymentMode === mode} onChange={() => setPaymentMode(mode as any)} />
                          <span className="text-sm font-bold text-slate-700">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Services & Courses</label>
                  <div className="max-h-[340px] overflow-auto border rounded-2xl p-4 space-y-3 bg-slate-50 border-slate-200 custom-scrollbar">
                    {services.map((s: Service) => (
                      <label key={s.id} className={`flex items-center gap-4 p-3 border rounded-xl cursor-pointer transition-all ${selectedServices.includes(s.id) ? 'bg-white border-indigo-400 shadow-sm' : 'bg-white/50 border-transparent hover:border-slate-300'}`}>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded text-indigo-600"
                          checked={selectedServices.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedServices([...selectedServices, s.id]);
                            else setSelectedServices(selectedServices.filter(id => id !== s.id));
                          }}
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <div className="text-xs font-black text-indigo-600 uppercase tracking-tighter leading-none mb-1">{s.category}</div>
                            <div className="text-sm font-bold text-slate-800">{s.name}</div>
                          </div>
                          <span className="text-sm font-black text-slate-900">{formatCurrency(s.price)}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl">
                <div>
                   <span className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] mb-1 block">Total Course Fees</span>
                   <div className="text-3xl font-black">
                    {formatCurrency(selectedServices.reduce((acc, id) => acc + (services.find((s: Service) => s.id === id)?.price || 0), 0))}
                   </div>
                </div>
                <div className="h-px sm:h-12 w-full sm:w-px bg-slate-800"></div>
                <div className="text-center sm:text-right">
                   <span className="text-indigo-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1 block">Remaining Balance</span>
                   <div className="text-2xl font-bold text-indigo-300">
                    {formatCurrency(Math.max(0, selectedServices.reduce((acc, id) => acc + (services.find((s: Service) => s.id === id)?.price || 0), 0) - paymentAmount))}
                   </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors uppercase tracking-widest text-xs">Discard</button>
                <button type="submit" disabled={!selectedStudent || selectedServices.length === 0} className="px-10 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-black shadow-2xl shadow-indigo-200 transition-all uppercase tracking-widest text-xs">Finalize Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- View: Exam Manager ---
const ExamManager = ({ exams, setExams, students }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<ExamBooking>>({
    studentId: '', level: 'B1', date: new Date().toISOString().split('T')[0], status: 'Booked', qvpStatus: 'In Progress', notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: ExamBooking = { ...(formData as ExamBooking), id: generateId() };
    setExams([newExam, ...exams]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">Academic Examination Tracking</h2>
          <p className="text-sm text-slate-500 font-medium">Manage student levels and certification progress.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-black shadow-lg shadow-indigo-50">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           New Booking
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">Level</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">Exam Date</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">Result Status</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">QVP Tracking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exams.map((e: ExamBooking) => {
              const student = students.find((s: Student) => s.id === e.studentId);
              return (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{student?.name || '---'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{e.level}</td>
                  <td className="px-6 py-4 text-sm font-black text-indigo-600">{e.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 font-black uppercase tracking-widest rounded-full border ${e.status === 'Passed' ? 'bg-green-50 text-green-700 border-green-200' : e.status === 'Failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>{e.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                       <span className={`w-2 h-2 rounded-full ${e.qvpStatus === 'Completed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                       {e.qvpStatus}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {exams.length === 0 && <div className="p-16 text-center text-slate-400 font-bold italic uppercase tracking-widest text-sm opacity-60">Zero Examination Records Found</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">Book Examination</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Student Profile</label>
                <select required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-bold" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">-- Choose Account --</option>
                  {students.map((s: Student) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Level</label>
                  <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-bold" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                    <option>A1</option>
                    <option>A2</option>
                    <option>B1</option>
                    <option>B2</option>
                    <option>Prometric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Exam Date</label>
                  <input type="date" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Administrative Notes</label>
                <textarea className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-medium text-sm" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Specify additional details..." />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full py-4 bg-indigo-900 text-white rounded-xl hover:bg-indigo-950 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all">Confirm Booking</button>
                <button type="button" onClick={() => setShowModal(false)} className="w-full py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-colors uppercase tracking-widest text-xs">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- View: Expense Manager ---
const ExpenseManager = ({ expenses, setExpenses }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    category: 'Rent', amount: 0, date: new Date().toISOString().split('T')[0], description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = { ...(formData as Expense), id: generateId() };
    setExpenses([newExpense, ...expenses]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Financial Outflows</h2>
          <p className="text-sm text-slate-500 font-medium">Keep track of operational costs and overheads.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-rose-600 text-white px-6 py-2.5 rounded-xl hover:bg-rose-700 flex items-center gap-2 font-black shadow-lg shadow-rose-50">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           Record Expense
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest">Detail</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((exp: Expense) => (
              <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-1 font-black rounded border bg-white border-slate-200 text-slate-600 uppercase tracking-widest`}>{exp.category}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-500">{exp.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{exp.description}</td>
                <td className="px-6 py-4 text-right font-black text-rose-600">{formatCurrency(exp.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <div className="p-16 text-center text-slate-400 font-bold opacity-60">No expenses logged this period</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-rose-600 tracking-tight">Log Expense</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
                <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none border-slate-200 font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                  <option>Rent</option>
                  <option>Salary</option>
                  <option>Marketing</option>
                  <option>Utilities</option>
                  <option>Others</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Value (₹)</label>
                  <input type="number" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none border-slate-200 font-black text-rose-600" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Date</label>
                  <input type="date" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none border-slate-200 font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Narrative</label>
                <textarea required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none border-slate-200 font-medium text-sm" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Purpose of this expense..." />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full py-4 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-black uppercase tracking-widest shadow-xl shadow-rose-100 transition-all">Add to Ledger</button>
                <button type="button" onClick={() => setShowModal(false)} className="w-full py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-colors uppercase tracking-widest text-xs">Dismiss</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- View: Services Manager ---
const ServicesManager = ({ services, setServices }: any) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({ category: 'German', name: '', price: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setServices([...services, { ...newService, id: generateId() } as Service]);
    setShowAddModal(false);
    setNewService({ category: 'German', name: '', price: 0 });
  };

  const handleUpdate = (id: string) => {
    setServices(services.map((s: Service) => s.id === id ? { ...s, price: editPrice } : s));
    setEditingId(null);
  };

  const categories = ['German', 'Prometric', 'Other'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Service Catalog & Pricing</h2>
          <p className="text-sm text-slate-500 font-medium">Define and adjust fees for courses and offerings.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-600 flex items-center gap-2 font-black shadow-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat} className="space-y-4">
             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg inline-block border border-indigo-100">{cat} Programs</h3>
             <div className="space-y-3">
               {services.filter((s: Service) => s.category === cat).map((s: Service) => (
                 <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 group hover:border-indigo-300 transition-all hover:shadow-md">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="text-lg font-black text-slate-800 leading-tight">{s.name}</div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.id}</div>
                     </div>
                     <button 
                        onClick={() => { setEditingId(s.id); setEditPrice(s.price); }} 
                        className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                     </button>
                   </div>
                   {editingId === s.id ? (
                     <div className="flex gap-2">
                       <input type="number" className="flex-1 p-2 border rounded-lg font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" value={editPrice} onChange={e => setEditPrice(parseFloat(e.target.value) || 0)} />
                       <button onClick={() => handleUpdate(s.id)} className="bg-indigo-600 text-white px-3 rounded-lg font-bold">Save</button>
                       <button onClick={() => setEditingId(null)} className="bg-slate-100 text-slate-400 px-3 rounded-lg font-bold">✕</button>
                     </div>
                   ) : (
                     <div className="text-2xl font-black text-indigo-600">{formatCurrency(s.price)}</div>
                   )}
                 </div>
               ))}
               {services.filter((s: Service) => s.category === cat).length === 0 && <div className="text-slate-300 text-xs font-bold italic py-4">No services in this category</div>}
             </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">New Service</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
                <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-bold" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value as any})}>
                  <option>German</option>
                  <option>Prometric</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Service Name</label>
                <input required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-bold" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="e.g. Intensive Workshop" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Fixed Fee (₹)</label>
                <input type="number" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border-slate-200 font-black text-indigo-600" value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full py-4 bg-indigo-900 text-white rounded-xl font-black uppercase tracking-widest shadow-xl">Confirm Entry</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="w-full py-3 text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 rounded-xl transition-colors">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- View: Print Invoice (Internal Only) ---
const PrintInvoice = ({ invoice, students, services, onClose }: { invoice: Invoice, students: Student[], services: Service[], onClose: () => void }) => {
  const student = students.find(s => s.id === invoice.studentId);
  const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
  const balance = invoice.totalAmount - totalPaid;

  return (
    <div className="fixed inset-0 z-[100] bg-white print-only flex flex-col p-12">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-1">FLOYM Learning Hub</h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Internal Billing Record</p>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-4 py-2 font-black text-xl mb-2">{invoice.invoiceNumber}</div>
          <div className="text-sm font-bold text-slate-600">Issued: {invoice.createdAt}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Student Particulars</div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">{student?.name}</h2>
          <p className="text-slate-600 font-medium">{student?.phone}</p>
          <p className="text-slate-600 font-medium">{student?.email}</p>
          <p className="mt-2 text-indigo-600 font-bold italic">{student?.course} - {student?.batch}</p>
        </div>
        <div className="bg-slate-50 p-6 border-l-4 border-slate-900">
           <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Payment Summary</div>
           <div className="flex justify-between mb-1 font-bold">
             <span>Total Fees:</span>
             <span>{formatCurrency(invoice.totalAmount)}</span>
           </div>
           <div className="flex justify-between mb-4 font-bold text-emerald-600">
             <span>Collected:</span>
             <span>{formatCurrency(totalPaid)}</span>
           </div>
           <div className="h-px bg-slate-200 mb-4"></div>
           <div className="flex justify-between font-black text-2xl text-rose-600">
             <span>Balance Due:</span>
             <span>{formatCurrency(balance)}</span>
           </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Billable Items</div>
        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900">
              <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-xs">Description</th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-xs">Category</th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-widest text-xs">Price</th>
            </tr>
          </thead>
          <tbody>
            {invoice.serviceIds.map(id => {
              const s = services.find(x => x.id === id);
              return (
                <tr key={id} className="border-b border-slate-200">
                  <td className="px-4 py-4 font-bold text-slate-800">{s?.name}</td>
                  <td className="px-4 py-4 text-right text-sm text-slate-500 font-bold uppercase">{s?.category}</td>
                  <td className="px-4 py-4 text-right font-black text-slate-900">{formatCurrency(s?.price || 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {invoice.payments.length > 0 && (
          <>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Transaction History</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-400">
                  <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-widest">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-widest">Mode</th>
                  <th className="px-4 py-2 text-right text-xs font-black uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm font-bold">{p.date}</td>
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600 uppercase tracking-tighter">{p.mode}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600">+{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="mt-24 flex justify-between items-end">
        <div className="w-48 border-t-2 border-slate-900 pt-2 text-center text-xs font-black uppercase tracking-widest">Authorized Signature</div>
        <div className="text-[10px] font-bold text-slate-400 italic text-right max-w-xs leading-tight">
          Computer generated office copy. No physical signature required for internal use. All fees once paid are non-refundable.
        </div>
      </div>
      
      {/* Visual Close for UI only */}
      <button onClick={onClose} className="fixed top-8 right-8 no-print bg-rose-600 text-white px-4 py-2 rounded-xl font-bold">Close Print View</button>
    </div>
  );
};

// --- Entry Point ---

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
