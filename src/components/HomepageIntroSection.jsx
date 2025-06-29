import React from 'react';
import SplitText from './SplitText';

const HomepageIntroSection = () => {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 mb-12">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <SplitText
          text="Stop scrolling through endless life stories just to find a recipe"
          className="text-2xl md:text-4xl font-urbanist text-white font-medium"
          delay={50}
          duration={0.5}
          ease="power3.out"
          splitType="words"
          from={{ opacity: 0, y: 30 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-50px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
      </div>
    </div>
  );
};

export default HomepageIntroSection;