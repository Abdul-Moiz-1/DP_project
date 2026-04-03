import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';



interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}




export default function BackButton({ onClick, className }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <Button
      isIconOnly
      variant="bordered"
      className={className}
      onPress={() => (onClick ? onClick() : navigate(-1))}
    >
      ←
    </Button>
  );
}
