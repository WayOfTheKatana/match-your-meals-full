import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight } from 'lucide-react';
import { ShimmerButton } from './ui/shimmer-button';

const RecipeShowcaseSection = () => {
  // Sample recipe data
  const recipes = [
    {
      id: '1',
      slug: 'healthy-mediterranean-bowl',
      title: 'Healthy Mediterranean Bowl',
      description: 'A nutritious bowl packed with fresh vegetables, hummus, and grilled chicken. Perfect for a balanced lunch or dinner.',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 20,
      servings: 2,
      rating: '4.9',
      tags: ['Mediterranean', 'Healthy', 'High-Protein']
    },
    {
      id: '2',
      slug: 'avocado-toast-with-poached-eggs',
      title: 'Avocado Toast with Poached Eggs',
      description: 'Creamy avocado spread on whole grain toast topped with perfectly poached eggs and a sprinkle of red pepper flakes.',
      image: 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 5,
      servings: 1,
      rating: '4.7',
      tags: ['Breakfast', 'Vegetarian', 'Quick']
    },
    {
      id: '3',
      slug: 'thai-coconut-curry-soup',
      title: 'Thai Coconut Curry Soup',
      description: 'A fragrant and spicy Thai soup with coconut milk, lemongrass, and your choice of protein. Ready in under 30 minutes!',
      image: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 15,
      servings: 4,
      rating: '4.8',
      tags: ['Thai', 'Soup', 'Spicy']
    },
    {
      id: '4',
      slug: 'berry-protein-smoothie-bowl',
      title: 'Berry Protein Smoothie Bowl',
      description: 'A thick and creamy smoothie bowl loaded with mixed berries, protein powder, and topped with granola and fresh fruit.',
      image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 0,
      servings: 1,
      rating: '4.6',
      tags: ['Breakfast', 'Vegan', 'High-Protein']
    },
    {
      id: '5',
      slug: 'sheet-pan-salmon-with-vegetables',
      title: 'Sheet Pan Salmon with Vegetables',
      description: 'An easy weeknight dinner with perfectly roasted salmon and seasonal vegetables all cooked on one pan for minimal cleanup.',
      image: 'https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 25,
      servings: 2,
      rating: '4.9',
      tags: ['Seafood', 'One-Pan', 'Low-Carb']
    },
    {
      id: '6',
      slug: 'quinoa-stuffed-bell-peppers',
      title: 'Quinoa Stuffed Bell Peppers',
      description: 'Colorful bell peppers stuffed with protein-rich quinoa, black beans, corn, and topped with melted cheese.',
      image: 'https://images.pexels.com/photos/5737247/pexels-photo-5737247.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 20,
      cook_time: 40,
      servings: 4,
      rating: '4.7',
      tags: ['Vegetarian', 'Gluten-Free', 'Meal-Prep']
    },
    {
      id: '7',
      slug: 'classic-beef-burger',
      title: 'Classic Beef Burger',
      description: 'A juicy homemade beef burger with all the fixings - lettuce, tomato, onion, and special sauce on a toasted brioche bun.',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 10,
      servings: 4,
      rating: '4.8',
      tags: ['Beef', 'American', 'Grill']
    },
    {
      id: '8',
      slug: 'vegan-chocolate-mousse',
      title: 'Vegan Chocolate Mousse',
      description: 'A rich and creamy chocolate mousse made with avocado and coconut cream. No one will believe it\'s vegan!',
      image: 'https://images.pexels.com/photos/2373520/pexels-photo-2373520.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 0,
      servings: 4,
      rating: '4.6',
      tags: ['Dessert', 'Vegan', 'No-Bake']
    },
    {
      id: '9',
      slug: 'lemon-garlic-roast-chicken',
      title: 'Lemon Garlic Roast Chicken',
      description: 'A perfectly roasted whole chicken infused with lemon, garlic, and herbs. Crispy skin outside, juicy meat inside.',
      image: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 20,
      cook_time: 90,
      servings: 6,
      rating: '4.9',
      tags: ['Chicken', 'Sunday Dinner', 'Comfort Food']
    },
    {
      id: '10',
      slug: 'vegetable-stir-fry-with-tofu',
      title: 'Vegetable Stir-Fry with Tofu',
      description: 'A colorful and quick vegetable stir-fry with crispy tofu cubes and a savory ginger-garlic sauce.',
      image: 'https://images.pexels.com/photos/5848182/pexels-photo-5848182.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 10,
      servings: 2,
      rating: '4.5',
      tags: ['Vegan', 'Quick', 'Asian']
    },
    {
      id: '11',
      slug: 'mushroom-risotto',
      title: 'Creamy Mushroom Risotto',
      description: 'A luxurious Italian risotto with mixed mushrooms, white wine, and freshly grated Parmesan cheese.',
      image: 'https://images.pexels.com/photos/6419736/pexels-photo-6419736.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 30,
      servings: 4,
      rating: '4.8',
      tags: ['Italian', 'Vegetarian', 'Comfort Food']
    },
    {
      id: '12',
      slug: 'greek-salad',
      title: 'Authentic Greek Salad',
      description: 'A refreshing salad with cucumber, tomato, red onion, olives, and feta cheese, dressed with olive oil and oregano.',
      image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 0,
      servings: 4,
      rating: '4.7',
      tags: ['Greek', 'Salad', 'No-Cook']
    },
    {
      id: '13',
      slug: 'spicy-black-bean-tacos',
      title: 'Spicy Black Bean Tacos',
      description: 'Quick and flavorful vegetarian tacos filled with spiced black beans, avocado, and fresh salsa.',
      image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 10,
      servings: 4,
      rating: '4.6',
      tags: ['Mexican', 'Vegetarian', 'Quick']
    },
    {
      id: '14',
      slug: 'banana-oatmeal-pancakes',
      title: 'Banana Oatmeal Pancakes',
      description: 'Fluffy and healthy pancakes made with oats and ripe bananas. No refined sugar and naturally gluten-free!',
      image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 15,
      servings: 2,
      rating: '4.8',
      tags: ['Breakfast', 'Gluten-Free', 'Healthy']
    },
    {
      id: '15',
      slug: 'homemade-pizza',
      title: 'Homemade Margherita Pizza',
      description: 'Classic Italian pizza with a crispy crust, fresh tomato sauce, mozzarella, and basil leaves.',
      image: 'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 30,
      cook_time: 15,
      servings: 4,
      rating: '4.9',
      tags: ['Italian', 'Vegetarian', 'Weekend']
    }
  ];

  // Carousel state and refs
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const carouselRef = useRef(null);
  
  // Create a triple-length array for seamless looping
  // Original + Clone + Clone
  const tripleRecipes = [...recipes, ...recipes, ...recipes];
  
  // Calculate the width of a single set of recipes
  const singleSetWidth = recipes.length * 300; // 300px per image
  
  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Increment scroll position
      setScrollPosition(prev => {
        const newPosition = prev + 1;
        
        // If we've scrolled past the second set, jump back to the first set (without animation)
        if (newPosition >= singleSetWidth * 2) {
          // Disable transition temporarily
          setIsTransitioning(false);
          // Reset to the equivalent position in the first set
          return newPosition - singleSetWidth;
        }
        
        return newPosition;
      });
    }, 20); // Smooth scrolling speed
    
    return () => clearInterval(interval);
  }, [singleSetWidth]);
  
  // Re-enable transitions after position reset
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with CTA Button */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <ChefHat className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-urbanist">
            Discover Delicious Recipes
          </h2>
          <div className="flex flex-col items-center">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Tired of recipe blogs with endless backstories. Get straight to the recipes.
            </p>
            <Link to="/explore-recipes">
              <ShimmerButton 
                className="px-8 py-3 text-base font-medium"
                background="rgba(211, 84, 0, 0.9)"
                shimmerColor="#ffffff"
                shimmerDuration="2.5s"
              >
                <span className="flex items-center text-white">
                  Explore More Recipes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              </ShimmerButton>
            </Link>
          </div>
        </div>

        {/* Recipe Image Carousel */}
        <div className="relative w-full overflow-hidden h-80 my-12">
          {/* Left Gradient Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-gray-50 to-transparent"></div>
          
          {/* Carousel Container */}
          <div 
            ref={carouselRef}
            className="flex"
            style={{
              transform: `translateX(-${scrollPosition}px)`,
              transition: isTransitioning ? 'transform 0.5s linear' : 'none',
              width: `${tripleRecipes.length * 300}px` // 300px per image
            }}
          >
            {tripleRecipes.map((recipe, index) => (
              <div 
                key={`${recipe.id}-${index}`} 
                className="w-[300px] h-80 flex-shrink-0 px-2"
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover rounded-xl shadow-md"
                />
              </div>
            ))}
          </div>
          
          {/* Right Gradient Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-gray-50 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default RecipeShowcaseSection;