import { render, screen } from '@testing-library/react';
import FileUploader from '@/components/cv/FileUploader';

// Mock react-dropzone
const mockGetRootProps = jest.fn(() => ({
  onClick: jest.fn(),
  onDragOver: jest.fn(),
  onDragLeave: jest.fn(),
  onDrop: jest.fn(),
}));

const mockGetInputProps = jest.fn(() => ({
  onChange: jest.fn(),
  onClick: jest.fn(),
}));

jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(() => ({
    getRootProps: mockGetRootProps,
    getInputProps: mockGetInputProps,
    isDragActive: false,
    acceptedFiles: [],
  })),
}));

describe('FileUploader', () => {
  const mockOnFileSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRootProps.mockReturnValue({
      onClick: jest.fn(),
      onDragOver: jest.fn(),
      onDragLeave: jest.fn(),
      onDrop: jest.fn(),
    });
    mockGetInputProps.mockReturnValue({
      onChange: jest.fn(),
      onClick: jest.fn(),
    });
  });

  it('renders the file uploader', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
  });

  it('displays the max file size', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);
    expect(screen.getByText(/PDF \(max 20 MB\)/i)).toBeInTheDocument();
  });
});

