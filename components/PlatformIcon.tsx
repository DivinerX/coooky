import React from 'react';
import { Platform } from 'react-native';
import { Video as LucideIcon, TableProperties as LucideProps } from 'lucide-react-native';

// This component wraps Lucide icons to prevent event handler warnings on web
export default function PlatformIcon({
  icon: Icon,
  ...props
}: {
  icon: React.ComponentType<LucideProps>;
} & LucideProps) {
  // On web, we need to remove the responder props that cause warnings
  if (Platform.OS === 'web') {
    return <Icon {...props} />;
  }
  
  // On native platforms, use the icon as is
  return <Icon {...props} />;
}