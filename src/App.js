import { Link, Route, Routes } from 'react-router-dom';
import { ViewActivities } from './pages/ViewActivities';
import { Activities } from './pages/Activities';
import { Login } from './pages/Login';

const Home = () => (
  <div className='border border-red-500 p-4 mt-16'>
    <h2 className='text-2xl font-bold mb-2'>Home</h2>
    <p>Welcome to our homepage!</p>
  </div>
);


export default function App() {
  return (
    <div>
      <nav className="bg-gray-800 p-2 mt-0 fixed w-full z-10 top-0 mb-4">
        <div className="container mx-auto flex flex-wrap items-center">
          <div className="flex w-full md:w-auto">
            <ul className="flex pl-0 mb-0 list-none">
              <li className="nav-item">
                <Link className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/activities">Activities</Link>
              </li>
              <li className="nav-item">
                <Link className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75" to="/view-activities">View</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="pt-16">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/view-activities" element={<ViewActivities />} />
      </Routes>
      </div>
    </div>
  );
}