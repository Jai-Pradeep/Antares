import { useState, useEffect } from "react";
import Login from "./pages/Login";
import API, { setAuthToken } from "./services/api";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthToken(token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    }
  }, []);

    const handleLogout = () => {
      localStorage.removeItem("token");
      delete API.defaults.headers.common["Authorization"]
      setUser(null);
    };

  if (!user) return <Login setUser={setUser} />;
  
  return (
    <div>
      <h3>Logged in as {user.role}</h3>

      <button onClick={() => {
        localStorage.removeItem("token");
        setUser(null);
      }}>
        Logout
      </button>
    </div>
  );
}

export default App;
