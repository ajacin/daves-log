import { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useNavigate } from "react-router-dom";

export function Login() {
  const user = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user.current) {
      return navigate("/activities");
    }
  }, [navigate, user]);

  return (
    <section className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="mb-6 text-3xl font-bold text-gray-700">
        Login or register
      </h1>
      <form className="w-full max-w-sm">
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => user.login(email, password)}
          >
            Login
          </button>
          <button
            className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => user.register(email, password)}
          >
            Signup
          </button>
        </div>
      </form>
    </section>
  );
}
