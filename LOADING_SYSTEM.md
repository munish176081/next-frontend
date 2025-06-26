# Loading System Implementation

This document explains how to use the loading system implemented in the Pups4Sale frontend application.

## Overview

The loading system provides visual feedback to users during:
- Route transitions (navigation between pages)
- Form submissions
- API calls
- Any other asynchronous operations

## Components

### 1. LoadingProvider
The main provider that manages global loading state.

**Location**: `app/_components/common/loading-provider.tsx`

**Features**:
- Automatic loading on route changes
- Progress bar at the top of the page
- Loading overlay with spinner
- Global loading state management

### 2. LoadingBar
A simple progress bar that shows at the top of the page.

**Location**: `app/_components/common/loading-bar.tsx`

### 3. RouteLoading
A loading overlay that appears during route transitions.

**Location**: `app/_components/common/route-loading.tsx`

### 4. LoadingButton
A button component that shows a spinner when clicked.

**Location**: `app/_components/ui/loading-button.tsx`

### 5. LoadingLink
A link component that triggers loading when clicked.

**Location**: `app/_components/common/loading-link.tsx`

## Hooks

### useLoading
Hook to access loading state and controls.

```typescript
import { useLoading } from "@/app/_components/common/loading-provider";

function MyComponent() {
  const { isLoading, showLoading, hideLoading } = useLoading();
  
  const handleSubmit = async () => {
    showLoading();
    try {
      await submitForm();
    } finally {
      hideLoading();
    }
  };
}
```

### useNavigationWithLoading
Hook that wraps Next.js navigation with loading indicators.

```typescript
import { useNavigationWithLoading } from "@/app/_hooks/use-navigation-with-loading";

function MyComponent() {
  const { push, replace, back } = useNavigationWithLoading();
  
  const handleNavigation = () => {
    push('/some-route'); // Shows loading automatically
  };
}
```

## Usage Examples

### 1. Automatic Route Loading
The system automatically shows loading when users navigate between pages. No additional code needed.

### 2. Manual Loading Control
```typescript
import { useLoading } from "@/app/_components/common/loading-provider";

function MyForm() {
  const { showLoading, hideLoading } = useLoading();
  
  const handleSubmit = async (data: FormData) => {
    showLoading();
    try {
      await submitToAPI(data);
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      hideLoading();
    }
  };
}
```

### 3. Loading Button
```typescript
import { LoadingButton } from "@/app/_components/ui/loading-button";

function MyForm() {
  const handleSubmit = async () => {
    // Button will show loading automatically
    await submitForm();
  };
  
  return (
    <LoadingButton onClick={handleSubmit}>
      Submit Form
    </LoadingButton>
  );
}
```

### 4. Loading Link
```typescript
import { LoadingLink } from "@/app/_components/common/loading-link";

function Navigation() {
  return (
    <LoadingLink href="/explore">
      Explore Puppies
    </LoadingLink>
  );
}
```

### 5. Custom Navigation with Loading
```typescript
import { useNavigationWithLoading } from "@/app/_hooks/use-navigation-with-loading";

function CustomNavigation() {
  const { push } = useNavigationWithLoading();
  
  const handleExplore = () => {
    push('/explore'); // Shows loading automatically
  };
  
  return (
    <button onClick={handleExplore}>
      Explore
    </button>
  );
}
```

## Integration with Existing Components

### Updating Header Navigation
To add loading to existing navigation links, replace `Link` components with `LoadingLink`:

```typescript
// Before
<Link href={Routes.public.explore}>Explore</Link>

// After
<LoadingLink href={Routes.public.explore}>Explore</LoadingLink>
```

### Updating Form Buttons
Replace regular buttons with `LoadingButton` for form submissions:

```typescript
// Before
<Button onClick={handleSubmit}>Submit</Button>

// After
<LoadingButton onClick={handleSubmit}>Submit</LoadingButton>
```

## Customization

### Loading Duration
The loading duration can be adjusted in the `LoadingProvider`:

```typescript
// In loading-provider.tsx
const timers = [
  setTimeout(() => setProgress(20), 100),  // Adjust these values
  setTimeout(() => setProgress(40), 200),
  // ...
];
```

### Loading Styles
The loading overlay and progress bar styles can be customized in the respective components.

### Loading Text
Customize loading text in the `LoadingProvider`:

```typescript
<p className="text-sm text-gray-600 font-medium">Loading...</p>
```

## Best Practices

1. **Use LoadingButton for form submissions** - Provides immediate feedback
2. **Use LoadingLink for navigation** - Shows loading during route transitions
3. **Use useLoading for custom operations** - Manual control when needed
4. **Always hide loading in finally block** - Ensures loading is hidden even on errors
5. **Keep loading duration reasonable** - Don't make users wait too long

## Troubleshooting

### Loading not showing
- Ensure `LoadingProvider` is wrapped around your app in `providers.tsx`
- Check that the component using loading hooks is within the provider tree

### Loading stuck
- Make sure to call `hideLoading()` in finally blocks
- Check for unhandled promise rejections

### Performance issues
- The system uses efficient Redis SCAN operations
- Loading states are managed locally to avoid unnecessary re-renders

## Migration Guide

To migrate existing components to use the loading system:

1. **Replace Link components** with `LoadingLink` for navigation
2. **Replace Button components** with `LoadingButton` for form submissions
3. **Add useLoading hook** for custom loading scenarios
4. **Test thoroughly** to ensure loading states work correctly

This loading system provides a consistent and user-friendly experience across the entire application. 