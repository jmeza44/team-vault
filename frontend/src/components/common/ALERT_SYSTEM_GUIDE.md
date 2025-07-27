# 🚨 Alert System Implementation Guide

## Overview

The alert system provides a clean, consistent way to display notifications, success messages, errors, and warnings across the Team Vault application. It displays alerts at the highest z-index level, ensuring they appear over all content including modals and dialogs.

## 🏗️ Architecture

### Components Structure
```
src/
├── types/alert.ts                      # Alert type definitions
├── contexts/AlertContext.tsx           # React context for alert state
├── hooks/useAlerts.ts                  # Custom hooks for alert actions
├── components/common/
│   ├── AlertContainer.tsx              # Portal container for alerts
│   ├── AlertItem.tsx                   # Individual alert component
│   └── AlertDemo.tsx                   # Demo component (for testing)
└── App.tsx                             # AlertProvider integration
```

## 🎨 Alert Types & Styling

### Available Alert Types
- **Success** (Green) - ✅ CheckCircle icon, auto-dismiss after 5s
- **Error** (Red) - ❌ XCircle icon, manual dismiss only
- **Warning** (Yellow) - ⚠️ AlertTriangle icon, auto-dismiss after 8s  
- **Info** (Blue) - ℹ️ Info icon, auto-dismiss after 5s

### Visual Features
- **Clean design** with Tailwind CSS
- **Lucide React icons** for visual clarity
- **Smooth animations** (slide-in from top, fade effects)
- **Backdrop blur** for modern appearance
- **Responsive design** for all screen sizes
- **High z-index** (9999) to appear over everything

## 🚀 Usage Examples

### Basic Usage

```tsx
import { useAlertActions } from '@/hooks/useAlerts';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useAlertActions();

  const handleSuccess = () => {
    showSuccess('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    showError('Error', 'Something went wrong');
  };

  return (
    <button onClick={handleSuccess}>Show Success</button>
  );
}
```

### Advanced Usage with Options

```tsx
const { showSuccess, showError } = useAlertActions();

// Custom duration
showSuccess('Saved!', 'Changes saved', { duration: 3000 });

// No auto-dismiss
showError('Failed!', 'Operation failed', { duration: 0 });

// With action button
showWarning('Warning!', 'Please review', {
  action: {
    label: 'Review Now',
    onClick: () => console.log('Action clicked!')
  }
});
```

### API Error Handling

```tsx
import { useApiErrorHandler } from '@/hooks/useAlerts';

function MyComponent() {
  const { handleApiError } = useApiErrorHandler();

  const saveData = async () => {
    try {
      const response = await api.saveData(data);
      if (!response.success) {
        handleApiError(response, 'Failed to save data');
      }
    } catch (error) {
      handleApiError(error, 'Network error occurred');
    }
  };
}
```

## 🔧 Configuration Options

### Alert Interface
```typescript
interface Alert {
  id: string;                    // Auto-generated
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;                 // Main message
  message?: string;              // Optional description
  duration?: number;             // Auto-dismiss time (0 = manual only)
  dismissible?: boolean;         // Show close button (default: true)
  action?: {                     // Optional action button
    label: string;
    onClick: () => void;
  };
}
```

### Default Durations
- **Success**: 5000ms (5 seconds)
- **Error**: 0ms (manual dismiss only)
- **Warning**: 8000ms (8 seconds)
- **Info**: 5000ms (5 seconds)

## 🎯 Integration in Existing Components

### Replace Inline Error Messages

**Before:**
```tsx
const [error, setError] = useState<string | null>(null);

// In JSX
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}

// In error handling
setError('Something went wrong');
```

**After:**
```tsx
const { showError } = useAlertActions();

// In error handling
showError('Error', 'Something went wrong');
```

### Replace Success Messages

**Before:**
```tsx
const [success, setSuccess] = useState<string | null>(null);

// In JSX  
{success && (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
    {success}
  </div>
)}

// In success handling
setSuccess('Operation successful');
```

**After:**
```tsx
const { showSuccess } = useAlertActions();

// In success handling  
showSuccess('Success', 'Operation successful');
```

## 🧪 Testing the System

Visit the **Dashboard page** to see the AlertDemo component in action. It includes buttons to test:

1. **Success Alert** - Auto-dismisses after 3 seconds
2. **Error Alert** - Manual dismiss with retry action
3. **Warning Alert** - 8-second duration with action
4. **Info Alert** - Standard timing
5. **Multiple Alerts** - Shows stacked alerts

## 📱 Responsive Behavior

- **Desktop**: Alerts appear in top-right corner
- **Mobile**: Alerts are full-width with proper spacing
- **Tablet**: Responsive design adapts automatically

## ♿ Accessibility Features

- **ARIA live regions** for screen readers
- **Keyboard navigation** support
- **Focus management** for dismiss buttons
- **Semantic HTML** with proper roles
- **Color-blind friendly** icons + text combination

## 🔄 Next Steps

### Immediate Improvements
1. **Replace existing error handling** in components
2. **Add success messages** for all CRUD operations
3. **Implement warning alerts** for destructive actions

### Future Enhancements
1. **Sound notifications** option
2. **Persistent alerts** for critical errors
3. **Alert history/log** functionality
4. **Custom alert templates** for specific use cases
5. **Push notification** integration

## 🐛 Troubleshooting

### Common Issues

**Alerts not showing:**
- Ensure `AlertProvider` wraps your app
- Check `AlertContainer` is rendered
- Verify hook usage inside provider

**Styling issues:**
- Confirm Tailwind CSS classes are available
- Check z-index conflicts
- Verify Lucide icons are installed

**TypeScript errors:**
- Import types from `@/types/alert`
- Ensure hooks are used within provider
- Check function signatures match interfaces

---

**Ready to use!** The alert system is now fully integrated and ready for deployment across the Team Vault application. 🚀
