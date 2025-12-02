import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeToggle, ThemeToggleCompact } from '@/components/layout/ThemeToggle';
import { useThemeStore } from '@/lib/stores/theme';

// Mock the theme store
jest.mock('@/lib/stores/theme', () => ({
  useThemeStore: jest.fn(),
}));

describe('ThemeToggle', () => {
  const mockToggleTheme = jest.fn();
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeStore as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: mockSetTheme,
    });
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('switch');
    expect(button).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('switch');
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('shows correct aria-label for light mode', () => {
    (useThemeStore as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });
    render(<ThemeToggle />);
    const button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('shows correct aria-label for dark mode', () => {
    (useThemeStore as jest.Mock).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });
    render(<ThemeToggle />);
    const button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});

describe('ThemeToggleCompact', () => {
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeStore as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });
  });

  it('renders the compact theme toggle button', () => {
    render(<ThemeToggleCompact />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    render(<ThemeToggleCompact />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});

