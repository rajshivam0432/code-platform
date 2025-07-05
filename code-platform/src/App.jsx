import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import ProblemDashboard from "./pages/Dashboard.jsx";
import CodeEditor from "./Components/CodeEditor.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProtectedRoute from "./Components/ProtectedRoute .jsx";
import CollaborativePlace from "./Components/CollaborativePlace.jsx";
import LandingPage from "./Components/LandingPage.jsx";
import HomePage  from "./pages/HomePage.jsx"

function App() {
  return (
    <Router>
      <Navbar />

      <div className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <CollaborativePlace />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/problem-dashboard" element={<ProblemDashboard />} />
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
