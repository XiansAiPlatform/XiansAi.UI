import React, { createContext, useContext, useState } from 'react';

const SliderContext = createContext();

export const SliderProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sliderContent, setSliderContent] = useState(null);

  const openSlider = (content) => {
    setSliderContent(content);
    setIsOpen(true);
  };

  const closeSlider = () => {
    setIsOpen(false);
    setSliderContent(null);
  };

  return (
    <SliderContext.Provider value={{ isOpen, openSlider, closeSlider, sliderContent }}>
      {children}
    </SliderContext.Provider>
  );
};

export const useSlider = () => {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error('useSlider must be used within a SliderProvider');
  }
  return context;
}; 