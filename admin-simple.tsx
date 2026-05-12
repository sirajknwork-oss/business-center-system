"use client";

import { useState } from "react";

export default function AdminSimple() {
  const [adminUsers, setAdminUsers] = useState([
    {
      id: '1',
      name: 'Sample Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log('📝 Form submitted:', formData);
    
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🔄 Adding user:', newUser);
    setAdminUsers([newUser, ...adminUsers]);
    setFormData({ name: '', email: '', password: '', role: 'admin' });
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Simple Admin Creation Test</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create Admin User</h2>
          
          <div className="grid gap-4">
            <div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
                  required
                />
              </label>
            </div>
            
            <div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
                  required
                />
              </label>
            </div>
            
            <div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
                  required
                />
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Admin User
            </button>
          </div>
        </form>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Admin Records</h2>
          
          {adminUsers.length === 0 ? (
            <p className="text-center text-slate-600">No admin records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Password</th>
                    <th className="px-4 py-2 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.password}</td>
                      <td className="px-4 py-2">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
