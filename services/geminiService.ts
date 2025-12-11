import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { AgentType } from "../types";

// Define Tools
const patientManagementTool: FunctionDeclaration = {
  name: "patientManagement",
  description: "Menangani pendaftaran pasien baru, memperbarui informasi kontak, dan mengambil data demografi dasar.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "Tindakan yang dilakukan: 'register', 'update', 'get_info'" },
      patient_details: { type: Type.STRING, description: "Detail pasien (Nama, ID, dll) dalam string deskriptif." }
    },
    required: ["action", "patient_details"]
  }
};

const appointmentSchedulerTool: FunctionDeclaration = {
  name: "appointmentScheduler",
  description: "Menangani penjadwalan, penjadwalan ulang, atau pembatalan janji temu.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "Tindakan: 'schedule', 'reschedule', 'cancel', 'check_availability'" },
      patient_id: { type: Type.STRING, description: "ID Pasien." },
      appointment_details: { type: Type.STRING, description: "Detail janji temu (Dokter, Waktu, Keluhan)." }
    },
    required: ["action", "patient_id", "appointment_details"]
  }
};

const medicalRecordsTool: FunctionDeclaration = {
  name: "medicalRecords",
  description: "Mengambil dan merangkum riwayat medis, hasil lab, diagnosis. Privasi tinggi.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patient_id: { type: Type.STRING, description: "ID Pasien." },
      requested_summary_type: { type: Type.STRING, description: "Jenis data: 'history', 'lab_results', 'diagnosis', 'vitals'" }
    },
    required: ["patient_id", "requested_summary_type"]
  }
};

const billingAndInsuranceTool: FunctionDeclaration = {
  name: "billingAndInsurance",
  description: "Mengelola pertanyaan penagihan, memproses pembayaran, faktur, dan asuransi.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "Tindakan: 'check_bill', 'pay', 'insurance_claim'" },
      patient_id: { type: Type.STRING, description: "ID Pasien." },
      financial_details: { type: Type.STRING, description: "Detail transaksi atau pertanyaan keuangan." }
    },
    required: ["action", "patient_id"]
  }
};

const technicalSupportTool: FunctionDeclaration = {
  name: "technicalSupport",
  description: "Menangani pertanyaan masalah teknis sistem, pemecahan masalah umum (troubleshooting), dan eskalasi tiket IT.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "Tindakan: 'laporkan_masalah', 'tanya_solusi', 'status_sistem'" },
      issue_details: { type: Type.STRING, description: "Detail masalah teknis atau pertanyaan support." }
    },
    required: ["action", "issue_details"]
  }
};

// Map tool names to AgentTypes for UI visualization
export const getAgentFromToolName = (toolName: string): AgentType => {
  switch (toolName) {
    case 'patientManagement': return AgentType.PATIENT_MGMT;
    case 'appointmentScheduler': return AgentType.SCHEDULER;
    case 'medicalRecords': return AgentType.RECORDS;
    case 'billingAndInsurance': return AgentType.BILLING;
    case 'technicalSupport': return AgentType.TECH_SUPPORT;
    default: return AgentType.COORDINATOR;
  }
};

export class AIService {
  private client: GoogleGenAI;
  private modelName = "gemini-2.5-flash";

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async sendMessage(
    history: any[], 
    message: string, 
    systemInstruction: string,
    toolHandlers: Record<string, Function>
  ) {
    // Construct request with tools
    const contents = [...history, { role: 'user', parts: [{ text: message }] }];
    
    // First turn: User -> Model (calls function)
    const result = await this.client.models.generateContent({
      model: this.modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [
          patientManagementTool, 
          appointmentSchedulerTool, 
          medicalRecordsTool, 
          billingAndInsuranceTool,
          technicalSupportTool
        ]}],
      }
    });

    const candidate = result.candidates?.[0];
    const firstPart = candidate?.content?.parts?.[0];

    // If text response (model didn't call tool, maybe asking for clarification)
    if (firstPart?.text) {
        return {
            response: result.text || firstPart.text,
            toolUsed: null,
            newHistory: [...contents, { role: 'model', parts: [{ text: result.text || firstPart.text }] }]
        };
    }

    // If tool call
    if (firstPart?.functionCall) {
        const fc = firstPart.functionCall;
        const toolName = fc.name;
        const args = fc.args;
        
        console.log(`[Coordinator] Delegating to: ${toolName}`, args);

        // Execute local logic (simulate DB)
        let toolResultStr = "Action completed successfully.";
        if (toolHandlers[toolName]) {
            toolResultStr = await toolHandlers[toolName](args);
        }

        // Second turn: Tool Result -> Model (Generates confirmation)
        // We need to send the tool call AND the tool response back to Gemini
        const toolResponseParts = [
            { functionCall: fc }, // The model's original call
            { functionResponse: { name: toolName, response: { result: toolResultStr } } } // Our result
        ];

        // Construct new history carefully manually to match API expectations if we were maintaining a session object,
        // but since we are stateless per request here (re-sending history), we append the exchange.
        // Note: For generateContent, we generally need to provide the conversation flow.
        
        const followUpContents = [
            ...contents,
            { role: 'model', parts: [{ functionCall: fc }] },
            { role: 'user', parts: [{ functionResponse: { name: toolName, response: { result: toolResultStr } } }] }
        ];

        const finalResult = await this.client.models.generateContent({
            model: this.modelName,
            contents: followUpContents,
            config: { systemInstruction } // Keep instruction
        });

        const finalResponseText = finalResult.text || "Proses selesai.";

        return {
            response: finalResponseText,
            toolUsed: toolName,
            toolResult: toolResultStr, // Return this to display in UI log
            newHistory: [...followUpContents, { role: 'model', parts: [{ text: finalResponseText }] }]
        };
    }

    return {
        response: "Maaf, terjadi kesalahan sistem.",
        toolUsed: null,
        newHistory: contents
    };
  }
}

export const aiService = new AIService();