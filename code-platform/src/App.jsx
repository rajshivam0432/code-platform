import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import ProblemDashboard from "./pages/Dashboard.jsx";
import CodeEditor from "./Components/CodeEditor.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProtectedRoute from "./Components/ProtectedRoute .jsx";

function App() {
  return (
    <Router>
      <Navbar />

      <div className="pt-16">
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/problem-dashboard"
            element={
              <ProtectedRoute>
                <ProblemDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute>
                <CodeEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
