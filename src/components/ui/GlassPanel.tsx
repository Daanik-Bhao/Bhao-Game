import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'green';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlassPanel({
  children,
  variant = 'light',
  padding = 'md',
  className = '',
  style = {},
  ...props
}: GlassPanelProps) {
  
  const getBackground = () => {
    switch(variant) {
      case 'dark': return 'rgba(15, 23, 42, 0.6)';
      case 'green': return 'rgba(21, 128, 61, 0.05)';
      case 'light':
      default: return '#ffffff';
    }
  };

  const getPadding = () => {
    switch(padding) {
      case 'sm': return '16px 20px';
      case 'lg': return '40px 48px';
      case 'md':
      default: return '32px 36px';
    }
  };

  const getBorder = () => {
    switch(variant) {
      case 'dark': return '1px solid rgba(255, 255, 255, 0.1)';
      case 'green': return '1px solid rgba(21, 128, 61, 0.1)';
      case 'light':
      default: return '1px solid rgba(21, 128, 61, 0.05)';
    }
  };

  const baseStyle: React.CSSProperties = {
    background: getBackground(),
    borderRadius: 24,
    padding: getPadding(),
    border: getBorder(),
    boxShadow: variant === 'light' 
      ? '0 12px 40px rgba(21, 128, 61, 0.06), 0 1px 3px rgba(0,0,0,0.05)'
      : '0 8px 32px rgba(0, 0, 0, 0.2)',
    backdropFilter: variant !== 'light' ? 'blur(12px)' : 'none',
    ...style
  };

  return (
    <div className={`glass-panel ${className}`} style={baseStyle} {...props}>
      {children}
    </div>
  );
}
