// Test file for attendance API
import attendanceApi from "@/lib/api/attendance";

// Test the attendance API functions
const testAttendanceApi = async () => {
  try {
    
    
    // Test getAttendanceRecords
    
    const records = await attendanceApi.getAttendanceRecords({ eschoolId: 1 });
    
    
    // Test getAttendanceStatistics
    
    const stats = await attendanceApi.getAttendanceStatistics(1);
    
    
    // Test getAttendanceMembers
    
    const members = await attendanceApi.getAttendanceMembers(1);
    
    
    
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Run the test
// testAttendanceApi();

export default testAttendanceApi;