'use client';

import React, { useState } from 'react';
import Avatar from './Avatar';

interface CreateGroupFormProps {
  onSubmit: (data: GroupFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface GroupFormData {
  name: string;
  description?: string;
  members: string[];
  avatar?: File;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    members: [],
    avatar: undefined,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    setError(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    if (formData.name.length < 3) {
      setError('Group name must be at least 3 characters');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold text-[var(--tg-text)] mb-6">Create Group</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--tg-text)] mb-3">
            Group Avatar
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--tg-surface)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📸</span>
              )}
            </div>
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isLoading}
              />
              <span className="cursor-pointer inline-block px-4 py-2 rounded-lg bg-[var(--tg-surface)] text-[var(--tg-text)] hover:bg-[var(--tg-border)] transition-colors text-sm font-medium">
                Choose image
              </span>
            </label>
          </div>
        </div>

        {/* Group name */}
        <div>
          <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
            Group Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="My Group"
            maxLength={64}
            className="w-full px-4 py-2 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all text-sm"
          />
          <p className="text-xs text-[var(--tg-text-tertiary)] mt-1">
            {formData.name.length}/64
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--tg-text)] mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="What is this group about?"
            maxLength={256}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 outline-none transition-all text-sm resize-none"
          />
          <p className="text-xs text-[var(--tg-text-tertiary)] mt-1">
            {(formData.description || '').length}/256
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-[var(--tg-border)] text-[var(--tg-text)] hover:bg-[var(--tg-surface)] disabled:opacity-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--tg-primary)] text-white hover:bg-[var(--tg-primary-hover)] disabled:opacity-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;
