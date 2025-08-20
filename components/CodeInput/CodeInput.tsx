'use client';

import hljs from 'highlight.js/lib/core';
import { CodeBlock, dracula } from 'react-code-blocks';

import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Button,
  Text,
  Title,
  Select,
  FileInput,
  Group,
  Stack,
  Paper,
  Textarea,
  Badge,
  ActionIcon,
  Tooltip,
  Grid,
} from '@mantine/core';
import {
  IconUpload,
  IconCode,
  IconFileCode,
  IconX,
  IconWand,
} from '@tabler/icons-react';
import { ClientRateLimiter } from '@/app/lib/utils/api-helpers';
import classes from './CodeInput.module.css';
import { CodeResults } from './CodeResults';

// Register highlight.js languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml'; // for HTML/JSX-ish detection
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import graphql from 'highlight.js/lib/languages/graphql';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('graphql', graphql);

type LangKey =
  | 'javascript'
  | 'jsx'
  | 'typescript'
  | 'tsx'
  | 'html'
  | 'css'
  | 'scss'
  | 'less'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'graphql';

const prettierConfigByLang: Record<
  LangKey,
  { parser: string; plugins: string[] }
> = {
  javascript: { parser: 'babel', plugins: [] },
  jsx: { parser: 'babel', plugins: [] },
  typescript: { parser: 'typescript', plugins: [] },
  tsx: { parser: 'typescript', plugins: [] },
  html: { parser: 'html', plugins: [] },
  css: { parser: 'css', plugins: [] },
  scss: { parser: 'scss', plugins: [] },
  less: { parser: 'less', plugins: [] },
  json: { parser: 'json', plugins: [] },
  yaml: { parser: 'yaml', plugins: [] },
  markdown: { parser: 'markdown', plugins: [] },
  graphql: { parser: 'graphql', plugins: [] },
};

// Helper: map highlight.js result to one of our LangKeys
function normalizeHljsToLangKey(hljsLang?: string): LangKey | null {
  switch ((hljsLang || '').toLowerCase()) {
    case 'js':
    case 'javascript':
      return 'javascript';
    case 'jsx':
      return 'jsx';
    case 'ts':
    case 'typescript':
      return 'typescript';
    case 'tsx':
      return 'tsx';
    case 'xml':
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'less':
      return 'less';
    case 'json':
      return 'json';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'gql':
    case 'graphql':
      return 'graphql';
    default:
      return null;
  }
}

type SupportedLanguage = {
  value: LangKey | 'auto';
  label: string;
};

// Supported programming languages for the dropdown
const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'LESS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'graphql', label: 'GraphQL' },
];

interface CodeAnalysisResult {
  lineByLine: Array<{ line: number; explanation: string }>;
  summary: string;
  furtherReading: Array<{ title: string; url: string; description: string }>;
}

export function CodeInput() {
  const [code, setCode] = useState('');
  const [formattedCode, setFormattedCode] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<{
    lang: LangKey | null;
    confidence: number;
  }>({
    lang: null,
    confidence: 0,
  });
  const [overrideLanguage, setOverrideLanguage] = useState<LangKey | 'auto'>(
    'auto'
  );
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState('');
  const [remainingRequests, setRemainingRequests] = useState(0);
  const [analysisResult, setAnalysisResult] =
    useState<CodeAnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const fileInputRef = useRef<HTMLButtonElement>(null);

  // Update remaining requests on component mount
  useEffect(() => {
    setRemainingRequests(ClientRateLimiter.getRemainingRequests());
  }, []);

  // Improved language detection using highlight.js
  useEffect(() => {
    if (!code.trim()) {
      setDetectedLanguage({ lang: null, confidence: 0 });
      setFormattedCode('');
      return;
    }

    const { language, relevance } = hljs.highlightAuto(code, [
      'javascript',
      'typescript',
      'xml',
      'html',
      'css',
      'json',
      'yaml',
      'markdown',
      'graphql',
    ]);

    const lang = normalizeHljsToLangKey(language || '');
    const confidence = Math.min(1, Math.max(0, (relevance || 0) / 20)); // crude normalization
    setDetectedLanguage({ lang, confidence });
  }, [code]);

  const activeLang: LangKey | null = useMemo(() => {
    if (overrideLanguage !== 'auto') {
      return overrideLanguage;
    }
    return detectedLanguage.lang;
  }, [overrideLanguage, detectedLanguage.lang]);

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setFileName(file.name);

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    } else {
      setFileName('');
      setCode('');
      setFormattedCode('');
    }
  };

  const handleFormat = async () => {
    if (!code.trim()) {
      return;
    }

    setIsFormatting(true);
    setError('');

    try {
      if (!activeLang || !prettierConfigByLang[activeLang]) {
        // Unsupported by Prettier → show as-is
        setFormattedCode(code);
        return;
      }
      // Use prettier/standalone with explicit plugin loading
      const { format } = await import('prettier/standalone');

      // Load the required parser plugin based on language
      let parserPlugin;
      try {
        if (activeLang === 'javascript' || activeLang === 'jsx') {
          parserPlugin = await import('prettier/plugins/babel');
        } else if (activeLang === 'typescript' || activeLang === 'tsx') {
          parserPlugin = await import('prettier/plugins/typescript');
        } else if (activeLang === 'html') {
          parserPlugin = await import('prettier/plugins/html');
        } else if (
          activeLang === 'css' ||
          activeLang === 'scss' ||
          activeLang === 'less'
        ) {
          parserPlugin = await import('prettier/plugins/postcss');
        } else if (activeLang === 'json') {
          // JSON parser is built into standalone
          parserPlugin = null;
        } else if (activeLang === 'yaml') {
          parserPlugin = await import('prettier/plugins/yaml');
        } else if (activeLang === 'markdown') {
          parserPlugin = await import('prettier/plugins/markdown');
        } else if (activeLang === 'graphql') {
          parserPlugin = await import('prettier/plugins/graphql');
        }
        console.log(parserPlugin);

        if (parserPlugin) {
            console.log("has parser")

          const pretty = await format(code, {
            parser: prettierConfigByLang[activeLang].parser,
            plugins: [parserPlugin],
            semi: true,
            singleQuote: true,
            trailingComma: 'all',
          });
          setFormattedCode(pretty);
        } else {
            console.log("doesn't have parser")
          // For languages without plugins or built-in parsers
          const pretty = await format(code, {
            parser: prettierConfigByLang[activeLang].parser,
            semi: true,
            singleQuote: true,
            trailingComma: 'all',
          });
          setFormattedCode(pretty);
        }
      } catch (pluginError) {
        // Fallback: just copy the code as-is
        setFormattedCode(code);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to format.';
      setError(message);
      setFormattedCode(code);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter or upload some code to analyze');
      return;
    }

    // Get the actual language to send to the API
    const languageToSend = activeLang || detectedLanguage.lang;
    if (!languageToSend) {
      setError(
        'Could not detect programming language. Please select one manually.'
      );
      return;
    }

    // Check rate limit before proceeding
    if (!ClientRateLimiter.checkLimit()) {
      setError('Rate limit exceeded. Please try again later.');
      setRemainingRequests(ClientRateLimiter.getRemainingRequests());
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/openai/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: formattedCode || code, // Send formatted code if available, otherwise original
          language: languageToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API call failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowResults(true);

      // Update remaining requests after successful analysis
      setRemainingRequests(ClientRateLimiter.getRemainingRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setFormattedCode('');
    setFileName('');
    setDetectedLanguage({
      lang: null,
      confidence: 0,
    });
    setOverrideLanguage('auto');
    setError('');
    setAnalysisResult(null);
    setShowResults(false);
  };

  const handleBackToInput = () => {
    setShowResults(false);
    setAnalysisResult(null);
  };

  const renderCodeInputSection = () => {
    return (
      <Paper className={classes.codeContainer} withBorder>
        <div className={classes.codeHeader}>
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconCode size={16} />
              <Text size="sm" fw={500}>
                {fileName || 'Code Input'}
              </Text>
              {detectedLanguage.lang && (
                <Badge size="xs" variant="light" color="blue">
                  Auto-detected:{' '}
                  {
                    SUPPORTED_LANGUAGES.find(
                      (l) => l.value === detectedLanguage.lang
                    )?.label
                  }
                  {detectedLanguage.confidence > 0.7 && (
                    <span> (High confidence)</span>
                  )}
                </Badge>
              )}
            </Group>
            {fileName && (
              <Tooltip label="Remove file">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleFileUpload(null)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </div>

        <Grid gutter="md" className={classes.codeGrid}>
          <Grid.Col span={6}>
            <div className={classes.textareaContainer}>
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" fw={500} c="dimmed">
                  Paste your code here
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconWand size={14} />}
                  onClick={handleFormat}
                  loading={isFormatting}
                  disabled={!code.trim() || !activeLang}
                >
                  Format
                </Button>
              </Group>
              <Textarea
                value={code}
                onChange={(event) => setCode(event.currentTarget.value)}
                placeholder="Paste your code here or upload a file..."
                className={classes.plainTextarea}
                autosize
                minRows={15}
                maxRows={25}
                styles={{
                  input: {
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    border: '1px solid var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-sm)',
                    backgroundColor: 'var(--mantine-color-white)',
                    padding: 'var(--mantine-spacing-sm)',
                    resize: 'none',
                  },
                }}
              />
            </div>
          </Grid.Col>

          <Grid.Col span={6}>
            <div className={classes.codeBlockContainer}>
              <Text size="sm" fw={500} mb="xs" c="dimmed">
                Preview with syntax highlighting
              </Text>
              <div className={classes.codeBlockWrapper}>
                {code.trim() ? (
                  <CodeBlock
                    text={formattedCode || code}
                    language={activeLang || 'text'}
                    showLineNumbers
                    theme={dracula}
                    customStyle={{
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      height: '100%',
                      overflow: 'auto',
                    }}
                    wrapLongLines
                  />
                ) : (
                  <div className={classes.emptyCodeBlock}>
                    <Text size="sm" c="dimmed" ta="center">
                      Code will appear here with syntax highlighting
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Grid.Col>
        </Grid>
      </Paper>
    );
  };

  if (showResults && analysisResult) {
    return (
      <CodeResults
        analysisResult={analysisResult}
        onBackToInput={handleBackToInput}
      />
    );
  }

  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text
          inherit
          variant="gradient"
          component="span"
          gradient={{ from: 'blue', to: 'cyan' }}
        >
          CodeExplainer
        </Text>
      </Title>

      <Text ta="center" c="dimmed" size="lg" mb="xl">
        Get plain English explanations of your code with line-by-line breakdowns
      </Text>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <Stack gap="lg">
          {/* File Upload */}
          <Paper withBorder p="md">
            <Group justify="space-between" align="center" mb="md">
              <Title order={4}>Upload Code File</Title>
              <IconFileCode size={20} />
            </Group>
            <FileInput
              ref={fileInputRef}
              placeholder="Choose a code file..."
              accept=".js,.ts,.jsx,.tsx,.html,.css,.scss,.less,.json,.yaml,.yml,.md,.gql,.graphql"
              value={fileName ? ({ name: fileName } as File) : null}
              onChange={handleFileUpload}
              leftSection={<IconUpload size={16} />}
              clearable
            />
          </Paper>

          {/* Code Input */}
          {renderCodeInputSection()}

          {/* Language Selection */}
          <Paper withBorder p="md">
            <Title order={4} mb="md">
              Programming Language
            </Title>
            <Select
              label="Select the programming language for your code"
              placeholder="Language will be auto-detected"
              data={SUPPORTED_LANGUAGES}
              value={overrideLanguage}
              onChange={(value) =>
                setOverrideLanguage(value as LangKey | 'auto')
              }
              clearable
            />
            {detectedLanguage.lang && overrideLanguage === 'auto' && (
              <Text size="sm" c="dimmed" mt="xs">
                Auto-detected:{' '}
                {
                  SUPPORTED_LANGUAGES.find(
                    (l) => l.value === detectedLanguage.lang
                  )?.label
                }
                {detectedLanguage.confidence > 0.7 && (
                  <span> (High confidence)</span>
                )}
              </Text>
            )}
          </Paper>

          {/* Action Buttons */}
          <Group justify="center" gap="md">
            <Button
              variant="filled"
              color="blue"
              size="lg"
              onClick={handleAnalyzeCode}
              loading={isAnalyzing}
              leftSection={<IconCode size={20} />}
              disabled={!code.trim() || !activeLang}
            >
              Analyze Code
            </Button>
            <Button variant="light" color="gray" onClick={handleReset}>
              Reset
            </Button>
          </Group>

          {error && (
            <Text c="red" ta="center" size="lg" maw={780} mx="auto">
              Error: {error}
            </Text>
          )}

          <Text c="dimmed" ta="center" size="sm" maw={780} mx="auto">
            You have {remainingRequests} code analyses remaining.
          </Text>
        </Stack>
      </div>
    </>
  );
}
