'use client';
import React from 'react';
import AppButton from './AppButton';

interface PromptFormProps {
  prompt: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ prompt, loading, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label htmlFor="prompt" className="block text-lg font-medium text-gray-700">
        Describe your 3D scene:
      </label>
      <textarea
        id="prompt"
        rows={5}
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-300 resize-y placeholder-gray-500 text-gray-900"
        placeholder="e.g., A low-poly mountain landscape at sunset"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
      />
      <AppButton loading={loading} type="submit">Generate Script</AppButton>
    </form>
  );
};

export default PromptForm;
