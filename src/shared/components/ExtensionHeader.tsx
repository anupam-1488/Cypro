/**
 * Extension Header Component - Logo and actions on ends only
 * @module @voilajsx/comet
 * @file src/shared/components/ExtensionHeader.tsx
 */

import React from 'react';

interface ExtensionHeaderProps {
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Simplified header component for extension pages
 * Logo on left, actions on right - no title/subtitle
 */
export default function ExtensionHeader({
  logo,
  title,
  subtitle,
  actions,
  className = ''
}: ExtensionHeaderProps) {
  return (
    <header className={`flex w-full items-center justify-between   bg-background ${className}`}>
      {/* Left side - Logo only */}
      <div className="flex items-center">
        {/* {logo} */}
        <img
          className="w-12 h-12"
          src="icons/icon-32.png"
          alt="Voila Logo"
        />
      </div>

      {/* Right side - Actions only */}
      <div className="flex items-center">
        {actions}
      </div>
    </header>
  );
}