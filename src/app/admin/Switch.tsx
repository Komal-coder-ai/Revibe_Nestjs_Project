'use client';

import React, { useState } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function Switch({ checked, onChange, disabled = false, loading = false }: SwitchProps) {
  return (
    <button
      onClick={() => !disabled && !loading && onChange(!checked)}
      disabled={disabled || loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked
          ? 'bg-green-500 hover:bg-green-600'
          : 'bg-gray-300 hover:bg-gray-400'
      } ${disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      title={checked ? 'Click to deactivate' : 'Click to activate'}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        } ${loading ? 'animate-pulse' : ''}`}
      />
    </button>
  );
}
