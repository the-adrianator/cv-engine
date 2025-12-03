# Testing Guide

## Jest Testing Setup ✅

Jest and React Testing Library have been configured for automated component testing.

### Setup

1. **Dependencies installed:**
   - `jest` - Testing framework
   - `jest-environment-jsdom` - DOM environment for tests
   - `@testing-library/react` - React component testing utilities
   - `@testing-library/jest-dom` - Custom Jest matchers
   - `@testing-library/user-event` - User interaction simulation

2. **Configuration files:**
   - `jest.config.mjs` - Jest configuration for Next.js
   - `jest.setup.mjs` - Test setup with mocks

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Tests are organised by feature and can be found in several directories:

- `components/__tests__/` – UI component tests  
  - `ThemeToggle.test.tsx` - Theme toggle component tests  
  - `ScoreBadge.test.tsx` - Score badge component tests  
  - `FileUploader.test.tsx` - File uploader component tests  
  - `CVCard.test.tsx` - CV card component tests  
  - `Summary.test.tsx` - Summary component tests  

- `app/(main)/__tests__/` – **page and layout tests** for main app routes  
- `app/api/__tests__/` – **API route tests** (e.g. CV upload/analysis endpoints)  

Additional test directories may be added in the future following this pattern.

### Mocks Configured

- **Next.js Router** - `next/navigation` mocked
- **Clerk Authentication** - `@clerk/nextjs` mocked
- **localStorage** - Mocked for theme persistence
- **window.matchMedia** - Mocked for theme detection

### Writing New Tests

1. Create a test file: `components/__tests__/ComponentName.test.tsx`
2. Import testing utilities:
   ```tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import ComponentName from '@/components/ComponentName';
   ```
3. Write test cases:
   ```tsx
   describe('ComponentName', () => {
     it('renders correctly', () => {
       render(<ComponentName />);
       expect(screen.getByText('Expected Text')).toBeInTheDocument();
     });
   });
   ```

### Test Coverage

Current test coverage includes:
- ✅ Theme toggle functionality
- ✅ Score badge rendering and styling
- ✅ File uploader rendering
- ✅ CV card rendering and links
- ✅ Summary component rendering

### Next Steps

Add more tests for:
- Component interactions
- Form submissions
- API integrations
- Error handling
- Accessibility

---

*Tests are automatically run in CI/CD pipelines*

