import { useUser } from "../lib/context/user";

export function Navbar() {
    const user = useUser();
  
    return (
        <nav className="flex items-center justify-between flex-wrap bg-blue-500 p-6">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
                <a href="/" className="font-semibold text-xl tracking-tight">Idea tracker</a>
            </div>
            <div className="block">
                {user.current ? (
                    <div className="flex gap-1">
                        {/* <span className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">{user.current.email}</span> */}
                        <a href="/activities" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">Activities</a>
                        <a href="/view-activities" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">View Activities</a>
                        <button 
                            type="button" 
                            onClick={() => user.logout()} 
                            className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0 ml-2"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <a href="/login" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">Login</a>
                )}
            </div>
        </nav>
    );
}