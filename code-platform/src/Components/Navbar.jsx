import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { user, logout, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleShareLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert("🔗 Link copied! Share it to start collaborative coding.");
  };

  // Only show collaboration button on the editor page
  const isEditorPage = location.pathname.startsWith("/editor/");

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <a href="/" className="text-xl font-bold hover:text-blue-400">
          CodePlatform
        </a>

        <div className="flex items-center gap-6">
          <a href="/problem-dashboard" className="hover:text-blue-400">
            Dashboard
          </a>

          {isEditorPage && (
            <button
              onClick={handleShareLink}
              className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-sm"
            >
              🤝 Share Collaboration Link
            </button>
          )}

          {isLoggedIn ? (
            <>
              <span className="text-sm">
                Hello, {user?.username || "Coder"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/"
                className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
