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
      icon: <Search className="w-6 h-6" />,
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
        "flex flex-col lg:border-r py-10 relative group/feature border-gray-200 dark:border-gray-800",
        (index === 0 || index === 4) && "lg:border-l border-gray-200 dark:border-gray-800",
        index < 4 && "lg:border-b border-gray-200 dark:border-gray-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-gray-100 dark:from-gray-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-gray-100 dark:from-gray-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-gray-600 dark:text-gray-400">
        {React.cloneElement(icon, { className: "w-6 h-6 text-primary-600" })}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-300 dark:bg-gray-700 group-hover/feature:bg-primary-600 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-gray-800 dark:text-gray-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};