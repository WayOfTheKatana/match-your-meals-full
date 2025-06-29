import React from 'react';
import { Sparkles } from 'lucide-react';
import CommonHeader from '../components/CommonHeader';
import SearchSection from '../components/SearchSection';
import GridMotion from '../components/GridMotion';
import SplitText from "../components/SplitText";
import RecipeShowcaseSection from '../components/RecipeShowcaseSection';
import { FeaturesSectionWithHoverEffects } from '../components/FeaturesSectionWithHoverEffects';
import { Feature } from '../components/ui/feature';
import { FaqSection } from '../components/ui/faq';
import { StackedCircularFooter } from '../components/ui/stacked-circular-footer';

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

  // FAQ items
  const DEMO_FAQS = [
    {
      question: "How does the AI-powered recipe search work?",
      answer: "Our AI understands natural language, so you can search exactly how you speak. Just type or say what you're looking for - like 'quick dinner with chicken and spinach' or 'healthy breakfast without eggs' - and our system analyzes your intent, dietary preferences, and time constraints to find perfect matches. It gets smarter with each search, learning your preferences over time.",
    },
    {
      question: "Can I save recipes for later?",
      answer: "Absolutely! You can save any recipe to your personal collection with a single click. Create custom boards like 'Weeknight Dinners' or 'Holiday Recipes' to keep everything organized. Your saved recipes are accessible across all your devices, so you'll always have your favorites handy whether you're at home or grocery shopping.",
    },
    {
      question: "Is there a way to filter recipes by dietary needs?",
      answer: "Yes, we offer comprehensive filtering options for dietary preferences and restrictions. You can filter by vegetarian, vegan, gluten-free, keto, low-carb, dairy-free, and many more options. You can also filter by ingredients you want to include or exclude, cooking time, and nutritional content like calories or protein amount.",
    },
    {
      question: "How does the voice search feature work?",
      answer: "Our voice search feature lets you search hands-free - perfect for when you're cooking! Just tap the microphone icon and speak naturally. For example, say 'Show me quick pasta recipes' or 'Find me a healthy dinner I can make in 30 minutes.' The system will process your request and display relevant results instantly.",
    },
    {
      question: "What is the Cooking Assistant feature?",
      answer: "Amelia, our cooking assistant, can read recipe instructions aloud while you cook. This hands-free feature is perfect when your hands are messy or you're multitasking in the kitchen. Amelia uses natural-sounding voice technology to clearly guide you through each step of the recipe at your own pace.",
    },
  ];

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

      {/* Recipe Showcase Section */}
      <RecipeShowcaseSection />

      {/* Features Section */}
      <section id="features" className="pb-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-urbanist">
              Features That You Love,
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your perfect recipe in seconds, not minutes. Here's how we make cooking discovery effortless
            </p>
          </div>
          
          <FeaturesSectionWithHoverEffects />
        </div>
      </section>

      {/* Creator Revenue Share Section */}
      <section id="about" className="bg-white">
        <Feature />
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <FaqSection
          className="font-inter"
          title="Frequently Asked Questions"
          items={DEMO_FAQS}
          contactInfo={{
            title: "Still have questions?",
            description: "We're here to help with any questions you might have",
            buttonText: "Contact Support",
            onContact: () => console.log("Contact support clicked"),
          }}
        />
      </section>

      {/* Footer Section */}
      <StackedCircularFooter />
    </>
  );
};

export default Home;