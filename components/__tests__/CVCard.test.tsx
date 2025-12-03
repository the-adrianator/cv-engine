import { render, screen } from "@testing-library/react";
import type { Resume } from "@/types";
import CVCard from "@/components/cv/CVCard";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock ScoreCircle
jest.mock("@/components/cv/ScoreCircle", () => {
  return function MockScoreCircle({ score }: { score: number }) {
    return <div data-testid="score-circle">{score}</div>;
  };
});

const mockResume: Resume = {
  id: "1",
  companyName: "Test Company",
  jobTitle: "Software Engineer",
  imagePath: "/images/resume_01.png",
  resumePath: "/resumes/test.pdf",
  feedback: {
    overallScore: 75,
    ATS: {
      score: 80,
      tips: [],
    },
    toneAndStyle: {
      score: 70,
      tips: [],
    },
    content: {
      score: 75,
      tips: [],
    },
    structure: {
      score: 80,
      tips: [],
    },
    skills: {
      score: 70,
      tips: [],
    },
  },
};

describe("CVCard", () => {
  it("renders the CV card with company name and job title", () => {
    render(<CVCard resume={mockResume} />);
    expect(screen.getByText("Test Company")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders CV text when no company name or job title", () => {
    const resumeWithoutDetails = {
      ...mockResume,
      companyName: undefined,
      jobTitle: undefined,
    };
    render(<CVCard resume={resumeWithoutDetails} />);
    expect(screen.getByText("CV")).toBeInTheDocument();
  });

  it("has correct link href", () => {
    render(<CVCard resume={mockResume} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/cv/1");
  });

  it("renders the CV image", () => {
    render(<CVCard resume={mockResume} />);
    const image = screen.getByAltText("cv");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/resume_01.png");
  });
});
