import { createContext, use, useState, useCallback } from 'react';

const SliderContext = createContext();

export const SliderProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [sliderContent, setSliderContent] = useState(null);
  const [sliderTitle, setSliderTitle] = useState(null);

  const openSlider = useCallback((content, title) => {
    // First set the content and make component mount
    setSliderContent(content);
    setSliderTitle(title);
    setIsOpen(true);
    
    // Short delay before showing the content (for smooth animation)
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const closeSlider = useCallback(() => {
    // First hide the slider with animation
    setIsVisible(false);
    
    // Then unmount after animation completes
    const timer = setTimeout(() => {
      setIsOpen(false);
      setSliderContent(null);
      setSliderTitle(null);
    }, 300); // Match transition duration from RightSlider
    
    return () => clearTimeout(timer);
  }, []);

  return (
    (<SliderContext value={{ 
      isOpen, 
      isVisible,
      openSlider, 
      closeSlider, 
      sliderContent, 
      sliderTitle 
    }}>
      {children}
    </SliderContext>)
  );
};

export const useSlider = () => {
  const context = use(SliderContext);
  if (!context) {
    throw new Error('useSlider must be used within a SliderProvider');
  }
  return context;
}; 