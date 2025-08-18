# Badge System

A comprehensive, reusable badge system for the Pups4Sale application that provides both selection and display capabilities for verification badges, health certificates, and other credentials.

## Features

- **Multiple Variants**: Selectable, display, and compact modes
- **Responsive Design**: Three sizes (sm, md, lg) with responsive layouts
- **Compact Design**: Optimized for space efficiency with reduced spacing and smaller sizes
- **JSON Configuration**: Centralized badge configuration with easy customization
- **Fallback Support**: Graceful handling of missing icons and unknown badges
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Components

### 1. Badge
The core badge component that renders individual badges with different variants.

```tsx
import { Badge } from '@/_components/ui/badge';

<Badge
  value="Vet Checked"
  size="md"
  variant="selectable"
  selected={true}
  onClick={handleClick}
  showLabel={true}
/>
```

**Props:**
- `value`: Badge identifier (string)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `variant`: 'selectable' | 'display' | 'compact' (default: 'display')
- `selected`: Boolean indicating if badge is selected
- `onClick`: Function called when badge is clicked (for selectable variant)
- `showLabel`: Boolean to show/hide the label
- `className`: Additional CSS classes

### 2. BadgeSelector
A form component for selecting multiple badges in a compact grid layout.

```tsx
import { BadgeSelector } from '@/_components/ui/badge';

<BadgeSelector
  value={selectedBadges}
  onChange={setSelectedBadges}
  size="md"
  showCategories={false}
  maxSelection={6}
/>
```

**Props:**
- `value`: Array of selected badge values
- `onChange`: Function called when selection changes
- `size`: Badge size ('sm' | 'md' | 'lg')
- `showCategories`: Boolean to show category headers (default: false for compact layout)
- `maxSelection`: Maximum number of badges that can be selected
- `className`: Additional CSS classes

### 3. BadgeDisplay
A component for displaying selected badges in various layouts.

```tsx
import { BadgeDisplay } from '@/_components/ui/badge';

<BadgeDisplay
  badges={selectedBadges}
  size="md"
  layout="grid"
  showLabels={true}
  maxDisplay={8}
/>
```

**Props:**
- `badges`: Array of badge values to display
- `size`: Badge size ('sm' | 'md' | 'lg')
- `layout`: 'grid' | 'inline' | 'compact'
- `showLabels`: Boolean to show/hide labels
- `maxDisplay`: Maximum number of badges to show (with overflow indicator)
- `className`: Additional CSS classes

## Configuration

Badges are configured in `@/_config/badge-config.ts`:

```tsx
export interface BadgeConfig {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: string;
  iconAlt?: string;
  color: {
    primary: string;
    secondary: string;
    text: string;
  };
  category: 'health' | 'certification' | 'treatment' | 'verification';
  priority: number;
}
```

### Adding New Badges

1. Add the badge configuration to `BADGE_CONFIGS` array
2. Create the corresponding icon SVG in `/public/images/vectors/badges/`
3. The badge will automatically appear in all forms and displays



## Usage Examples

### In Forms
```tsx
// Dynamic form field automatically detects badge fields
const field = {
  name: 'badges',
  label: 'Select Badges',
  type: 'checkbox',
  required: false,
  options: getBadgeFormOptions(), // From badge config
  fieldCategory: 'dynamic'
};
```

### In Listings
```tsx
// Display selected badges in listing cards
<BadgeDisplay
  badges={listing.badges}
  size="sm"
  layout="inline"
  showLabels={false}
  maxDisplay={4}
/>
```

### In Profiles
```tsx
// Show all earned badges in user profile
<BadgeDisplay
  badges={user.badges}
  size="lg"
  layout="grid"
  showLabels={true}
/>
```

## Styling

The badge system uses Tailwind CSS with:
- Responsive grid layouts
- Smooth transitions and hover effects
- Consistent spacing and typography
- Color-coded badges
- Shadow and border effects

## Icons

Badge icons are stored in `/public/images/vectors/badges/`:
- SVG format for crisp scaling
- Fallback PNG support
- Consistent 32x32 viewBox
- Color-coded backgrounds

## Integration

### With Dynamic Forms
The badge system automatically integrates with the dynamic form system:
- Badge fields are automatically detected by field name
- Uses the same validation and state management
- Supports form submission and editing

### With Listing Types
All listing types now use the centralized badge configuration:
- Consistent badge options across all listing types
- Easy to add/remove badges globally
- Maintains backward compatibility

## Demo

Visit `/badge-demo` to see the badge system in action with:
- Interactive badge selection
- Different display modes
- Size and layout controls
- Usage examples and code snippets

## Best Practices

1. **Consistent Sizing**: Use consistent badge sizes within the same context
2. **Compact Layout**: Use the compact grid layout for better space efficiency
3. **Selection Limits**: Set reasonable maxSelection limits for forms
4. **Fallback Handling**: Always provide fallback icons for production
5. **Accessibility**: Ensure proper contrast and readable labels

## Future Enhancements

- Badge verification system
- User-earned badges
- Badge expiration dates
- Custom badge creation
- Badge analytics and reporting 