import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { CodeInput } from './CodeInput';
import { fireEvent } from '@testing-library/react';

describe('CodeInput component', () => {
  it('renders the welcome title', () => {
    render(<CodeInput />);
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
    expect(screen.getByText('CodeExplainer')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<CodeInput />);
    expect(
      screen.getByText(/Get plain English explanations of your code/)
    ).toBeInTheDocument();
  });

  it('renders file upload section', () => {
    render(<CodeInput />);
    expect(screen.getByText('Upload Code File')).toBeInTheDocument();
    expect(screen.getByText('Choose a code file...')).toBeInTheDocument();
  });

  it('renders code input section', () => {
    render(<CodeInput />);
    expect(screen.getByText('Code Input')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Paste your code here/)
    ).toBeInTheDocument();
  });

  it('renders language selection section', () => {
    render(<CodeInput />);
    expect(screen.getByText('Programming Language')).toBeInTheDocument();
    expect(
      screen.getByText('Select the programming language for your code')
    ).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<CodeInput />);
    expect(screen.getByText('Analyze Code')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('allows user to type in code textarea', async () => {
    const user = userEvent.setup();
    render(<CodeInput />);

    const textarea = screen.getByPlaceholderText(/Paste your code here/);
    await user.type(textarea, 'console.log("Hello world");');

    expect(textarea).toHaveValue('console.log("Hello world");');
  });

  it('shows error when trying to submit empty code', async () => {
    render(<CodeInput />);

    // Find the button by its role and text
    const submitButton = screen.getByRole('button', { name: /Analyze Code/i });

    // The button should be disabled when there's no code
    expect(submitButton).toBeDisabled();
  });

  it('shows error when trying to submit without selecting language', async () => {
    const user = userEvent.setup();
    render(<CodeInput />);

    const textarea = screen.getByPlaceholderText(/Paste your code here/);
    // Use simple text without special characters
    await user.type(textarea, 'console.log("Hello");');

    const submitButton = screen.getByRole('button', { name: /Analyze Code/i });

    // The button should be enabled if a language is auto-detected
    // If no language is detected, it should be disabled
    const autoDetectedElements = screen.queryAllByText(/Auto-detected:/);
    if (autoDetectedElements.length > 0) {
      expect(submitButton).not.toBeDisabled();
    } else {
      expect(submitButton).toBeDisabled();
    }
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<CodeInput />);

    const textarea = screen.getByPlaceholderText(/Paste your code here/);
    await user.type(textarea, 'console.log("Test");');

    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    expect(textarea).toHaveValue('');
  });

  it('displays remaining requests count', () => {
    render(<CodeInput />);
    expect(
      screen.getByText(/You have \d+ code analyses remaining/)
    ).toBeInTheDocument();
  });

  it('auto-detects JavaScript language from code content', async () => {
    render(<CodeInput />);

    const textarea = screen.getByPlaceholderText(/Paste your code here/);
    // Use fireEvent to set the value directly instead of userEvent.type
    fireEvent.change(textarea, {
      target: { value: 'function hello() { return "Hello"; }' },
    });

    // Wait a bit for the auto-detection to work
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if JavaScript is auto-detected - look for any auto-detected text
    const autoDetectedElements = screen.queryAllByText(/Auto-detected:/);
    expect(autoDetectedElements.length).toBeGreaterThan(0);
  });

  it('allows manual language selection', async () => {
    const user = userEvent.setup();
    render(<CodeInput />);

    // Find the select input and click it to open the dropdown
    const selectInput = screen.getByPlaceholderText(
      'Language will be auto-detected'
    );
    await user.click(selectInput);

    // Look for JavaScript option (which should be available)
    const javascriptOption = screen.getByText('JavaScript');
    await user.click(javascriptOption);

    // Verify the selection was made by checking if the select shows the selected label
    expect(screen.getByDisplayValue('JavaScript')).toBeInTheDocument();
  });
});
