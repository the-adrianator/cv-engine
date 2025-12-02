/**
 * CV Upload API Route Tests
 */

// Mock Next.js Response - must be before other imports
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => {
      const response = {
        json: async () => body,
        status: init?.status || 200,
        statusText: init?.statusText || 'OK',
        headers: new Headers(),
      };
      return response;
    }),
  },
}));

import { POST } from '@/app/api/cvs/upload/route';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { createCV } from '@/lib/supabase/db';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/supabase/db');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCurrentUser = currentUser as jest.MockedFunction<typeof currentUser>;
const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>;
const mockCreateCV = createCV as jest.MockedFunction<typeof createCV>;

describe('POST /api/cvs/upload', () => {
  const mockUpload = jest.fn();
  const mockGetPublicUrl = jest.fn(() => ({
    data: { publicUrl: 'https://example.com/image.png' },
  }));
  const mockRemove = jest.fn();
  
  const mockSupabase = {
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove,
      })),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'test-user-id' } as any);
    mockCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    } as any);
    mockCreateServerClient.mockReturnValue(mockSupabase as any);
    mockCreateAdminClient.mockReturnValue(mockSupabase as any);
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/image.png' },
    });
  });

  it('returns 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const formData = new FormData();
    const request = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 if required fields are missing', async () => {
    // Create a mock request with empty form data
    const formData = new FormData();
    const request = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('returns 400 if file is not a PDF', async () => {
    const formData = new FormData();
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    formData.append('file', file);
    formData.append('imageBlob', new Blob(['test'], { type: 'image/png' }));
    formData.append('companyName', 'Test Company');
    formData.append('jobTitle', 'Test Job');
    formData.append('jobDescription', 'Test Description');

    const request = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('File must be a PDF');
  });

  it('returns 400 if file exceeds size limit', async () => {
    const formData = new FormData();
    // Create a file larger than 20MB
    const largeFile = new File([new ArrayBuffer(21 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });
    formData.append('file', largeFile);
    formData.append('imageBlob', new Blob(['test'], { type: 'image/png' }));
    formData.append('companyName', 'Test Company');
    formData.append('jobTitle', 'Test Job');
    formData.append('jobDescription', 'Test Description');

    const request = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('File size exceeds 20MB limit');
  });

  it('successfully uploads CV and creates database record', async () => {
    const formData = new FormData();
    const file = new File(['test pdf'], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', file);
    formData.append('imageBlob', new Blob(['test image'], { type: 'image/png' }));
    formData.append('companyName', 'Test Company');
    formData.append('jobTitle', 'Test Job');
    formData.append('jobDescription', 'Test Description');

    // Mock successful database creation
    mockCreateCV.mockResolvedValue({
      cv: {
        id: 'test-cv-id',
        user_id: 'test-user-id',
        company_name: 'Test Company',
        job_title: 'Test Job',
        job_description: 'Test Description',
        pdf_path: 'test/path.pdf',
        image_path: 'test/path.png',
        feedback: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    });

    const request = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.cv.id).toBe('test-cv-id');
    expect(mockUpload).toHaveBeenCalledTimes(2); // PDF and image
    expect(mockCreateCV).toHaveBeenCalled();
  });
});

