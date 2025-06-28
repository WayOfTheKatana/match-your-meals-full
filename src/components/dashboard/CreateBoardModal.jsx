import React, { useState } from 'react';
import { X, Layers, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useRecipeBoards } from '../../hooks/useRecipeBoards';
import { generateSlug } from '../../lib/utils';

const CreateBoardModal = ({ isOpen, onClose, onBoardCreated }) => {
  const { user } = useAuth();
  const { createBoard } = useRecipeBoards();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPrivate: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Board title is required');
      return false;
    }
    if (formData.title.trim().length < 3) {
      setError('Board title must be at least 3 characters long');
      return false;
    }
    if (formData.title.trim().length > 100) {
      setError('Board title must be less than 100 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      setError('You must be logged in to create a board');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const title = formData.title.trim();
      const description = formData.description.trim();
      
      console.log('🔄 Creating board with title:', title);

      // Use the React Query mutation instead of direct Supabase call
      const newBoard = await createBoard.mutateAsync({
        title: title,
        description: description || null,
        isPrivate: formData.isPrivate
      });

      console.log('✅ Board created successfully:', newBoard);

      setSuccess('Board created successfully!');
      
      // Call the callback to refresh the boards list (if needed for additional UI updates)
      if (onBoardCreated) {
        onBoardCreated(newBoard);
      }

      // Close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      
      let errorMessage = 'Failed to create board. Please try again.';
      
      if (err.message?.includes('duplicate key')) {
        errorMessage = 'A board with this name already exists. Please choose a different name.';
      } else if (err.message?.includes('not authenticated')) {
        errorMessage = 'Please log in to create boards.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (createBoard.isPending) return; // Prevent closing while loading
    
    setFormData({
      title: '',
      description: '',
      isPrivate: false
    });
    setError('');
    setSuccess('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  const isLoading = createBoard.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-gray-900">Create New Board</h2>
              <p className="text-sm text-gray-600">Organize your favorite recipes</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Board Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Board Title *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Healthy Breakfast Ideas"
                className="h-12 bg-white border-gray-200 focus:border-primary-500 focus:ring-primary-500 rounded-lg"
                disabled={isLoading}
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Board Description (Optional) */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this board is about..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                disabled={isLoading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center space-x-3">
              <input
                id="isPrivate"
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="isPrivate" className="text-sm text-gray-700">
                Make this board private (only you can see it)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Board'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;