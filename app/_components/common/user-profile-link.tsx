import Link from 'next/link';
import { User } from 'lucide-react';

interface UserProfileLinkProps {
  username: string;
  name?: string;
  imageUrl?: string;
  className?: string;
  showAvatar?: boolean;
  children?: React.ReactNode;
}

export function UserProfileLink({ 
  username, 
  name, 
  imageUrl, 
  className = "",
  showAvatar = true,
  children 
}: UserProfileLinkProps) {
  return (
    <Link 
      href={`/user/${username}`}
      className={`inline-flex items-center gap-2 hover:text-blue-600 transition-colors ${className}`}
    >
      {showAvatar && (
        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name || username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              <User className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
      {children || name || username}
    </Link>
  );
}
