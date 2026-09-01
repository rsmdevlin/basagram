import React from 'react';

interface MessageProps {
  id: string;
  content: string;
  sender: string;
  isOwn?: boolean;
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export const Message: React.FC<MessageProps> = ({
  content,
  sender,
  isOwn,
  timestamp,
  status,
}) => {
  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {sender.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Message Bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <p className="text-xs text-neutral-500 mb-1 px-3">{sender}</p>
        )}
        <div
          className={`
            px-4 py-2 rounded-lg max-w-sm break-words
            ${
              isOwn
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 text-neutral-100'
            }
          `}
        >
          <p className="text-sm">{content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-3">
          <p className="text-xs text-neutral-500">
            {timestamp
              ? new Date(timestamp).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </p>
          {isOwn && status && (
            <p className="text-xs text-neutral-500">
              {status === 'sending' && '⏳'}
              {status === 'sent' && '✓'}
              {status === 'delivered' && '✓✓'}
              {status === 'read' && '✓✓'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessageListProps {
  messages: MessageProps[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-neutral-400">Чат пуст</p>
            <p className="text-sm text-neutral-500 mt-2">
              Напишите первое сообщение, чтобы начать общение
            </p>
          </div>
        </div>
      ) : (
        messages.map((msg) => <Message key={msg.id} {...msg} />)
      )}
    </div>
  );
};
