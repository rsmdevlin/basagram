export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
}

export interface Conversation {
  id: string;
  participants: string[];
}

export default {};
