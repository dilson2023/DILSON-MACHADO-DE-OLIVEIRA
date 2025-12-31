
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, MoreHorizontal, UserPlus, Users } from 'lucide-react';
import { Contact } from '../types';

interface ContactsProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, setContacts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    
    const newContact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      phone: newPhone,
      active: true,
      createdAt: Date.now()
    };
    
    setContacts(prev => [...prev, newContact]);
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const toggleActive = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recipient Database</h2>
          <p className="text-zinc-400">Manage your leads and subscribers.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          Add Recipient
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#111113] border border-indigo-500/30 p-6 rounded-2xl animate-in zoom-in-95 duration-200">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm text-zinc-400">Full Name</label>
              <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: John Doe"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm text-zinc-400">Phone Number (with country code)</label>
              <input 
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ex: +5511999999999"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button type="submit" className="flex-1 md:flex-none bg-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Save</button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 md:flex-none bg-zinc-800 px-6 py-2 rounded-lg font-medium hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Search size={18} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by name or number..." 
            className="bg-transparent border-none outline-none text-sm flex-1 text-zinc-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Phone Number</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map((contact) => (
              <tr key={contact.id} className="hover:bg-zinc-900/30 transition-colors group">
                <td className="px-6 py-4 font-medium">{contact.name}</td>
                <td className="px-6 py-4 text-zinc-400 mono text-sm">{contact.phone}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleActive(contact.id)}
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full transition-colors ${
                      contact.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}
                  >
                    {contact.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-zinc-500 text-sm">{new Date(contact.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteContact(contact.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            {/* Added missing 'Users' icon from lucide-react */}
            <Users size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500">No contacts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
