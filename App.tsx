
import React, { useState, useRef, useEffect } from 'react';
import { 
  Message, AgentType, Patient, Appointment, Invoice 
} from './types';
import { 
  SYSTEM_INSTRUCTION, MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_INVOICES, AGENT_DESCRIPTIONS 
} from './constants';
import { aiService, getAgentFromToolName } from './services/geminiService';
import AgentDashboard from './components/AgentDashboard';
import { Send, User, Bot, AlertCircle, Terminal } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Sistem Rumah Sakit Terpadu aktif. Silakan masukkan kebutuhan Anda.',
      timestamp: new Date(),
      agent: AgentType.COORDINATOR
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.COORDINATOR);
  const [systemLog, setSystemLog] = useState<string | null>(null);

  // --- Mock Database State ---
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Scroll to bottom on message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Tool Handlers (Simulate Backend) ---
  const handleTools: Record<string, Function> = {
    patientManagement: async (args: any) => {
      setActiveAgent(AgentType.PATIENT_MGMT);
      setSystemLog(`[DB] PatientMgmt Action: ${args.action}`);
      
      if (args.action === 'register' || args.action.includes('update')) {
        // Mock Update
        const newPatient: Patient = {
            id: `P${Math.floor(Math.random() * 90000)}`,
            name: args.patient_details.split(',')[0] || "Pasien Baru",
            dob: "1990-01-01",
            contact: "08123456789",
            lastVisit: new Date().toISOString().split('T')[0]
        };
        setPatients(prev => [...prev, newPatient]);
        return `Berhasil. Pasien baru terdaftar dengan ID sementara ${newPatient.id}.`;
      }
      return `Data pasien ditemukan untuk: ${args.patient_details}`;
    },
    appointmentScheduler: async (args: any) => {
      setActiveAgent(AgentType.SCHEDULER);
      setSystemLog(`[DB] Scheduler Action: ${args.action} for ${args.patient_id}`);

      if (args.action === 'schedule') {
        const newAppt: Appointment = {
            id: `APT-${Math.floor(Math.random() * 1000)}`,
            patientId: args.patient_id,
            doctor: args.appointment_details.includes('Bima') ? 'Dr. Bima' : 'Dr. Umum',
            date: "Minggu Depan",
            status: 'Scheduled'
        };
        setAppointments(prev => [...prev, newAppt]);
        return `Janji temu berhasil dijadwalkan. ID Tiket: ${newAppt.id} untuk ${args.patient_id}.`;
      }
      return `Permintaan ${args.action} diproses untuk jadwal ${args.appointment_details}.`;
    },
    medicalRecords: async (args: any) => {
      setActiveAgent(AgentType.RECORDS);
      setSystemLog(`[DB] Accessing Secured Records: ${args.patient_id}`);
      return `Ringkasan ${args.requested_summary_type} untuk ${args.patient_id}: Kondisi stabil, parameter vital normal. Akses dicatat dalam audit log.`;
    },
    billingAndInsurance: async (args: any) => {
      setActiveAgent(AgentType.BILLING);
      setSystemLog(`[DB] Financial Transaction: ${args.action}`);
      return `Transaksi ${args.action} untuk ${args.patient_id} berhasil diproses. Status keuangan diperbarui.`;
    },
    technicalSupport: async (args: any) => {
      setActiveAgent(AgentType.TECH_SUPPORT);
      setSystemLog(`[IT] Support Ticket: ${args.action}`);
      return `Tiket support dibuat dengan ID TKT-${Math.floor(Math.random() * 1000)}. Detail masalah: "${args.issue_details}". Teknisi akan segera meninjau.`;
    }
  };

  // --- Handlers ---
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setSystemLog(null);
    // Reset agent visually for a split second to show "thinking" by Coordinator
    setActiveAgent(AgentType.COORDINATOR); 

    try {
      // Prepare history for API
      const apiHistory = messages.map(m => ({
        role: m.role === 'system' ? 'user' : m.role, // System messages map to user for API context if needed, or omit
        parts: [{ text: m.content }]
      })).filter(m => m.role !== 'system'); // simple filtering

      const result = await aiService.sendMessage(
        apiHistory, 
        userMsg.content, 
        SYSTEM_INSTRUCTION,
        handleTools
      );

      // Determine who answered
      let answeringAgent = AgentType.COORDINATOR;
      if (result.toolUsed) {
        answeringAgent = getAgentFromToolName(result.toolUsed);
        
        // Add a specialized log message showing the tool result
        const systemToolMsg: Message = {
            id: Date.now().toString() + '-tool',
            role: 'system',
            content: `>> Sub-Agen ${answeringAgent} aktif.\n>> Output: ${result.toolResult}`,
            timestamp: new Date(),
            agent: answeringAgent,
            isToolCall: true
        };
        setMessages(prev => [...prev, systemToolMsg]);
      } else {
        // If no tool used, the Coordinator answered directly (likely asking for more info)
        setActiveAgent(AgentType.COORDINATOR);
      }

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.response,
        timestamp: new Date(),
        agent: answeringAgent
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Terjadi kesalahan koneksi dengan Koordinator Pusat.',
        timestamp: new Date(),
        agent: AgentType.COORDINATOR
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-100 font-sans">
      
      {/* LEFT PANEL: CHAT INTERFACE */}
      <div className="w-1/3 min-w-[350px] flex flex-col border-r border-slate-200 bg-white shadow-xl z-10">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center font-bold text-lg">
                    AI
                </div>
                <div>
                    <h1 className="font-semibold text-lg leading-tight">Koordinator RS</h1>
                    <p className="text-xs text-slate-400">Sistem Terintegrasi</p>
                </div>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-br-none' 
                    : msg.isToolCall 
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs w-full'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {msg.isToolCall ? (
                    <div className="flex gap-2 items-start">
                        <Terminal size={14} className="mt-1 flex-shrink-0" />
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                    </div>
                ) : (
                    msg.content
                )}
              </div>

              {/* Agent Badge & Time */}
              <div className="flex items-center gap-2 mt-1 px-1">
                {msg.role !== 'user' && msg.agent && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        msg.agent === AgentType.COORDINATOR ? 'bg-gray-200 text-gray-600' :
                        msg.agent === AgentType.PATIENT_MGMT ? 'bg-blue-100 text-blue-700' :
                        msg.agent === AgentType.SCHEDULER ? 'bg-green-100 text-green-700' :
                        msg.agent === AgentType.RECORDS ? 'bg-purple-100 text-purple-700' :
                        msg.agent === AgentType.TECH_SUPPORT ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                        'bg-orange-100 text-orange-700'
                    }`}>
                        {msg.agent === AgentType.COORDINATOR ? 'Koordinator' : msg.agent.split('_')[0]}
                    </span>
                )}
                <span className="text-[10px] text-slate-400">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-center gap-2 text-slate-400 text-xs ml-4">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
               Koordinator sedang menganalisis...
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="relative">
            <textarea
              className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-slate-800"
              rows={2}
              placeholder="Ketik permintaan (contoh: Jadwalkan pasien P12345...)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="absolute right-2 bottom-2 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            AI dapat melakukan kesalahan. Harap verifikasi informasi penting.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: AGENT DASHBOARD */}
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        
        {/* Top Bar - Active Agent Indicator */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Workspace Aktif</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${
                         activeAgent === AgentType.COORDINATOR ? 'bg-gray-400' :
                         activeAgent === AgentType.PATIENT_MGMT ? 'bg-blue-500 animate-pulse' :
                         activeAgent === AgentType.SCHEDULER ? 'bg-green-500 animate-pulse' :
                         activeAgent === AgentType.RECORDS ? 'bg-purple-500 animate-pulse' :
                         activeAgent === AgentType.TECH_SUPPORT ? 'bg-gray-600 animate-pulse' :
                         'bg-orange-500 animate-pulse'
                    }`}></div>
                    <span className="font-bold text-slate-800">
                        {AGENT_DESCRIPTIONS[activeAgent].split(':')[0]}
                    </span>
                </div>
            </div>
            
            {/* System Log Toast */}
            {systemLog && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-green-400 text-xs font-mono rounded shadow-lg animate-in slide-in-from-top-2">
                    <Terminal size={12} />
                    <span>{systemLog}</span>
                </div>
            )}
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>
            
            <AgentDashboard 
                activeAgent={activeAgent} 
                patients={patients} 
                appointments={appointments}
                invoices={invoices}
            />
        </div>
      </div>

    </div>
  );
};

export default App;
