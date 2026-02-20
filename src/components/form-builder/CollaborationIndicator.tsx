import React, { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

interface Collaborator {
  userId: string;
  instanceId: string;
  lastSeen: Date;
  isActive: boolean;
}

interface CollaboratorProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CollaborationIndicatorProps {
  collaborators: Collaborator[];
  isRealtimeConnected: boolean;
}

export const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({
  collaborators,
  isRealtimeConnected
}) => {
  const [profiles, setProfiles] = useState<Map<string, CollaboratorProfile>>(new Map());
  const activeCollaborators = collaborators.filter(c => c.isActive);

  // Fetch profile data for collaborators
  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = activeCollaborators
        .map(c => c.userId)
        .filter(id => id && !profiles.has(id));
      
      if (userIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        if (error) {
          console.error('Error fetching collaborator profiles:', error);
          return;
        }

        const newProfiles = new Map(profiles);
        (data || []).forEach(profile => {
          newProfiles.set(profile.id, {
            userId: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
          });
        });
        setProfiles(newProfiles);
      } catch (err) {
        console.error('Error in fetchProfiles:', err);
      }
    };

    fetchProfiles();
  }, [activeCollaborators.map(c => c.userId).join(',')]);

  const getCollaboratorName = (collaborator: Collaborator, index: number): string => {
    const profile = profiles.get(collaborator.userId);
    if (profile) {
      if (profile.firstName || profile.lastName) {
        return `${profile.firstName} ${profile.lastName}`.trim();
      }
      if (profile.email) {
        return profile.email.split('@')[0];
      }
    }
    return `Editor ${index + 1}`;
  };

  const getTimeSince = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return 'a while ago';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Realtime Connection Status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={isRealtimeConnected ? "secondary" : "destructive"} className="gap-1">
              {isRealtimeConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isRealtimeConnected ? 'Connected' : 'Offline'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isRealtimeConnected 
                ? 'Real-time collaboration is active' 
                : 'Working offline - changes will sync when connection is restored'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Active Collaborators */}
      {activeCollaborators.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {activeCollaborators.length} editing
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Other editors:</p>
                {activeCollaborators.map((collaborator, index) => (
                  <p key={collaborator.instanceId} className="text-sm">
                    {getCollaboratorName(collaborator, index)} (active {getTimeSince(collaborator.lastSeen)})
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
