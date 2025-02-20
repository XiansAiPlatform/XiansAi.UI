# Right Slider Component

The Right Slider is a reusable component that provides a sliding panel from the right side of the screen, commonly used for displaying detailed views, forms, or additional information without leaving the current page context.

## Usage

### 1. Setup the Context

First, ensure the `SliderProvider` is wrapped around your application:

```jsx
import { SliderProvider } from '../contexts/SliderContext';

function App() {
  return (
    <SliderProvider>
      <YourApp />
    </SliderProvider>
  );
}
```

### 2. Using the Slider in Components

Use the `useSlider` hook to control the slider:

```jsx
import { useSlider } from '../contexts/SliderContext';

function YourComponent() {
  const { openSlider, closeSlider } = useSlider();

  const handleOpenDetail = () => {
    openSlider(
      <DetailContent />,  // The content to display
      "Detail View"       // The title for the slider
    );
  };

  return (
    <button onClick={handleOpenDetail}>
      Show Details
    </button>
  );
}
```

## Features

- **Fullscreen Toggle**: Users can expand the slider to fullscreen mode
- **Clickaway Detection**: Clicking outside the slider closes it
- **Customizable Width**: Default width is 50% of viewport (max 1200px)
- **Responsive Design**: Adapts to different screen sizes
- **Managed State**: Uses React Context for state management

## Example Implementation

Here's a real-world example from the Instructions feature:

```jsx
const handleView = () => {
  openSlider(
    <InstructionViewer 
      instruction={instruction}
      onEdit={handleEdit}
      onDelete={handleDelete}
      title={`View: ${instruction.name}`}
    />,
    `${instruction.name}`
  );
};
```

## API Reference

### SliderContext

The `useSlider` hook provides the following methods:

```typescript
interface SliderContext {
  isOpen: boolean;
  openSlider: (content: ReactNode, title: string) => void;
  closeSlider: () => void;
  sliderContent: ReactNode | null;
  sliderTitle: string | null;
}
```

### RightSlider Props

```typescript
interface RightSliderProps {
  onClose: () => void;
  children: ReactNode;
  title: string;
}
```

## Best Practices

1. **Content Organization**
   - Keep slider content focused and relevant
   - Use appropriate padding and spacing
   - Consider the hierarchy of information

2. **Performance**
   - Lazy load content when possible
   - Clean up resources when the slider closes
   - Use appropriate state management for complex data

3. **User Experience**
   - Provide clear navigation paths
   - Include close/back options
   - Maintain context between main view and detail view
   - Use consistent animations and transitions

4. **Responsive Design**
   - Test on different screen sizes
   - Ensure content is readable when slider is resized
   - Handle mobile views appropriately
   - Consider touch interactions

## Common Use Cases

- Detailed item views
- Forms and editors
- Preview panels
- Configuration interfaces
- Documentation viewers
- Multi-step workflows
- Media galleries
- Chat or messaging interfaces

## Component Architecture

### SliderProvider

The `SliderProvider` component manages the global state of the slider:

```jsx
<SliderProvider>
  {/* Your app content */}
  {isOpen && (
    <RightSlider
      onClose={closeSlider}
      title={sliderTitle}
    >
      {sliderContent}
    </RightSlider>
  )}
</SliderProvider>
```

### RightSlider Component

The `RightSlider` component handles the presentation and interaction:

```jsx
const RightSlider = ({ onClose, children, title }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  return (
    <>
      <Overlay onClick={onClose} />
      <SliderPanel fullScreen={isFullScreen}>
        <Header>
          <Title>{title}</Title>
          <Actions>
            <FullscreenToggle />
            <CloseButton onClick={onClose} />
          </Actions>
        </Header>
        <Content>
          {children}
        </Content>
      </SliderPanel>
    </>
  );
};
```

## Advanced Usage

### Nested Sliders

While not recommended for most use cases, you can nest sliders by managing their state carefully:

```jsx
const ParentSlider = () => {
  const { openSlider } = useSlider();

  const openNestedSlider = () => {
    openSlider(
      <NestedContent />,
      "Nested View"
    );
  };

  return (
    <div>
      <button onClick={openNestedSlider}>
        Open Nested Slider
      </button>
    </div>
  );
};
```

### Custom Transitions

The slider supports custom transitions through CSS:

```css
.right-slider {
  transition: transform 0.3s ease-in-out;
}

.right-slider-enter {
  transform: translateX(100%);
}

.right-slider-enter-active {
  transform: translateX(0);
}

.right-slider-exit {
  transform: translateX(0);
}

.right-slider-exit-active {
  transform: translateX(100%);
}
```

### Error Handling

Implement error boundaries for slider content:

```jsx
const SliderErrorBoundary = ({ children }) => {
  const { closeSlider } = useSlider();

  return (
    <ErrorBoundary
      onError={() => closeSlider()}
      fallback={<ErrorMessage />}
    >
      {children}
    </ErrorBoundary>
  );
};
```

## Troubleshooting

Common issues and solutions:

1. **Slider doesn't open**
   - Verify SliderProvider is properly mounted
   - Check for console errors
   - Ensure openSlider is called with valid content

2. **Content doesn't update**
   - Verify state management
   - Check component lifecycle
   - Ensure proper key props are used

3. **Performance issues**
   - Implement virtualization for large lists
   - Optimize render cycles
   - Use proper memoization

## Contributing

When contributing to the Right Slider component:

1. Follow the established coding style
2. Add proper documentation
3. Include tests for new features
4. Update this documentation as needed

## License

This component is part of the main application and follows its licensing terms.
