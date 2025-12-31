
export interface Contact {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  createdAt: number;
}

export interface SMSLog {
  id: string;
  phone: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: number;
  type: 'outbound' | 'inbound';
}

export interface Conversation {
  id: string;
  contactId: string;
  lastMessage: string;
  timestamp: number;
  unread: boolean;
}

export interface CampaignStats {
  totalSent: number;
  totalPending: number;
  totalFailed: number;
}
