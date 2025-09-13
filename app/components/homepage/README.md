# Homepage Benefits Components

This directory contains components for showcasing DeepList AI's 3 main benefits through elegant dialog-based interfaces.

## 🎯 Core Components

### `WelcomeDialog`

The main benefits dialog that appears for new users. Features:

- Auto-cycling through the 3 main benefits
- Interactive benefit selection with progress dots
- Clean, focused design without redundancy
- Smooth animations and transitions
- Clear CTAs
- Full theme support (light/dark)

### `ValueProposition` & `ValuePropositionCompact`

Reusable components for displaying the 3 main benefits:

- **All AI Models**: Access 10+ models in one place
- **Switch Instantly**: Change models mid-conversation
- **Curated Tools**: Discover specialized AI tools

## 🎨 UI Components

### `BenefitsTrigger`

A simple button that opens the benefits dialog:

```tsx
<BenefitsTrigger onStartChatting={handleStartChatting} />
```

### `FloatingBenefits`

A floating action button (FAB) for easy access:

```tsx
<FloatingBenefits onStartChatting={handleStartChatting} />
```

### `BenefitsBanner`

A top banner with gradient background:

```tsx
<BenefitsBanner onStartChatting={handleStartChatting} />
```

### `SidebarBenefits`

A card component for sidebars:

```tsx
<SidebarBenefits onStartChatting={handleStartChatting} />
```

## 🚀 Usage Examples

### Basic Welcome Dialog

```tsx
import { WelcomeDialog } from '@/app/components/homepage';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <WelcomeDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      onStartChatting={() => {
        // Handle start chatting
        setShowDialog(false);
      }}
    />
  );
}
```

### Sidebar Integration

```tsx
import { SidebarBenefits } from '@/app/components/homepage';

function Sidebar() {
  return (
    <div className="space-y-4">
      <SidebarBenefits onStartChatting={handleStartChatting} />
      {/* Other sidebar content */}
    </div>
  );
}
```

### Floating Action Button

```tsx
import { FloatingBenefits } from '@/app/components/homepage';

function Layout() {
  return (
    <div>
      {/* Your app content */}
      <FloatingBenefits onStartChatting={handleStartChatting} />
    </div>
  );
}
```

## 🎨 Customization

### Styling

All components use Tailwind CSS and can be customized with className props:

```tsx
<WelcomeDialog
  className="custom-dialog"
  onStartChatting={handleStartChatting}
/>
```

### Theme Support

All components automatically adapt to light/dark themes:

```tsx
// Components automatically detect theme
const { theme } = useTheme();
const isDark = theme === 'dark';
```

### Content

The benefits content is defined in `value-proposition.tsx` and can be easily modified:

```tsx
export const VALUE_PROPOSITION = {
  main: 'One Platform, All AI',
  subtitle: 'Access 10+ AI models, switch instantly, discover the best tools',
  benefits: [
    // Modify these benefits
  ],
};
```

## 🔧 Features

- **Auto-dismiss**: Dialogs remember if user has seen them
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Smooth animations**: Fade-in effects and transitions
- **Local storage**: Remembers user preferences
- **TypeScript**: Full type safety
- **Theme support**: Automatic light/dark theme adaptation
- **Clean design**: Simplified, focused interface without redundancy

## 📱 Mobile Support

All components are mobile-responsive and include:

- Touch-friendly interactions
- Appropriate sizing for mobile screens
- Swipe gestures for benefit navigation
- Optimized layouts for small screens

## 🎯 Benefits Strategy

The components focus on 3 core benefits:

1. **All AI Models**: One platform for all AI interactions
2. **Switch Instantly**: Mid-conversation model switching
3. **Curated Tools**: Expert-selected AI tools

This creates a clear, focused value proposition that differentiates DeepList AI from competitors.
