import React from 'react';
import { cn } from "../lib/utils";
import {
  ChefHat,
  Clock,
  Search,
  Heart,
  Mic,
  Sparkles,
  Utensils,
  Users,
  BookOpen,
  Layers,
  Zap,
  Star
} from 'lucide-react';

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "AI-Powered Search",
      description:
        "Find recipes by ingredients, dietary needs, or health goals with our advanced semantic search technology.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
</svg>

,
    },
    {
      title: "Voice Commands",
      description:
        "Speak your recipe requests naturally and get instant results, perfect for hands-free cooking.",
      icon: <Mic className="w-6 h-6" />,
    },
    {
      title: "Personalized Recommendations",
      description:
        "Discover recipes tailored to your preferences, dietary restrictions, and health goals.",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      title: "Health-Focused Recipes",
      description: "Every recipe includes detailed nutritional information and health benefits.",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "Recipe Collections",
      description:
        "Create custom boards to organize your favorite recipes by meal type, occasion, or diet plan.",
      icon: <Layers className="w-6 h-6" />,
    },
    {
      title: "Quick & Easy Filtering",
      description:
        "Filter by cooking time, ingredients, dietary needs, or health benefits in seconds.",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: "Audio Instructions",
      description:
        "Listen to step-by-step cooking instructions with our natural-sounding voice assistant.",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: "Creator Community",
      description: "Follow your favorite recipe creators and build your cooking network.",
      icon: <ChefHat className="w-6 h-6" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-gray-200",
        (index === 0 || index === 4) && "lg:border-l border-gray-200",
        index < 4 && "lg:border-b border-gray-200"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-primary-50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-primary-50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-gray-900">
        {React.cloneElement(icon, { className: "w-6 h-6 text-primary-600" })}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-300 group-hover/feature:bg-primary-600 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-gray-950">
          {title}
        </span>
      </div>
      <p className="text-sm text-gray-900 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

