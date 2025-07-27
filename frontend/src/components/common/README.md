# 🚨 Alert System Implementation

This alert system provides a comprehensive solution for displaying notifications, errors, success messages, and warnings throughout the Team Vault application. The alerts appear with high z-index positioning over all other elements, including modals and dialogs.

## 🎯 Features

- **Multiple Alert Types**: Success, Error, Warning, Info
- **Auto-dismiss**: Configurable timing for automatic dismissal
- **Manual Dismiss**: Close button for user-controlled dismissal
- **Action Buttons**: Interactive buttons within alerts
- **Stacking**: Multiple alerts stack cleanly
- **High Z-Index**: Appears over all other UI elements (z-index: 9999)
- **Responsive Design**: Works on all screen sizes
- **Clean Animation**: Smooth slide-in and fade effects
- **Lucide Icons**: Consistent iconography

## 📁 File Structure

```
frontend/src/
├── types/alert.ts                     # TypeScript types
├── contexts/AlertContext.tsx          # Context provider and state management
├── components/common/
│   ├── AlertItem.tsx                  # Individual alert component
│   ├── AlertContainer.tsx             # Portal container for alerts
│   └── AlertDemo.tsx                  # Demo component for testing
└── hooks/useAlerts.ts                 # Custom hooks for easy usage
```

## 🚀 Quick Start

### 1. Setup (Already Done)

The alert system is already integrated into the app:

- `AlertProvider` wraps the app in `App.tsx`
- `AlertContainer` renders alerts via React Portal
- Context and hooks are ready to use

### 2. Basic Usage

```tsx
import { useAlertActions } from '@/hooks/useAlerts';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useAlertActions();

  const handleSuccess = () => {
    showSuccess('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    showError('Error', 'Something went wrong');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
};
```

### 3. Advanced Usage with Options

```tsx
const { showWarning } = useAlertActions();

const handleWarning = () => {
  showWarning(
    'Warning Title',
    'This is a detailed warning message',
    {
      duration: 8000, // 8 seconds
      action: {
        label: 'View Details',
        onClick: () => {
          // Handle action click
          console.log('Action clicked');
        }
      }
    }
  );
};
```

### 4. API Error Handling

```tsx
import { useApiErrorHandler } from '@/hooks/useAlerts';

const MyComponent = () => {
  const { handleApiError } = useApiErrorHandler();

  const fetchData = async () => {
    try {
      const response = await api.getData();
      // Handle success...
    } catch (error) {
      handleApiError(error, 'Failed to fetch data');
    }
  };
};
```

## 🎨 Alert Types & Configurations

### Success Alerts
- **Color**: Green theme
- **Icon**: CheckCircle
- **Default Duration**: 5 seconds
- **Use Case**: Successful operations, confirmations

### Error Alerts
- **Color**: Red theme
- **Icon**: XCircle
- **Default Duration**: No auto-dismiss (0)
- **Use Case**: Errors, failures, critical issues

### Warning Alerts
- **Color**: Yellow/Orange theme
- **Icon**: AlertTriangle
- **Default Duration**: 8 seconds
- **Use Case**: Warnings, cautions, important notices

### Info Alerts
- **Color**: Blue theme
- **Icon**: Info
- **Default Duration**: 5 seconds
- **Use Case**: Information, neutral messages

## 🛠️ API Reference

### Hook: `useAlertActions()`

```tsx
const {
  showSuccess,
  showError,
  showWarning,
  showInfo
} = useAlertActions();
```

#### Methods

**`showSuccess(title, message?, options?)`**
- `title`: Required string
- `message`: Optional description
- `options`: Optional configuration object

**`showError(title, message?, options?)`**
- Same parameters as above
- Defaults to no auto-dismiss

**`showWarning(title, message?, options?)`**
- Same parameters as above
- Defaults to 8-second duration

**`showInfo(title, message?, options?)`**
- Same parameters as above

#### Options Object

```tsx
interface Options {
  duration?: number;    // Milliseconds (0 = no auto-dismiss)
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### Hook: `useApiErrorHandler()`

```tsx
const { handleApiError } = useApiErrorHandler();
```

**`handleApiError(error, defaultMessage?)`**
- Automatically handles common HTTP status codes
- Shows appropriate error messages
- Extracts error details from API responses

## 🎯 Integration Examples

### Replace Inline Error Messages

**Before:**
```tsx
const [error, setError] = useState<string | null>(null);

// In JSX
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700">
    {error}
  </div>
)}
```

**After:**
```tsx
const { showError } = useAlertActions();

// On error
showError('Operation Failed', error.message);
```

### Form Submission Example

```tsx
const MyForm = () => {
  const { showSuccess, showError } = useAlertActions();

  const handleSubmit = async (data) => {
    try {
      await api.submitForm(data);
      showSuccess(
        'Form Submitted',
        'Your information has been saved successfully',
        {
          action: {
            label: 'View Details',
            onClick: () => navigateToDetails()
          }
        }
      );
    } catch (error) {
      showError(
        'Submission Failed',
        'Please check your information and try again'
      );
    }
  };
};
```

### CRUD Operations Example

```tsx
const CrudComponent = () => {
  const { showSuccess, showError } = useAlertActions();
  const { handleApiError } = useApiErrorHandler();

  const handleDelete = async (id: string) => {
    try {
      await api.delete(id);
      showSuccess('Deleted', 'Item deleted successfully');
      await refreshList();
    } catch (error) {
      handleApiError(error, 'Failed to delete item');
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.create(data);
      showSuccess(
        'Created Successfully',
        'The new item has been added',
        {
          action: {
            label: 'View Item',
            onClick: () => navigateToItem()
          }
        }
      );
    } catch (error) {
      handleApiError(error, 'Failed to create item');
    }
  };
};
```

## 🔧 Customization

### Styling

The alerts use Tailwind CSS classes and can be customized by modifying `AlertItem.tsx`:

- Colors: Modify the `getAlertConfig` function
- Animations: Update the animation classes
- Layout: Adjust the positioning in `AlertContainer.tsx`

### Duration Defaults

Modify default durations in `useAlertActions.ts`:

```tsx
const showSuccess = (title, message?, options = {}) => {
  showAlert({
    type: 'success',
    title,
    message,
    duration: 3000, // Change default duration
    ...options,
  });
};
```

### Positioning

Change alert position by modifying `AlertContainer.tsx`:

```tsx
// Top-right (default)
<div className="flex flex-col items-end justify-start min-h-screen pt-6 px-4">

// Top-center
<div className="flex flex-col items-center justify-start min-h-screen pt-6 px-4">

// Bottom-right
<div className="flex flex-col items-end justify-end min-h-screen pb-6 px-4">
```

## 🧪 Testing

Visit the Dashboard page to see the `AlertDemo` component in action. It demonstrates:

- All alert types
- Auto-dismiss timing
- Action buttons
- Multiple alert stacking
- Responsive behavior

## 🎯 Next Steps

1. **Remove inline error messages** from existing components
2. **Replace console.error** calls with alert notifications
3. **Add success confirmations** for user actions
4. **Implement warning alerts** for risky operations
5. **Add info alerts** for helpful tips and guidance

## 📝 Benefits

- ✅ **Consistent UX**: All notifications follow the same pattern
- ✅ **Better Visibility**: High z-index ensures alerts are always visible
- ✅ **User Control**: Manual dismiss option for all alerts
- ✅ **Developer Experience**: Easy-to-use hooks and error handling
- ✅ **Accessibility**: Proper ARIA labels and screen reader support
- ✅ **Performance**: Portal rendering prevents layout shifts
- ✅ **Mobile Friendly**: Responsive design works on all devices

The alert system provides a robust foundation for user notifications that can be easily extended and customized as needed.
