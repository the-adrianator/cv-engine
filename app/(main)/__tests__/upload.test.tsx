/**
 * Upload Page Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import UploadPage from '@/app/(main)/upload/page';
import { convertPdfToImage } from '@/lib/pdf2img';

// Mock dependencies
const mockPush = jest.fn();
const mockUseRouter = jest.fn(() => ({
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: '/upload',
  query: {},
  asPath: '/upload',
}));

const mockUseUser = jest.fn(() => ({
  isLoaded: true,
  user: {
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  },
}));

const mockConvertPdfToImage = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}));

jest.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

jest.mock('@/lib/pdf2img', () => ({
  convertPdfToImage: (...args: any[]) => mockConvertPdfToImage(...args),
}));

// Mock fetch
global.fetch = jest.fn();

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/upload',
      query: {},
      asPath: '/upload',
    } as any);
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      },
    } as any);
  });

  it('renders the upload form', () => {
    render(<UploadPage />);
    expect(screen.getByText('Smart Feedback for Your CV')).toBeInTheDocument();
    expect(screen.getByLabelText(/Company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job description/i)).toBeInTheDocument();
  });

  it('shows error when form is submitted without file', async () => {
    render(<UploadPage />);
    
    // Fill form fields
    const companyInput = screen.getByLabelText(/Company name/i);
    const jobTitleInput = screen.getByLabelText(/Job title/i);
    const jobDescInput = screen.getByLabelText(/Job description/i);
    
    fireEvent.change(companyInput, {
      target: { value: 'Test Company' },
    });
    fireEvent.change(jobTitleInput, {
      target: { value: 'Test Job' },
    });
    fireEvent.change(jobDescInput, {
      target: { value: 'Test Description' },
    });
    
    // Submit form - need to get the form element
    const form = companyInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      // Fallback: click submit button
      const submitButton = screen.getByText('Upload CV');
      fireEvent.click(submitButton);
    }

    await waitFor(() => {
      // Check for error message (case-insensitive)
      const errorElement = screen.queryByText(/Please fill in all fields/i, { exact: false });
      expect(errorElement).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays loading state when user is not loaded', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      user: null,
    } as any);

    render(<UploadPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error when user is not signed in', async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: null,
    } as any);

    render(<UploadPage />);
    
    const companyInput = screen.getByLabelText(/Company name/i);
    fireEvent.change(companyInput, {
      target: { value: 'Test Company' },
    });
    
    // Submit form
    const form = companyInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      const submitButton = screen.getByText('Upload CV');
      fireEvent.click(submitButton);
    }

    await waitFor(() => {
      // Check for error message (case-insensitive)
      const errorElement = screen.queryByText(/Please sign in/i, { exact: false });
      expect(errorElement).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

