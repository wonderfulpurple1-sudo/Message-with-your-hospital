
import React from 'react';
import { AgentType, Patient, Appointment, Invoice } from '../types';
import { 
  Users, Calendar, FileText, CreditCard, Activity, 
  UserPlus, CalendarCheck, FileHeart, ShieldCheck, Wrench, AlertTriangle, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface Props {
  activeAgent: AgentType;
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
}

const AgentDashboard: React.FC<Props> = ({ activeAgent, patients, appointments, invoices }) => {
  
  // Data for Medical Records Visualization
  const vitalData = [
    { name: 'Jan', heartRate: 72, bpSys: 120 },
    { name: 'Feb', heartRate: 75, bpSys: 118 },
    { name: 'Mar', heartRate: 70, bpSys: 122 },
    { name: 'Apr', heartRate: 78, bpSys: 130 },
    { name: 'May', heartRate: 74, bpSys: 125 },
  ];

  // Data for Billing Visualization
  const revenueData = [
    { name: 'Sen', amount: 4000000 },
    { name: 'Sel', amount: 3000000 },
    { name: 'Rab', amount: 5500000 },
    { name: 'Kam', amount: 2000000 },
    { name: 'Jum', amount: 6000000 },
  ];

  const renderContent = () => {
    switch (activeAgent) {
      case AgentType.PATIENT_MGMT:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4 text-blue-700">
              <UserPlus className="w-6 h-6" />
              <h2 className="text-xl font-bold">Modul Manajemen Pasien</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {patients.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{p.name}</h3>
                      <p className="text-sm text-gray-500">ID: {p.id}</p>
                      <p className="text-xs text-gray-400 mt-1">Lahir: {p.dob}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Aktif
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
              <p className="font-semibold">Status Sistem:</p>
              <p>Menunggu input pendaftaran atau pembaruan data demografis...</p>
            </div>
          </div>
        );

      case AgentType.SCHEDULER:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <CalendarCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold">Modul Penjadwalan</h2>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasien</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{apt.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{apt.doctor}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{apt.patientId}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          apt.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 
                          apt.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case AgentType.RECORDS:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4 text-purple-700">
              <FileHeart className="w-6 h-6" />
              <h2 className="text-xl font-bold">Rekam Medis Elektronik (EMR)</h2>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">Tren Vital Pasien Terpilih</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="heartRate" stroke="#8884d8" name="Detak Jantung" />
                      <Line type="monotone" dataKey="bpSys" stroke="#82ca9d" name="Tekanan Darah (Sys)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ShieldCheck className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Audit Log: Akses data sensitif dicatat. Menggunakan enkripsi end-to-end.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        );

      case AgentType.BILLING:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
             <div className="flex items-center gap-2 mb-4 text-orange-700">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-xl font-bold">Keuangan & Asuransi</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-lg shadow col-span-2 md:col-span-1">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">Faktur Tertunda</h3>
                    {invoices.filter(i => i.status === 'Pending').length === 0 ? (
                        <p className="text-sm text-gray-400">Tidak ada tagihan tertunda.</p>
                    ) : (
                        invoices.filter(i => i.status === 'Pending').map(inv => (
                            <div key={inv.id} className="border-b py-2 last:border-0">
                                <div className="flex justify-between">
                                    <span className="text-gray-800 font-medium">{inv.description}</span>
                                    <span className="text-orange-600 font-bold">Rp {inv.amount.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-500">Pasien: {inv.patientId}</p>
                            </div>
                        ))
                    )}
                 </div>
                 
                 <div className="bg-white p-4 rounded-lg shadow col-span-2 md:col-span-1">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">Pendapatan Mingguan (Proyeksi)</h3>
                    <div className="h-40 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
                                <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </div>
          </div>
        );

      case AgentType.TECH_SUPPORT:
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Wrench className="w-6 h-6" />
              <h2 className="text-xl font-bold">Dukungan Teknis & IT</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border-t-4 border-green-500">
                 <h3 className="text-sm text-gray-500 mb-2">Kesehatan Sistem</h3>
                 <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-gray-800">Operational</span>
                 </div>
                 <p className="text-xs text-gray-400">Uptime: 99.9%</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border-t-4 border-blue-500">
                 <h3 className="text-sm text-gray-500 mb-2">Tiket Aktif</h3>
                 <div className="text-2xl font-bold text-gray-800">2</div>
                 <p className="text-xs text-gray-400">Low Priority</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Riwayat Tiket Terakhir</h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-800">Printer Error - Poli Gigi</p>
                            <p className="text-xs text-gray-500">Resolved • 2 jam yang lalu</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-800">Login Timeout - Staff Admin</p>
                            <p className="text-xs text-gray-500">In Progress • Teknisi: Andi</p>
                        </div>
                    </div>
                </div>
            </div>
             <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-600 border border-gray-200">
                > System check initiated...<br/>
                > Database connectivity: OK<br/>
                > API Gateway: OK<br/>
                > Latency: 45ms
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in zoom-in duration-300">
            <div className="bg-teal-100 p-6 rounded-full mb-6">
                <Activity className="w-16 h-16 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Koordinator Pusat Siap</h2>
            <p className="text-gray-500 max-w-md">
              Sistem Rumah Sakit Terpadu aktif. Silakan masukkan perintah di panel chat. Koordinator akan secara otomatis mendelegasikan tugas ke sub-agen yang relevan.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded shadow-sm">
                    <UserPlus size={16} /> Manajemen Pasien
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded shadow-sm">
                    <CalendarCheck size={16} /> Penjadwalan
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded shadow-sm">
                    <FileHeart size={16} /> Rekam Medis
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded shadow-sm">
                    <CreditCard size={16} /> Keuangan
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded shadow-sm col-span-2 justify-center">
                    <Wrench size={16} /> Dukungan Teknis
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-slate-50 p-6 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default AgentDashboard;
