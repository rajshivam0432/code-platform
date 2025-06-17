import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <a href="/" className="text-xl font-bold hover:text-blue-400">
          CodePlatform
        </a>

        <div className="flex items-center gap-10">
          <a href="/problem-dashboard" className="hover:text-blue-400">
            Dashboard
          </a>

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
                className="bg-blue-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-blue-600 px-3 py-1 rounded hover:bg-red-700"
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
