import React, { createContext, useContext, useState } from 'react';

const SliderContext = createContext();

export const SliderProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sliderContent, setSliderContent] = useState(null);
  const [sliderTitle, setSliderTitle] = useState(null);

  const openSlider = (content, title) => {
    setSliderContent(content);
    setSliderTitle(title);
    setIsOpen(true);
  };

  const closeSlider = () => {
    setIsOpen(false);
    setSliderContent(null);
    setSliderTitle(null);
  };

  return (
    <SliderContext.Provider value={{ isOpen, openSlider, closeSlider, sliderContent, sliderTitle }}>
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