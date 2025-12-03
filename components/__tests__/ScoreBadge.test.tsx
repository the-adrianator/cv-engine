import { render, screen } from '@testing-library/react';
import ScoreBadge from '@/components/cv/ScoreBadge';

describe('ScoreBadge', () => {
  it('renders "Strong" badge for score > 69', () => {
    render(<ScoreBadge score={85} />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('renders "Good Start" badge for score between 50-69', () => {
    render(<ScoreBadge score={65} />);
    expect(screen.getByText('Good Start')).toBeInTheDocument();
  });

  it('renders "Needs Work" badge for score < 50', () => {
    render(<ScoreBadge score={45} />);
    expect(screen.getByText('Needs Work')).toBeInTheDocument();
  });

  it('applies correct styling for high score', () => {
    const { container } = render(<ScoreBadge score={85} />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-100');
  });

  it('applies correct styling for medium score', () => {
    const { container } = render(<ScoreBadge score={65} />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('applies correct styling for low score', () => {
    const { container } = render(<ScoreBadge score={45} />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-100');
  });
});

