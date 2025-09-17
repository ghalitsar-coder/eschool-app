# Student Dashboard with Multi-Role Support

## Overview

This enhanced student dashboard provides a comprehensive view of a student's participation across multiple eschools with different roles (member, bendahara, koordinator). The dashboard includes:

1. **Overview Tab**: Shows overall statistics and role distribution
2. **Individual Eschool Tabs**: Detailed view for each eschool the student is part of
3. **Visual Analytics**: Charts comparing attendance and kas payment across eschools
4. **Recent Activities**: Timeline of recent activities across all eschools

## Components

### 1. StudentDashboardEnhanced.tsx
Main dashboard component that implements tabs for different roles and memberships.

### 2. StudentDashboardDataStructure.ts
Defines the TypeScript interfaces for the student dashboard data structure.

### 3. AttendanceStatistics.tsx
Component for displaying attendance comparison charts.

### 4. KasPaymentHistory.tsx
Component for displaying kas payment history and comparison charts.

### 5. ComparisonCharts.tsx
Combined component for displaying all comparison charts (attendance, kas, role distribution).

### 6. RecentActivities.tsx
Component for displaying recent activities across all eschools.

## Features

### Multi-Role Support
Students can have different roles in different eschools:
- **Member**: Regular participant in an eschool
- **Bendahara**: Treasurer role in an eschool
- **Koordinator**: Coordinator role in an eschool

### Tab-Based Navigation
The dashboard uses tabs to organize information:
- **Overview Tab**: Shows overall statistics and role distribution
- **Individual Eschool Tabs**: Each eschool gets its own tab with detailed information

### Visual Analytics
The dashboard includes several charts for better data visualization:
- Attendance comparison across eschools
- Kas payment comparison across eschools
- Role distribution pie chart
- Individual eschool attendance and payment charts

### Recent Activities
Shows a timeline of recent activities across all eschools with details including:
- Activity type (attendance, kas transaction, role assignment)
- Eschool name
- Description
- Amount (for financial transactions)
- Date
- Role context

## Data Structure

The dashboard uses the multi-role profile data structure defined in `StudentDashboardDataStructure.ts`:

```typescript
interface StudentDashboardData {
  user: User;
  eschool_roles: EschoolRole[];
  overall_summary: OverallSummary;
  recent_activities: RecentActivity[];
}
```

Each `EschoolRole` contains:
- Eschool information
- Role in that eschool
- Attendance summary
- Kas summary
- Permissions

## Usage

The enhanced student dashboard is automatically used when a student accesses the dashboard. The component handles:
- Loading states
- Error states
- Data visualization
- Responsive design
- Tab navigation

## Customization

The dashboard can be customized by modifying:
- Color schemes in the chart components
- Data formatting functions
- Layout and styling using Tailwind CSS classes
- Additional metrics or charts as needed