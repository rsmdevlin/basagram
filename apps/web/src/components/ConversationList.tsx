import React from 'react';

interface ConversationListProps {
  conversations?: Array<{
    id: string;
    name: string;
    avatar?: string;
    lastMessage?: string;
    unreadCount?: number;
  }>;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations = [] }) => {
  return (
    <div className="w-full md:w-80 border-r border-neutral-800 h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 z-10">
        <h2 className="text-lg font-semibold text-white mb-4">Мои чаты</h2>
        <input
          type="text"
          placeholder="Поиск чатов..."
          className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Conversations */}
      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-neutral-400 mb-2">Нет чатов</p>
            <p className="text-sm text-neutral-500">Начните новый чат, чтобы начать общение</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              name={conv.name}
              lastMessage={conv.lastMessage}
              unreadCount={conv.unreadCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ConversationItemProps {
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  name,
  lastMessage,
  unreadCount,
}) => {
  return (
    <div className="px-4 py-3 border-b border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{name}</h3>
          {lastMessage && (
            <p className="text-sm text-neutral-400 truncate mt-1">{lastMessage}</p>
          )}
        </div>
        {unreadCount ? (
          <div className="ml-2 px-2 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        ) : null}
      </div>
    </div>
  );
};
