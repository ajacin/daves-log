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
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <section className="flex flex-col items-center justify-center h-screen bg-white p-4">
      <h1 className="mb-6 text-2xl text-purple-700 w-full rounded-md p-2 text-center max-w-sm">
        4292 FALCONS
      </h1>
      <div className="w-full max-w-sm">
        <form className="w-full">
          <div className="my-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="my-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-end gap-4 my-6">
            <button
              className="text-purple-700 font-bold py-2 px-4 rounded focus:outline-none"
              type="button"
              onClick={() => user.register(email, password)}
            >
              Don't have an account?
            </button>
            <button
              className="shadow-lg bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
              type="button"
              onClick={() => user.login(email, password)}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
