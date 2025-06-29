import React from 'react';
import CommonHeader from '../components/CommonHeader';
import SearchSection from '../components/SearchSection';
import GridMotion from '../components/GridMotion';
import SplitText from "../components/SplitText";

const Home = () => {
  // Food-related items for the grid
  const gridItems = [
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Healthy Recipes',
    'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Quick Meals',
    'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Vegetarian',
    'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Protein-Rich',
    'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Breakfast Ideas',
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Dinner Recipes',
    'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Desserts',
    'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Keto-Friendly',
    'https://images.pexels.com/photos/1640776/pexels-photo-1640776.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Low-Carb',
    'https://images.pexels.com/photos/1435903/pexels-photo-1435903.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Gluten-Free',
    'https://images.pexels.com/photos/1435902/pexels-photo-1435902.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Meal Prep',
    'https://images.pexels.com/photos/1435901/pexels-photo-1435901.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Smoothies',
    'https://images.pexels.com/photos/1435900/pexels-photo-1435900.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Salads',
    'https://images.pexels.com/photos/1435899/pexels-photo-1435899.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Soups',
    'https://images.pexels.com/photos/1435898/pexels-photo-1435898.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Snacks',
    'https://images.pexels.com/photos/1435897/pexels-photo-1435897.jpeg?auto=compress&cs=tinysrgb&w=300',
    'Pasta Dishes',
    'https://images.pexels.com/photos/1435896/pexels-photo-1435896.jpeg?auto=compress&cs=tinysrgb&w=300',
  ];

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
      {/* Background with GridMotion */}
      <div className="absolute inset-0">
        <GridMotion items={gridItems} gradientColor="rgba(211, 84, 0, 0.7)" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-[15]"></div>
        
        {/* Use CommonHeader instead of Header */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-primary-600/90 backdrop-blur-sm">
            <CommonHeader />
          </div>
        </div>
        
        <main className="flex-1 flex items-center justify-center py-12 pt-24">
          {/* SearchSection with enhanced styling for better visibility over the grid */}
          <div className="relative z-20 w-full max-w-6xl mx-auto px-4">
            <SearchSection />
          </div>
        </main> 
      </div>
    </div>
      {/* New Section with SplitText */}
      <div className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <SplitText
            text="Tired of recipe blogs with endless backstories?"
            className="text-3xl md:text-5xl font-semibold text-gray-900 mb-8"
            delay={100}
            duration={1.2}
            ease="elastic.out(1, 0.3)"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="120px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </div>
      </div>
    </>
 
  );
};

export default Home;