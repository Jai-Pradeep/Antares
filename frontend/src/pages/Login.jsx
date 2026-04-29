import { useState } from "react";
import API, { setAuthToken } from "../services/api";

export default function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
      try {
          const res = await API.post("/auth/login", { email, password });

          const token = res.data.token;

          localStorage.setItem("token", token);
          setAuthToken(token);

          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser(payload);

      } catch (err) {
          console.log(err.response?.data || err.message);
          alert("Login failed");
      }
    };

    return (
      <div>
        <h2>Login</h2>

        <input placeholder="email" onChange={e => setEmail(e.target.value)}/>
        <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)}/>

        <button onClick={handleLogin}>Login</button>
      </div>
    );
}
