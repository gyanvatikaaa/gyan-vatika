import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";

import AdminOverview from "./pages/admin/AdminOverview";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Tests from "./pages/admin/Tests";
import Review from "./pages/shared/Review";
import Linking from "./pages/admin/Linking";
import Fees from "./pages/admin/Fees";
import StudentProgressView from "./pages/shared/StudentProgressView";
import StudentRecords from "./pages/shared/StudentRecords";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import StudentDetail from "./pages/tutor/StudentDetail";
import ParentDashboard from "./pages/parent/ParentDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import AvailableTests from "./pages/student/AvailableTests";
import TakeTest from "./pages/student/TakeTest";
import Results from "./pages/student/Results";
import Progress from "./pages/student/Progress";
import AdminAssignments from "./pages/admin/Assignments";
import StudentAssignments from "./pages/student/Assignments";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tests"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Tests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Review />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/review"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <Review />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/tests"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <Tests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/linking"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Linking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Fees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/assignments"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <AdminAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/student/:studentId"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/tests"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <Tests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/progress/:studentId"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <StudentProgressView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/progress/:studentId"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <StudentProgressView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <TutorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/tests"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AvailableTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/tests/:testId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <TakeTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:submissionId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/progress"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/records"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/records/:studentId"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <StudentRecords />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
