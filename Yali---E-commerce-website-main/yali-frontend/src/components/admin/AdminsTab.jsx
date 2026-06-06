import { ToggleSwitch } from './ToggleSwitch';

export function AdminsTab({
  users,
  categoriesList,
  handleToggleUserStatus,
  handleUserRoleChange
}) {
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-950">System Administrators Directory</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
              <th className="p-4 rounded-l-lg">Admin Name</th>
              <th className="p-4">Contact Email & Phone</th>
              <th className="p-4">Access Status</th>
              <th className="p-4">Admin Category Lock</th>
              <th className="p-4 text-right rounded-r-lg">Actions / Role</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(u => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-950">{u.name}</div>
                  <span className="inline-block font-semibold px-2 py-0.5 rounded text-[10px] uppercase bg-purple-100 text-purple-700">
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <div>{u.email}</div>
                  <div className="text-xs text-gray-500">{u.phone || 'No phone'}</div>
                </td>
                <td className="p-4">
                  <ToggleSwitch 
                    checked={u.status === 'active'}
                    onChange={() => handleToggleUserStatus(u.id, u.status)}
                    activeLabel="Active"
                    inactiveLabel="Disabled"
                  />
                </td>
                <td className="p-4">
                  <select
                    value={u.managed_category || 'all'}
                    onChange={(e) => handleUserRoleChange(u.id, u.role, e.target.value === 'all' ? null : e.target.value)}
                    disabled={u.role !== 'admin'}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="all">Full Access (All)</option>
                    {categoriesList.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={u.role || 'customer'}
                    onChange={(e) => handleUserRoleChange(u.id, e.target.value, u.managed_category)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">No admin accounts registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
