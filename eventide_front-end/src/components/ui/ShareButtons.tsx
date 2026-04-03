// src/components/Event/ShareButtons.tsx
import React from 'react';
import { Button } from '@heroui/react';
import { MailIcon, Link2Icon } from 'lucide-react';

const ShareButtons: React.FC = () => {
  return (
    <>
      <div className='flex gap-3'>
        <Button isIconOnly variant="solid" size="sm" aria-label="Share via Email"><MailIcon /></Button>
      <Button isIconOnly variant="solid" size="sm" aria-label="Copy link"><Link2Icon /></Button>
      </div>
    </>
  );
};

export default ShareButtons;
