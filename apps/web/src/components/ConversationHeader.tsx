import React from 'react';
import { SearchIcon, CallIcon, MoreIcon } from '@basagram/ui';

interface ConversationHeaderProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  onCall?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  name,
  avatar,
  isOnline,
  onCall,
}) => {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-neutral-900 border-b border-neutral-800">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-semibold">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base md:text-lg font-semibold text-white truncate">{name}</h2>
          {isOnline && <p className="text-xs text-green-500">в сети</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors" title="Поиск">
          <SearchIcon size={20} />
        </button>
        <button
          onClick={onCall}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          title="Звонок"
        >
          <CallIcon size={20} />
        </button>
        <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors" title="Еще">
          <MoreIcon size={20} />
        </button>
      </div>
    </div>
  );
};
