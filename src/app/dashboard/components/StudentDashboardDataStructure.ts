// State snapshot for student dashboard data structure
// This represents the data structure for a student who can have multiple roles across different eschools

interface User {
  id: number;
  name: string;
  email: string;
  base_role: "siswa";
  is_system_admin: boolean;
}

interface KasSummary {
  total_balance?: number;
  monthly_target?: number;
  collection_rate?: number;
  pending_approvals?: number;
  personal_balance?: number;
  payment_status?: 'up_to_date' | 'overdue' | 'partial';
}

interface AttendanceSummary {
  total_meetings: number;
  attended: number;
  attendance_rate: number;
}

interface EschoolRole {
  eschool_id: number;
  eschool_name: string;
  school_id: number;
  role_in_eschool: "member" | "bendahara" | "koordinator";
  permissions: string[];
  assigned_at: string;
  status: 'active' | 'inactive';
  kas_summary: KasSummary;
  attendance_summary: AttendanceSummary;
}

interface PerformanceMetrics {
  avg_attendance_rate: number;
  total_kas_managed: number;
  total_personal_kas: number;
  overall_activity_score: number;
}

interface OverallSummary {
  total_eschools: number;
  roles: {
    koordinator: number;
    bendahara: number;
    member: number;
  };
  performance: PerformanceMetrics;
}

interface RecentActivity {
  type: 'kas_transaction' | 'attendance' | 'role_assignment';
  eschool_name: string;
  description: string;
  amount?: number;
  date: string;
  role_context: string;
}

// Main data structure for student dashboard
interface StudentDashboardData {
  user: User;
  eschool_roles: EschoolRole[];
  overall_summary: OverallSummary;
  recent_activities: RecentActivity[];
}

// Example data structure for the dashboard
const exampleStudentDashboardData: StudentDashboardData = {
  user: {
    id: 1,
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    base_role: "siswa",
    is_system_admin: false
  },
  eschool_roles: [
    {
      eschool_id: 1,
      eschool_name: "Basket",
      school_id: 1,
      role_in_eschool: "bendahara",
      permissions: ["manage_kas", "view_attendance", "view_members"],
      assigned_at: "2024-01-15",
      status: "active",
      kas_summary: {
        total_balance: 5000000,
        monthly_target: 25000,
        collection_rate: 92,
        pending_approvals: 2,
        personal_balance: 25000,
        payment_status: "up_to_date"
      },
      attendance_summary: {
        total_meetings: 20,
        attended: 18,
        attendance_rate: 90
      }
    },
    {
      eschool_id: 2,
      eschool_name: "Voli",
      school_id: 1,
      role_in_eschool: "member",
      permissions: ["view_attendance", "view_kas"],
      assigned_at: "2024-02-01",
      status: "active",
      kas_summary: {
        total_balance: 0,
        monthly_target: 25000,
        collection_rate: 88,
        pending_approvals: 0,
        personal_balance: 25000,
        payment_status: "up_to_date"
      },
      attendance_summary: {
        total_meetings: 18,
        attended: 16,
        attendance_rate: 89
      }
    },
    {
      eschool_id: 3,
      eschool_name: "Lukis",
      school_id: 1,
      role_in_eschool: "member",
      permissions: ["view_attendance", "view_kas"],
      assigned_at: "2024-02-10",
      status: "active",
      kas_summary: {
        total_balance: 0,
        monthly_target: 25000,
        collection_rate: 96,
        pending_approvals: 0,
        personal_balance: 25000,
        payment_status: "up_to_date"
      },
      attendance_summary: {
        total_meetings: 15,
        attended: 14,
        attendance_rate: 93
      }
    }
  ],
  overall_summary: {
    total_eschools: 3,
    roles: {
      koordinator: 0,
      bendahara: 1,
      member: 2
    },
    performance: {
      avg_attendance_rate: 90.67,
      total_kas_managed: 5000000,
      total_personal_kas: 75000,
      overall_activity_score: 92
    }
  },
  recent_activities: [
    {
      type: "kas_transaction",
      eschool_name: "Basket",
      description: "Membayar kas bulan Maret 2024",
      amount: 25000,
      date: "2024-03-05",
      role_context: "bendahara"
    },
    {
      type: "attendance",
      eschool_name: "Voli",
      description: "Hadir di pertemuan mingguan",
      date: "2024-03-10",
      role_context: "member"
    },
    {
      type: "kas_transaction",
      eschool_name: "Lukis",
      description: "Membayar kas bulan Maret 2024",
      amount: 25000,
      date: "2024-03-12",
      role_context: "member"
    },
    {
      type: "attendance",
      eschool_name: "Basket",
      description: "Hadir di pertemuan mingguan",
      date: "2024-03-15",
      role_context: "bendahara"
    }
  ]
};

export type { 
  StudentDashboardData, 
  User, 
  KasSummary, 
  AttendanceSummary, 
  EschoolRole, 
  PerformanceMetrics, 
  OverallSummary, 
  RecentActivity 
};

export { exampleStudentDashboardData };