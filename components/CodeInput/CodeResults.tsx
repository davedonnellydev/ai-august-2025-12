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
  return (
    <div className={classes.resultsContainer}>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>Code Analysis Results</Title>
        <Button variant="light" onClick={onBackToInput}>
          Analyze Another Code
        </Button>
      </Group>

      {/* Summary */}
      <Paper withBorder p="md" mb="md">
        <Title order={3} mb="sm">
          Summary
        </Title>
        <Text>{analysisResult.summary}</Text>
      </Paper>

      {/* Line by Line Breakdown */}
      <Paper withBorder p="md" mb="md">
        <Title order={3} mb="sm">
          Line by Line Breakdown
        </Title>
        <div className={classes.lineBreakdown}>
          {analysisResult.lineByLine.map((line, index) => (
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
          ))}
        </div>
      </Paper>

      {/* Further Reading */}
      <Paper withBorder p="md">
        <Title order={3} mb="sm">
          Further Reading
        </Title>
        <Stack gap="xs">
          {analysisResult.furtherReading.map((link, index) => (
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
          ))}
        </Stack>
      </Paper>
    </div>
  );
}
