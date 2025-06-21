import React, { useState } from 'react';
import { X, Plus, Minus, Upload, Image as ImageIcon, Clock, Users, ChefHat, AlertCircle, Check, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const RecipeCreationModal = ({ isOpen, onClose, onSave, onPublish }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'easy',
    ingredients: [{ id: 1, item: '', amount: '', unit: 'cups' }],
    instructions: [{ id: 1, step: '1', description: '' }],
    images: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [enhancingDescription, setEnhancingDescription] = useState(false);

  const units = ['cups', 'tbsp', 'tsp', 'oz', 'lbs', 'g', 'kg', 'ml', 'l', 'pieces', 'cloves', 'slices'];
  const difficulties = ['easy', 'medium', 'hard'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // AI Enhancement Function
  const handleEnhanceDescription = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a recipe title first to enhance the description.');
      return;
    }

    setEnhancingDescription(true);
    try {
      // Simulate AI enhancement - replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const enhancedDescription = `${formData.description || ''} This delicious ${formData.title.toLowerCase()} combines fresh ingredients with traditional cooking techniques to create a memorable dining experience. Perfect for ${formData.servings || 'family'} servings, this recipe balances flavors beautifully and is sure to become a household favorite. The preparation is ${formData.difficulty || 'easy'} and takes approximately ${formData.prepTime || '15'} minutes to prep.`.trim();
      
      handleInputChange('description', enhancedDescription);
    } catch (error) {
      console.error('Error enhancing description:', error);
      alert('Failed to enhance description. Please try again.');
    } finally {
      setEnhancingDescription(false);
    }
  };

  // Ingredient Management
  const addIngredient = () => {
    const newId = Math.max(...formData.ingredients.map(i => i.id)) + 1;
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: newId, item: '', amount: '', unit: 'cups' }]
    }));
  };

  const removeIngredient = (id) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter(ing => ing.id !== id)
      }));
    }
  };

  const updateIngredient = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));
  };

  // Instruction Management
  const addInstruction = () => {
    const newId = Math.max(...formData.instructions.map(i => i.id)) + 1;
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { id: newId, step: (prev.instructions.length + 1).toString(), description: '' }]
    }));
  };

  const removeInstruction = (id) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter(inst => inst.id !== id)
          .map((inst, index) => ({ ...inst, step: (index + 1).toString() }))
      }));
    }
  };

  const updateInstruction = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map(inst => 
        inst.id === id ? { ...inst, [field]: value } : inst
      )
    }));
  };

  // Image Management
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, {
              id: Date.now() + Math.random(),
              file,
              preview: e.target.result,
              name: file.name
            }]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (id) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Recipe title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.prepTime) newErrors.prepTime = 'Prep time is required';
    if (!formData.cookTime) newErrors.cookTime = 'Cook time is required';
    if (!formData.servings) newErrors.servings = 'Servings is required';
    
    // Validate ingredients
    const invalidIngredients = formData.ingredients.some(ing => !ing.item.trim() || !ing.amount.trim());
    if (invalidIngredients) newErrors.ingredients = 'All ingredients must have item and amount';
    
    // Validate instructions
    const invalidInstructions = formData.instructions.some(inst => !inst.description.trim());
    if (invalidInstructions) newErrors.instructions = 'All instruction steps must have descriptions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSave({ ...formData, status: 'draft' });
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onPublish({ ...formData, status: 'published' });
      onClose();
    } catch (error) {
      console.error('Error publishing recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      difficulty: 'easy',
      ingredients: [{ id: 1, item: '', amount: '', unit: 'cups' }],
      instructions: [{ id: 1, step: '1', description: '' }],
      images: []
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-gray-900">Create New Recipe</h2>
              <p className="text-sm text-gray-600">Share your culinary creation with the world</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipe Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter recipe title"
                    className={`h-12 ${errors.title ? 'border-red-300' : ''}`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your recipe..."
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {/* AI Enhance Button - Fixed in bottom right corner of textarea */}
                    <button
                      type="button"
                      onClick={handleEnhanceDescription}
                      disabled={enhancingDescription}
                      className="absolute bottom-3 right-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Enhance description with AI"
                    >
                      {enhancingDescription ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>{enhancingDescription ? 'Enhancing...' : 'Enhance with AI'}</span>
                    </button>
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prep Time (minutes) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) => handleInputChange('prepTime', e.target.value)}
                      placeholder="15"
                      className={`pl-10 h-12 ${errors.prepTime ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.prepTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.prepTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cook Time (minutes) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) => handleInputChange('cookTime', e.target.value)}
                      placeholder="30"
                      className={`pl-10 h-12 ${errors.cookTime ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.cookTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.cookTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servings *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => handleInputChange('servings', e.target.value)}
                      placeholder="4"
                      className={`pl-10 h-12 ${errors.servings ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.servings && (
                    <p className="mt-1 text-sm text-red-600">{errors.servings}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-primary-600" />
                Recipe Images
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Click to upload images or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map(image => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary-600" />
                  Ingredients
                </h3>
                <Button
                  type="button"
                  onClick={addIngredient}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 hover:bg-primary-50 hover:border-primary-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient</span>
                </Button>
              </div>

              {errors.ingredients && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.ingredients}
                </p>
              )}

              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="cursor-move">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        value={ingredient.item}
                        onChange={(e) => updateIngredient(ingredient.id, 'item', e.target.value)}
                        placeholder="Ingredient name"
                        className="h-10"
                      />
                      <Input
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="h-10"
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                        className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
                  Cooking Instructions
                </h3>
                <Button
                  type="button"
                  onClick={addInstruction}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 hover:bg-primary-50 hover:border-primary-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </Button>
              </div>

              {errors.instructions && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.instructions}
                </p>
              )}

              <div className="space-y-4">
                {formData.instructions.map((instruction, index) => (
                  <div key={instruction.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="cursor-move">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {instruction.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={instruction.description}
                        onChange={(e) => updateInstruction(instruction.id, 'description', e.target.value)}
                        placeholder="Describe this cooking step in detail..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      />
                    </div>
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(instruction.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
              className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Save as Draft</span>
            </Button>
            
            <Button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChefHat className="w-4 h-4" />
              )}
              <span>Publish Recipe</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCreationModal;