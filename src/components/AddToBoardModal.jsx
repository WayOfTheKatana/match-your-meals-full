import React, { useState } from 'react';
import { X, Layers, Plus, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useRecipeBoards } from '../hooks/useRecipeBoards';
import CreateBoardModal from './dashboard/CreateBoardModal';

const AddToBoardModal = ({ isOpen, onClose, recipeId }) => {
  const { user } = useAuth();
  const { boards, loading: boardsLoading, addRecipeToBoard, isAddingRecipe } = useRecipeBoards();
  const [selectedBoards, setSelectedBoards] = useState(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);

  const handleBoardToggle = (boardId) => {
    const newSelected = new Set(selectedBoards);
    if (newSelected.has(boardId)) {
      newSelected.delete(boardId);
    } else {
      newSelected.add(boardId);
    }
    setSelectedBoards(newSelected);
    setError('');
  };

  const handleAddToBoards = async () => {
    if (selectedBoards.size === 0) {
      setError('Please select at least one board');
      return;
    }

    try {
      const promises = Array.from(selectedBoards).map(boardId =>
        addRecipeToBoard({ boardId, recipeId })
      );

      await Promise.all(promises);
      
      setSuccess(`Recipe added to ${selectedBoards.size} board${selectedBoards.size === 1 ? '' : 's'}!`);
      
      // Close modal after success
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error adding recipe to boards:', error);
      setError(error.message || 'Failed to add recipe to boards. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedBoards(new Set());
    setError('');
    setSuccess('');
    onClose();
  };

  const handleBoardCreated = (newBoard) => {
    console.log('✅ Board created from modal:', newBoard);
    setShowCreateBoardModal(false);
    // The useRecipeBoards hook will automatically refetch the boards
  };

  if (!isOpen || !recipeId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-gray-900">Add to Board</h2>
              <p className="text-sm text-gray-600">Choose which boards to add this recipe to</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isAddingRecipe}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
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

          {/* Loading State */}
          {boardsLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your boards...</p>
            </div>
          )}

          {/* No Boards */}
          {!boardsLoading && boards.length === 0 && (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Boards Yet</h3>
              <p className="text-gray-600 mb-4">Create your first board to organize recipes</p>
              <Button
                onClick={() => setShowCreateBoardModal(true)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Create Board
              </Button>
            </div>
          )}

          {/* Boards List */}
          {!boardsLoading && boards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select boards ({selectedBoards.size} selected)
              </h3>
              
              {boards.map((board) => (
                <div
                  key={board.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedBoards.has(board.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleBoardToggle(board.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{board.title}</h4>
                      <p className="text-sm text-gray-600">
                        {board.recipe_count} recipe{board.recipe_count === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedBoards.has(board.id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedBoards.has(board.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!boardsLoading && boards.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAddingRecipe}
            >
              Cancel
            </Button>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateBoardModal(true)}
                disabled={isAddingRecipe}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Board
              </Button>
              <Button
                onClick={handleAddToBoards}
                disabled={selectedBoards.size === 0 || isAddingRecipe}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isAddingRecipe ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add to {selectedBoards.size} Board{selectedBoards.size === 1 ? '' : 's'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={showCreateBoardModal}
        onClose={() => setShowCreateBoardModal(false)}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
};

export default AddToBoardModal;