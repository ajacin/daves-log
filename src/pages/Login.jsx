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
  }, [navigate, user]);

  return (
    <section className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 p-4">
      <h1 className="mb-6 text-2xl text-white shadow-lg shadow-black w-full rounded-md p-2 justify-center text-center max-w-sm">
        4292 FALCONS
      </h1>
      <div className=" shadow-lg shadow-black w-full rounded-md p-2 justify-center text-center max-w-sm">
        <form className="w-full max-w-sm">
          <div className="my-6 mx-2">
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
          <div className="my-6 mx-2">
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
          <div className="flex items-center justify-end gap-2 mx-2 my-6">
            <button
              className="ml-4 bg-white hover:bg-purple-100 text-purple-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => user.register(email, password)}
            >
              Create account
            </button>
            <button
              className=" bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
