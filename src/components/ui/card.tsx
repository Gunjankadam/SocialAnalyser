import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => (
  <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

// CardHeader component
interface CardHeaderProps {
  children: React.ReactNode;
}

export const CardHeader = ({ children }: CardHeaderProps) => (
  <div className="pb-4 border-b border-gray-200">{children}</div>
);

// CardTitle component
interface CardTitleProps {
  children: React.ReactNode;
}

export const CardTitle = ({ children }: CardTitleProps) => (
  <h2 className="text-2xl font-semibold">{children}</h2>
);

// CardDescription component
interface CardDescriptionProps {
  children: React.ReactNode;
}

export const CardDescription = ({ children }: CardDescriptionProps) => (
  <p className="text-sm text-gray-600">{children}</p>
);

// CardContent component
export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="py-4">{children}</div>
);

// Corrected CardFooter component
interface CardFooterProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  className?: string; // Allow className in CardFooter
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => {
  return (
    <div className={`pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};
