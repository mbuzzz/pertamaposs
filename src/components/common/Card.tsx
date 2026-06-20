import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]',
        'transition-all duration-200 ease-out',
        {
          'cursor-pointer active:scale-[0.98] tablet:hover:shadow-[0_15px_45px_rgb(0,0,0,0.06)] tablet:hover:scale-[1.01] tablet:hover:-translate-y-0.5':
            hoverable || onClick,
        },
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
