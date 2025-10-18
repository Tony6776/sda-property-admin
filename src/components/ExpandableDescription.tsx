import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ExpandableDescriptionProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({ 
  text, 
  maxLength = 100, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text || text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }
  
  const truncatedText = text.slice(0, maxLength).trim();
  
  return (
    <p className={className}>
      {isExpanded ? text : `${truncatedText}...`}
      {' '}
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs text-primary hover:text-primary/80"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'less' : 'more'}
      </Button>
    </p>
  );
};