import { useGetAllUsersQuery, useBlockUserMutation } from "../../features/admin/adminApiSlice";
import { toast } from "sonner";
import AdminSidebar from "../../Components/AdminSidebar";

export default function ManageUsers() {
    const { data: users, isLoading } = useGetAllUsersQuery();
    const [blockUser] = useBlockUserMutation();

    const handleBlockUser = async (userId, currentStatus) => {
        try {
            await blockUser({ userId }).unwrap();
            toast.success(currentStatus ? "User unblocked" : "User blocked");
        } catch (error) {
            console.error("Failed to block user:", error);
            toast.error("Failed to update user status");
        }
    }

    const xFonts = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif' };

    if (isLoading) return <div className="h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="flex min-h-screen bg-black text-[#e7e9ea] font-sans" style={xFonts}>
            <aside className="hidden lg:block w-72 h-screen sticky top-0 border-r border-zinc-800 p-4">
                <AdminSidebar />
            </aside>

            <main className="flex-1 p-8 lg:p-12">
                <header className="mb-12 border-b border-zinc-800 pb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight">Users</h1>
                    <p className="text-zinc-500 mt-2 font-medium text-lg">Manage user accounts and access control.</p>
                </header>

                <div className="bg-[#121212] rounded-[32px] border border-zinc-800 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-black border-b border-zinc-800">
                            <tr>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">User</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-right text-xs font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {users && users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="group hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
                                                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                                    alt=""
                                                />
                                                <div>
                                                    <div className="text-sm font-bold text-white">{user.name}</div>
                                                    <div className="text-xs text-zinc-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                user.role === 'startup' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-green-500/10 text-green-500 border-green-500/20'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.isBlocked ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-sm font-medium">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleBlockUser(user._id, user.isBlocked)}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${user.isBlocked
                                                        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                                        : 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white'
                                                        }`}
                                                >
                                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-zinc-500 font-bold">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}