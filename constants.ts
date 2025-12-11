
import { AgentType, Patient, Appointment, Invoice } from './types';

export const SYSTEM_INSTRUCTION = `
Anda adalah 'Sistem Rumah Sakit Koordinator Pusat' yang bertugas MENGANALISIS secara KRITIS semua permintaan pengguna dan MENEGASKAN maksud (intent) mereka.

PERAN UTAMA: Tugas Anda adalah secara EKSKLUSIF mendelegasikan permintaan ke SATU Sub-Agen (tool) yang paling sesuai.

ATURAN DELEGASI KETAT:
1. HARUS memilih HANYA SATU fungsi yang relevan per permintaan.
2. JANGAN PERNAH memproses atau menghasilkan jawaban sendiri tanpa memanggil alat jika itu adalah permintaan operasional.
3. Ekstrak dan sertakan SEMUA detail dan parameter yang relevan dari kueri asli pengguna ke dalam panggilan fungsi.
4. Jika informasi tidak lengkap, minta klarifikasi kepada pengguna sebelum memanggil alat.
5. Gunakan Bahasa Indonesia yang formal dan profesional.

DEFINISI SUB-AGEN:
- PatientManagement: Pendaftaran pasien baru, update kontak, info demografi.
- AppointmentScheduler: Jadwal, reschedule, batal janji temu dokter.
- MedicalRecords: Riwayat medis, hasil lab, diagnosis.
- BillingAndInsurance: Tagihan, pembayaran, asuransi, biaya.
- TechnicalSupport: Masalah teknis, error sistem, cara penggunaan aplikasi, eskalasi tiket IT.
`;

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P12345', name: 'Budi Santoso', dob: '1980-05-15', contact: '08123456789', lastVisit: '2023-10-10' },
  { id: 'P9876', name: 'Siti Aminah', dob: '1992-11-20', contact: '08198765432', lastVisit: '2023-11-01' },
  { id: 'P5555', name: 'Rudi Hartono', dob: '1975-03-30', contact: '08111222333', lastVisit: '2023-09-15' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'APT-001', patientId: 'P12345', doctor: 'Dr. Bima', date: '2023-12-01 10:00', status: 'Scheduled' },
  { id: 'APT-002', patientId: 'P9876', doctor: 'Dr. Sari', date: '2023-11-01 14:00', status: 'Completed' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', patientId: 'P12345', amount: 500000, status: 'Pending', description: 'Konsultasi Spesialis Jantung' },
  { id: 'INV-002', patientId: 'P9876', amount: 150000, status: 'Paid', description: 'Cek Darah Lengkap' },
];

export const AGENT_DESCRIPTIONS = {
  [AgentType.COORDINATOR]: "Sistem Inti: Menganalisis intent & mendelegasikan tugas.",
  [AgentType.PATIENT_MGMT]: "Sub-Agen: Manajemen data demografis & pendaftaran.",
  [AgentType.SCHEDULER]: "Sub-Agen: Manajemen jadwal dokter & klinik.",
  [AgentType.RECORDS]: "Sub-Agen: Akses data klinis (EMR) aman.",
  [AgentType.BILLING]: "Sub-Agen: Manajemen keuangan & asuransi.",
  [AgentType.TECH_SUPPORT]: "Sub-Agen: Dukungan teknis & pemeliharaan sistem."
};
