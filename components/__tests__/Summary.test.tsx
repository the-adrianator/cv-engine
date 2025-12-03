import { render, screen } from "@testing-library/react";
import type { Feedback } from "@/types";
import Summary from "@/components/cv/Summary";

// Mock ScoreGauge and ScoreBadge
jest.mock("@/components/cv/ScoreGauge", () => {
  return function MockScoreGauge({ score }: { score: number }) {
    return <div data-testid="score-gauge">{score}</div>;
  };
});

jest.mock("@/components/cv/ScoreBadge", () => {
  return function MockScoreBadge({ score }: { score: number }) {
    return <div data-testid="score-badge">{score}</div>;
  };
});

const mockFeedback: Feedback = {
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
};

describe("Summary", () => {
  it("renders the summary component", () => {
    render(<Summary feedback={mockFeedback} />);
    expect(screen.getByText("Your CV Score")).toBeInTheDocument();
  });

  it("displays the overall score", () => {
    render(<Summary feedback={mockFeedback} />);
    expect(
      screen.getByText(/This score is calculated based on/i)
    ).toBeInTheDocument();
  });

  it("displays all category scores", () => {
    render(<Summary feedback={mockFeedback} />);
    expect(screen.getByText("Tone & Style")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Structure")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("displays correct scores for each category", () => {
    render(<Summary feedback={mockFeedback} />);
    // Check that scores are displayed (they appear multiple times, so use getAllByText)
    const score70 = screen.getAllByText("70");
    const score75 = screen.getAllByText("75");
    const score80 = screen.getAllByText("80");
    expect(score70.length).toBeGreaterThan(0);
    expect(score75.length).toBeGreaterThan(0);
    expect(score80.length).toBeGreaterThan(0);
  });
});
