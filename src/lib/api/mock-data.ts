// mock-data.ts - Mock data for development/testing
import { KasRecord, Member } from "@/types/api";
import { KasSummary } from "./kas";

// Mock members data
export const mockMembers: Member[] = [
  {
    id: 1,
    name: "Ahmad Rizki",
    email: "ahmad.rizki@example.com",
    phone: "081234567890",
    school_id: 1,
    eschool_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@example.com",
    phone: "081234567891",
    school_id: 1,
    eschool_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "081234567892",
    school_id: 1,
    eschool_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    email: "dewi.lestari@example.com",
    phone: "081234567893",
    school_id: 1,
    eschool_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    name: "Eko Prasetyo",
    email: "eko.prasetyo@example.com",
    phone: "081234567894",
    school_id: 1,
    eschool_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Mock kas records data
export const mockKasRecords: KasRecord[] = [
  {
    id: 1,
    member_id: 1,
    type: "income",
    amount: 50000,
    description: "Monthly dues - January",
    date: "2024-01-15",
    created_by: 1,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    member: mockMembers[0],
  },
  {
    id: 2,
    member_id: 2,
    type: "income",
    amount: 50000,
    description: "Monthly dues - January",
    date: "2024-01-15",
    created_by: 1,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    member: mockMembers[1],
  },
  {
    id: 3,
    member_id: 3,
    type: "income",
    amount: 50000,
    description: "Monthly dues - January",
    date: "2024-01-16",
    created_by: 1,
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T09:00:00Z",
    member: mockMembers[2],
  },
  {
    id: 4,
    member_id: 0,
    type: "expense",
    amount: 75000,
    description: "Basketball equipment purchase",
    date: "2024-01-20",
    created_by: 1,
    created_at: "2024-01-20T14:00:00Z",
    updated_at: "2024-01-20T14:00:00Z",
  },
  {
    id: 5,
    member_id: 4,
    type: "income",
    amount: 50000,
    description: "Monthly dues - January",
    date: "2024-01-22",
    created_by: 1,
    created_at: "2024-01-22T11:00:00Z",
    updated_at: "2024-01-22T11:00:00Z",
    member: mockMembers[3],
  },
  {
    id: 6,
    member_id: 0,
    type: "expense",
    amount: 25000,
    description: "Training venue rental",
    date: "2024-01-25",
    created_by: 1,
    created_at: "2024-01-25T16:00:00Z",
    updated_at: "2024-01-25T16:00:00Z",
  },
  {
    id: 7,
    member_id: 5,
    type: "income",
    amount: 50000,
    description: "Monthly dues - January",
    date: "2024-01-28",
    created_by: 1,
    created_at: "2024-01-28T13:00:00Z",
    updated_at: "2024-01-28T13:00:00Z",
    member: mockMembers[4],
  },
  {
    id: 8,
    member_id: 1,
    type: "income",
    amount: 50000,
    description: "Monthly dues - February",
    date: "2024-02-15",
    created_by: 1,
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z",
    member: mockMembers[0],
  },
  {
    id: 9,
    member_id: 0,
    type: "expense",
    amount: 150000,
    description: "Tournament registration fee",
    date: "2024-02-20",
    created_by: 1,
    created_at: "2024-02-20T15:00:00Z",
    updated_at: "2024-02-20T15:00:00Z",
  },
  {
    id: 10,
    member_id: 2,
    type: "income",
    amount: 50000,
    description: "Monthly dues - February",
    date: "2024-02-22",
    created_by: 1,
    created_at: "2024-02-22T11:30:00Z",
    updated_at: "2024-02-22T11:30:00Z",
    member: mockMembers[1],
  },
];

// Calculate mock summary
export const mockKasSummary: KasSummary = {
  total_income: mockKasRecords
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + record.amount, 0),
  total_expense: mockKasRecords
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + record.amount, 0),
  balance: mockKasRecords.reduce((balance, record) => {
    return record.type === "income"
      ? balance + record.amount
      : balance - record.amount;
  }, 0),
  total_records: mockKasRecords.length,
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to generate new ID
export const generateNewId = () =>
  Math.max(...mockKasRecords.map((r) => r.id)) + 1;
