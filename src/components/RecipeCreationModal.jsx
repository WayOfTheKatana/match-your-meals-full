import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, Upload, Image as ImageIcon, Clock, Users, ChefHat, AlertCircle, Check, Trash2, GripVertical, Sparkles, Loader2, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';

const RecipeCreationModal = ({ isOpen, onClose, initialRecipeData = null, onSave, onPublish }) => {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [analyzingRecipe, setAnalyzingRecipe] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const formInitialized = useRef(false);

  const units = ['cups', 'tbsp', 'tsp', 'oz', 'lbs', 'g', 'kg', 'ml', 'l', 'pieces', 'cloves', 'slices'];
  const difficulties = ['easy', 'medium', 'hard'];

  // Initialize form data when editing a recipe
  useEffect(() => {
    if (initialRecipeData && isOpen) {
      setIsEditMode(true);
      
      // Convert database recipe format to form data format
      const ingredientsForForm = initialRecipeData.ingredients?.map((ing, index) => ({
        id: index + 1,
        item: ing.name || '',
        amount: ing.amount || '',
        unit: ing.unit || 'cups'
      })) || [{ id: 1, item: '', amount: '', unit: 'cups' }];

      const instructionsForForm = initialRecipeData.instructions?.map((inst, index) => ({
        id: index + 1,
        step: (index + 1).toString(),
        description: inst || ''
      })) || [{ id: 1, step: '1', description: '' }];

      // Prepare images array
      const imagesForForm = [];
      if (initialRecipeData.image_path) {
        imagesForForm.push({
          id: Date.now(),
          preview: initialRecipeData.image_path,
          name: initialRecipeData.image_path.split('/').pop() || 'recipe-image.jpg',
          publicUrl: initialRecipeData.image_path,
          uploaded: true,
          storagePath: initialRecipeData.image_path.replace(
            `${supabase.supabaseUrl}/storage/v1/object/public/matchmymeals-images/`, 
            ''
          )
        });
      }

      setFormData({
        title: initialRecipeData.title || '',
        description: initialRecipeData.description || '',
        prepTime: initialRecipeData.prep_time?.toString() || '',
        cookTime: initialRecipeData.cook_time?.toString() || '',
        servings: initialRecipeData.servings?.toString() || '',
        difficulty: initialRecipeData.difficulty || 'easy',
        ingredients: ingredientsForForm,
        instructions: instructionsForForm,
        images: imagesForForm
      });
      
      formInitialized.current = true;
    } else if (isOpen) {
      // Reset form for new recipe creation
      setIsEditMode(false);
      resetForm();
      formInitialized.current = true;
    }
  }, [initialRecipeData, isOpen]);

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

  // AI Description Enhancement with Edge Function
  const handleEnhanceDescription = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a recipe title first to enhance the description.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setEnhancingDescription(true);
    try {
      console.log('🔄 Calling recipe-description-enhancer Edge Function...');
      
      // Prepare the payload with context for better enhancement
      const payload = {
        description: formData.description || '',
        title: formData.title,
        ingredients: formData.ingredients.filter(ing => ing.item.trim() !== '')
      };

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('recipe-description-enhancer', {
        body: payload
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(`Description enhancement failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Description enhancement failed');
      }

      console.log('✅ Description enhanced successfully:', data);
      
      // Update the description field with the enhanced version
      handleInputChange('description', data.enhanced_description);
      
      // Show success toast
      toast({
        title: "Description Enhanced",
        description: "Your recipe description has been enhanced with AI.",
        variant: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Error enhancing description:', error);
      
      let errorMessage = 'Failed to enhance description. Please try again.';
      
      if (error.message?.includes('API key')) {
        errorMessage = 'AI service not configured. Please contact support.';
      } else if (error.message?.includes('Failed to connect')) {
        errorMessage = 'Unable to connect to AI service. Please check your internet connection.';
      } else if (error.message?.includes('Function not found')) {
        errorMessage = 'Enhancement function not found. Please ensure the recipe-description-enhancer function is deployed in Supabase.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Enhancement Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setEnhancingDescription(false);
    }
  };

  // Ingredient Management
  const addIngredient = () => {
    const newId = Math.max(...formData.ingredients.map(i => i.id), 0) + 1;
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
    const newId = Math.max(...formData.instructions.map(i => i.id), 0) + 1;
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
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file`);
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB.`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log('📤 Uploading image to Supabase Storage:', fileName);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('matchmymeals-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        console.log('✅ Image uploaded successfully:', uploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('matchmymeals-images')
          .getPublicUrl(fileName);

        // Create preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);

        return {
          id: Date.now() + Math.random(),
          file,
          preview: previewUrl,
          name: file.name,
          storagePath: fileName,
          publicUrl: urlData.publicUrl,
          uploaded: true
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      console.log('✅ All images uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      toast({
        title: "Upload Failed",
        description: `Error uploading images: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = async (id) => {
    const imageToRemove = formData.images.find(img => img.id === id);
    
    if (imageToRemove && imageToRemove.uploaded && imageToRemove.storagePath) {
      try {
        console.log('🗑️ Removing image from storage:', imageToRemove.storagePath);
        
        const { error } = await supabase.storage
          .from('matchmymeals-images')
          .remove([imageToRemove.storagePath]);

        if (error) {
          console.error('❌ Error removing image from storage:', error);
        } else {
          console.log('✅ Image removed from storage successfully');
        }
      } catch (error) {
        console.error('❌ Error removing image:', error);
      }
    }

    // Clean up preview URL
    if (imageToRemove && imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

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

  // Prepare data for recipe analyzer
  const prepareAnalyzerPayload = () => {
    const ingredientsForAnalysis = formData.ingredients.map(ing => ({
      name: ing.item.trim(),
      amount: ing.amount.trim(),
      unit: ing.unit
    }));

    const instructionsForAnalysis = formData.instructions.map(inst => inst.description.trim());

    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      prep_time: parseInt(formData.prepTime),
      cook_time: parseInt(formData.cookTime),
      servings: parseInt(formData.servings),
      difficulty: formData.difficulty,
      ingredients: ingredientsForAnalysis,
      instructions: instructionsForAnalysis
    };
  };

  // Call the recipe-analyzer Edge Function
  const callRecipeAnalyzer = async (recipeData, recipeId = null) => {
    try {
      console.log('🚀 Calling recipe-analyzer Edge Function...');
      console.log('📋 Recipe data being sent:', recipeData);
      
      const payload = {
        recipeData: recipeData,
        recipeId: recipeId
      };

      const { data, error: functionError } = await supabase.functions.invoke('recipe-analyzer', {
        body: payload
      });

      if (functionError) {
        console.error('❌ Edge Function error:', functionError);
        throw new Error(`Recipe analyzer failed: ${functionError.message}`);
      }

      console.log('✅ Edge Function response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Recipe analysis failed');
      }

      return {
        success: true,
        health_tags: data.analysisResult.health_tags,
        dietary_tags: data.analysisResult.dietary_tags,
        health_benefits: data.analysisResult.health_benefits,
        nutritional_info: data.analysisResult.nutritional_info,
        embedding: data.embedding,
        connectionStatus: data.connectionStatus,
        databaseUpdated: data.databaseUpdated
      };
    } catch (error) {
      console.error('❌ Error calling recipe analyzer:', error);
      throw error;
    }
  };

  // Prepare data for database with analyzed data
  const prepareRecipeData = (processedRecipeData = null) => {
    // Convert ingredients to JSONB format
    const ingredientsForDB = formData.ingredients.map(ing => ({
      name: ing.item.trim(),
      amount: ing.amount.trim(),
      unit: ing.unit
    }));

    // Convert instructions to TEXT[] format
    const instructionsForDB = formData.instructions.map(inst => inst.description.trim());

    // Get the first uploaded image URL for the main image
    const mainImageUrl = formData.images.find(img => img.uploaded)?.publicUrl || null;

    // Generate slug from title
    const slug = generateSlug(formData.title.trim());

    const baseRecipeData = {
      creator_id: user.id,
      title: formData.title.trim(),
      slug: slug,
      description: formData.description.trim(),
      prep_time: parseInt(formData.prepTime),
      cook_time: parseInt(formData.cookTime),
      servings: parseInt(formData.servings),
      ingredients: ingredientsForDB,
      instructions: instructionsForDB,
      image_path: mainImageUrl, // Store the main image URL
      health_tags: null,
      dietary_tags: null,
      health_benefits: null,
      nutritional_info: null,
      embedding: null
    };

    // If we have processed data from the analyzer, merge it
    if (processedRecipeData) {
      return {
        ...baseRecipeData,
        health_tags: processedRecipeData.health_tags || null,
        dietary_tags: processedRecipeData.dietary_tags || null,
        health_benefits: processedRecipeData.health_benefits || null,
        nutritional_info: processedRecipeData.nutritional_info || null,
        embedding: processedRecipeData.embedding || null
      };
    }

    return baseRecipeData;
  };

  // Save recipe to Supabase
  const saveRecipeToDatabase = async (processedRecipeData = null) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const recipeData = prepareRecipeData(processedRecipeData);
      
      console.log('💾 Saving recipe to database:', recipeData);

      if (isEditMode && initialRecipeData?.id) {
        // Update existing recipe
        const { data, error } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', initialRecipeData.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase update error:', error);
          throw error;
        }

        console.log('✅ Recipe updated successfully:', data);
        return data;
      } else {
        // Insert new recipe
        const { data, error } = await supabase
          .from('recipes')
          .insert([recipeData])
          .select()
          .single();

        if (error) {
          console.error('❌ Supabase insert error:', error);
          throw error;
        }

        console.log('✅ Recipe saved successfully:', data);
        return data;
      }
    } catch (error) {
      console.error('❌ Error saving recipe:', error);
      throw error;
    }
  };

  // Form Submission Handlers
  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Save as draft without Edge Function call
      const savedRecipe = await saveRecipeToDatabase();
      
      // Show success message
      toast({
        title: `Recipe ${isEditMode ? 'Updated' : 'Saved'}`,
        description: `Recipe ${isEditMode ? 'updated' : 'saved'} as draft successfully!`,
        variant: "success",
        duration: 3000,
      });
      
      // Call parent handler if provided
      if (onSave) {
        await onSave({ ...formData, id: savedRecipe.id, slug: savedRecipe.slug });
      }
      
      // Close modal and reset form
      handleClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to save recipe. Please try again.';
      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Please log in to save recipes.';
      } else if (error.message?.includes('violates')) {
        errorMessage = 'Please check all required fields are filled correctly.';
      }
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setAnalyzingRecipe(true);
    setAnalysisComplete(false);
    
    try {
      console.log('🚀 Starting recipe publishing process...');
      
      // Step 1: Save recipe to database first to get an ID
      console.log('💾 Saving recipe to database...');
      const savedRecipe = await saveRecipeToDatabase();
      const recipeId = savedRecipe.id;
      console.log('✅ Recipe saved with ID:', recipeId);
      
      // Step 2: Prepare data for analysis
      const analyzerPayload = prepareAnalyzerPayload();
      console.log('📋 Prepared analyzer payload:', analyzerPayload);
      
      // Step 3: Call the recipe-analyzer Edge Function
      console.log('🔄 Calling Edge Function for recipe analysis...');
      const analyzedData = await callRecipeAnalyzer(analyzerPayload, recipeId);
      console.log('✅ Recipe analysis completed:', analyzedData);
      
      setAnalyzingRecipe(false);
      setAnalysisComplete(true);
      
      // Show success toast
      toast({
        title: "Recipe Published",
        description: "Your recipe has been analyzed and published successfully!",
        variant: "success",
        duration: 3000,
      });
      
      // Call parent handler if provided
      if (onPublish) {
        await onPublish({ ...formData, id: recipeId, slug: savedRecipe.slug, ...analyzedData });
      }
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error publishing recipe:', err);
      setAnalyzingRecipe(false);
      setAnalysisComplete(false);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to publish recipe. Please try again.';
      
      if (err.message?.includes('not authenticated')) {
        errorMessage = 'Please log in to publish recipes.';
      } else if (err.message?.includes('violates')) {
        errorMessage = 'Please check all required fields are filled correctly.';
      } else if (err.message?.includes('Function not found') || err.message?.includes('recipe-analyzer')) {
        errorMessage = 'Recipe analyzer function not found. Please ensure the recipe-analyzer function is deployed in Supabase.';
      } else if (err.message?.includes('Failed to connect')) {
        errorMessage = `API Connection failed: ${err.message}`;
      } else if (err.message?.includes('Recipe analyzer failed')) {
        errorMessage = `Recipe analysis failed: ${err.message}`;
      } else if (err.message?.includes('Failed to fetch')) {
        errorMessage = 'Failed to connect to Edge Function. Please check your Supabase configuration.';
      }
      
      toast({
        title: "Publish Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Clean up any blob URLs
    formData.images.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });

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
    setAnalyzingRecipe(false);
    setAnalysisComplete(false);
    setUploadingImages(false);
    setIsEditMode(false);
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
              <h2 className="text-2xl font-serif text-gray-900">{isEditMode ? 'Edit Recipe' : 'Create New Recipe'}</h2>
              <p className="text-sm text-gray-600">Share your culinary creation with AI-powered analysis</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Analysis Status */}
        {(analyzingRecipe || analysisComplete) && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center space-x-3">
              {analyzingRecipe ? (
                <>
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Analyzing Recipe</p>
                    <p className="text-xs text-blue-700">Please wait while we analyze your recipe...</p>
                  </div>
                </>
              ) : analysisComplete ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Recipe Published Successfully!</p>
                    <p className="text-xs text-green-700">Your recipe has been analyzed and published with AI insights</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

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
                    disabled={loading}
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
                      disabled={loading || enhancingDescription}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {/* AI Enhance Button - Fixed in bottom right corner of textarea */}
                    <button
                      type="button"
                      onClick={handleEnhanceDescription}
                      disabled={enhancingDescription || loading || !formData.description.trim()}
                      className="absolute bottom-3 right-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Enhance description with AI"
                    >
                      {enhancingDescription ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enhancing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>AI Enhance</span>
                        </>
                      )}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading || uploadingImages}
                />
                <label htmlFor="image-upload" className={`cursor-pointer ${loading || uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploadingImages ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                      <p className="text-lg text-primary-600 mb-2">Uploading images...</p>
                      <p className="text-sm text-gray-500">Please wait while we upload your images</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 mb-2">Click to upload images or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                    </>
                  )}
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
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {image.uploaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
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
                  disabled={loading}
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
                        disabled={loading}
                      />
                      <Input
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="h-10"
                        disabled={loading}
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                        className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={loading}
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
                        disabled={loading}
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
                  disabled={loading}
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
                        disabled={loading}
                      />
                    </div>
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(instruction.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        disabled={loading}
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
              {loading && !analyzingRecipe ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isEditMode ? 'Save Changes' : 'Save as Draft'}</span>
            </Button>
            
            <Button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>{isEditMode ? 'Update & Publish' : 'Publish Recipe'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCreationModal;