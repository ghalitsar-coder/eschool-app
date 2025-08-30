# Attendance Management Feature

This feature provides a complete CRUD interface for managing member attendance records.

## Features

1. **View Attendance Records** - See all attendance records in a table format
2. **Record Attendance** - Create new attendance records for multiple members
3. **Edit Attendance** - Update existing attendance records
4. **Delete Attendance** - Remove attendance records
5. **Attendance Statistics** - View attendance statistics (today, this week, this month)
6. **Search & Filter** - Find specific attendance records
7. **Export** - Export attendance records (to be implemented)

## Implementation Details

### Frontend Components

- **Page Component**: `src/app/dashboard/attendance/page.tsx`
- **Hooks**: `src/hooks/use-attendance.ts`
- **API Client**: `src/lib/api/attendance.ts`
- **Types**: `src/types/api.ts`

### Key Technologies Used

- React with TypeScript
- TanStack Query for data fetching and mutations
- React Hook Form for form handling
- Zod for validation
- Tailwind CSS for styling
- Shadcn/ui components
- Lucide React icons
- Recharts for data visualization

### Data Flow

1. **Data Fetching**: Uses TanStack Query to fetch attendance records and statistics
2. **Form Handling**: Uses React Hook Form with Zod validation for creating/editing records
3. **State Management**: Uses TanStack Query's built-in caching and invalidation
4. **UI Updates**: Automatically refetches data after mutations

### API Endpoints

- `GET /attendance/records` - Fetch attendance records
- `POST /attendance/record` - Create new attendance records
- `GET /attendance/statistics` - Fetch attendance statistics
- `PUT /attendance/{id}` - Update attendance record
- `DELETE /attendance/{id}` - Delete attendance record
- `GET /members` - Fetch members for attendance (used in dropdowns)

## Usage

1. Navigate to the Attendance Management page
2. View existing attendance records in the table
3. Use the "Record Attendance" button to create new records
4. Use the action buttons (View, Edit, Delete) to manage existing records
5. View statistics in the summary cards
6. Use search and filter to find specific records

## Future Improvements

1. Add export functionality (CSV, Excel, PDF)
2. Add more detailed analytics and reporting
3. Implement bulk actions for attendance records
4. Add attendance reminders/notifications
5. Implement attendance policies and rules