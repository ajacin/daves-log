import React, { useState } from 'react';

export function PermissionGuard({ children, fallback = null }) {
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const wrapChildren = (children) => {
    if (!React.isValidElement(children)) {
      return children;
    }

    return React.cloneElement(children, {
      onError: (error) => {
        if (error.code === 403 || error.message?.toLowerCase().includes('permission denied')) {
          setHasPermissionError(true);
        }
        // Call the original onError if it exists
        if (children.props.onError) {
          children.props.onError(error);
        }
      }
    });
  };

  if (hasPermissionError) {
    return fallback;
  }

  return React.Children.map(children, wrapChildren);
} 