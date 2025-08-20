'use client';

import { Button, Text, Title, Group, Stack, Paper, Badge } from '@mantine/core';
import classes from './CodeInput.module.css';

interface LineSummary {
  lineStart: number;
  lineEnd: number;
  lineText: string;
  lineExplanation: string;
}

interface FurtherReadingArticle {
  title: string;
  url: string;
  description: string;
}

export interface CodeAnalysisResult {
  analyzedLanguage: string;
  summary: string;
  context: string;
  lineByLine: Array<LineSummary>;
  furtherReading: Array<FurtherReadingArticle>;
}

interface CodeResultsProps {
  analysisResult: CodeAnalysisResult;
  onBackToInput: () => void;
}

export function CodeResults({
  analysisResult,
  onBackToInput,
}: CodeResultsProps) {
    
    console.log('CodeResults - analysisResult:', analysisResult);
    console.log('CodeResults - lineByLine:', analysisResult?.lineByLine);
    console.log('CodeResults - furtherReading:', analysisResult?.furtherReading);

    // Validate that we have a valid analysis result
    if (!analysisResult) {
      return (
        <div className={classes.resultsContainer}>
          <Text c="red">No analysis result available</Text>
          <Button variant="light" onClick={onBackToInput} mt="md">
            Back to Input
          </Button>
        </div>
      );
    }

    // Additional validation for required fields
    if (!analysisResult.summary || !analysisResult.lineByLine || !analysisResult.furtherReading) {
      console.warn('Analysis result missing required fields:', analysisResult);
      return (
        <div className={classes.resultsContainer}>
          <Text c="orange" mb="md">Analysis completed but some data is missing or incomplete.</Text>
          {analysisResult.summary && (
            <Paper withBorder p="md" mb="md">
              <Title order={3} mb="sm">Summary</Title>
              <Text>{analysisResult.summary}</Text>
            </Paper>
          )}
          <Button variant="light" onClick={onBackToInput} mt="md">
            Try Again
          </Button>
        </div>
      );
    }

  return (
    <div className={classes.resultsContainer}>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>Code Analysis Results</Title>
        <Button variant="light" onClick={onBackToInput}>
          Analyze Another Code
        </Button>
      </Group>

      {/* Language Info */}
      {analysisResult.analyzedLanguage && (
        <Paper withBorder p="md" mb="md">
          <Title order={4} mb="sm">
            Analyzed Language
          </Title>
          <Text>{analysisResult.analyzedLanguage}</Text>
        </Paper>
      )}

      {/* Summary */}
      <Paper withBorder p="md" mb="md">
        <Title order={3} mb="sm">
          Summary
        </Title>
        <Text>{analysisResult.summary || 'No summary available'}</Text>
      </Paper>

      {/* Context */}
      {analysisResult.context && (
        <Paper withBorder p="md" mb="md">
          <Title order={3} mb="sm">
            Context
          </Title>
          <Text>{analysisResult.context}</Text>
        </Paper>
      )}

      {/* Line by Line Breakdown */}
      <Paper withBorder p="md" mb="md">
        <Title order={3} mb="sm">
          Line by Line Breakdown
        </Title>
        <div className={classes.lineBreakdown}>
          {analysisResult.lineByLine && analysisResult.lineByLine.length > 0 ? (
            analysisResult.lineByLine.map((line, index) => (
              <div key={index} className={classes.lineItem}>
                <Badge
                  size="sm"
                  variant="filled"
                  className={classes.lineNumberBadge}
                >
                  {line.lineStart} to {line.lineEnd}
                </Badge>
                <Text className={classes.lineExplanation}>
                  {line.lineExplanation}
                </Text>
              </div>
            ))
          ) : (
            <Text c="dimmed">No line-by-line analysis available</Text>
          )}
        </div>
      </Paper>

      {/* Further Reading */}
      <Paper withBorder p="md">
        <Title order={3} mb="sm">
          Further Reading
        </Title>
        <Stack gap="xs">
          {analysisResult.furtherReading && analysisResult.furtherReading.length > 0 ? (
            analysisResult.furtherReading.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.readingLink}
              >
                <Text fw={500} c="blue">
                  {link.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {link.description}
                </Text>
              </a>
            ))
          ) : (
            <Text c="dimmed">No further reading suggestions available</Text>
          )}
        </Stack>
      </Paper>
    </div>
  );
}
