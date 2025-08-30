// Test file for attendance API
import attendanceApi from "@/lib/api/attendance";

// Test the attendance API functions
const testAttendanceApi = async () => {
  try {
    console.log("Testing attendance API...");
    
    // Test getAttendanceRecords
    console.log("Testing getAttendanceRecords...");
    const records = await attendanceApi.getAttendanceRecords({ eschoolId: 1 });
    console.log("Attendance records:", records);
    
    // Test getAttendanceStatistics
    console.log("Testing getAttendanceStatistics...");
    const stats = await attendanceApi.getAttendanceStatistics(1);
    console.log("Attendance statistics:", stats);
    
    // Test getAttendanceMembers
    console.log("Testing getAttendanceMembers...");
    const members = await attendanceApi.getAttendanceMembers(1);
    console.log("Attendance members:", members);
    
    console.log("All tests passed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Run the test
// testAttendanceApi();

export default testAttendanceApi;