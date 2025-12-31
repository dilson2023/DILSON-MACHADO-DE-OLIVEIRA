
import React from 'react';
import { History, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { SMSLog } from '../types';

interface LogsProps {
  logs: SMSLog[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Transmission Logs</h2>
        <p className="text-zinc-400">Audit trail of all system activities.</p>
      </div>

      <div className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-500 text-xs font-semibold uppercase tracking-wider border-b border-zinc-800">
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Recipient</th>
              <th className="px-6 py-4">Message Content</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4 text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-bold uppercase ${
                    log.status === 'sent' ? 'text-green-500' : log.status === 'failed' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {log.status === 'sent' && <CheckCircle2 size={14} />}
                    {log.status === 'failed' && <XCircle size={14} />}
                    {log.status === 'pending' && <Clock size={14} />}
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="mono text-sm">{log.phone}</span>
                </td>
                <td className="px-6 py-4 max-w-xs xl:max-w-md">
                  <p className="text-sm text-zinc-300 truncate" title={log.message}>
                    {log.message}
                  </p>
                </td>
                <td className="px-6 py-4 text-zinc-500 text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-600 hover:text-indigo-400 transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="p-20 text-center">
            <History size={64} className="mx-auto text-zinc-800 mb-6" />
            <h3 className="text-xl font-bold mb-2">Clear History</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">No messages have been processed yet. Start a campaign to see the delivery logs populate.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
