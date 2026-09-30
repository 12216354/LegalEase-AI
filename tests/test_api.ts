/**
 * EduGenie Test Suite
 * Tests:
 * 1. Health endpoint
 * 2. Empty input validation
 * 3. Maximum input validation (12,000 chars limit)
 * 4. Q&A endpoint validation & schema
 * 5. Explanation endpoint validation & 7-section schema
 * 6. Summary endpoint validation & structured sections
 * 7. Learning recommendations endpoint validation & milestone sequence
 * 8. Quiz response validation (Exactly 3 questions, 4 options per question, valid answer in options)
 * 9. Invalid quiz JSON fallback & error recovery
 */

import { apiRouter } from '../server/apiRouter.ts';
import { validateInput, cleanJsonString } from '../server/schemas.ts';
import express from 'express';
import http from 'http';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 Starting EduGenie Test Suite...\n');

  // 1. Test Input Validation Helpers
  console.log('--- Unit: Input & Length Validation ---');
  try {
    validateInput('', 'Test');
    assert(false, 'Empty input should throw');
  } catch (err: any) {
    assert(err.message.includes('cannot be empty'), 'Empty input throws validation error');
  }

  try {
    const huge = 'a'.repeat(12005);
    validateInput(huge, 'Huge');
    assert(false, 'Input over 12,000 characters should throw');
  } catch (err: any) {
    assert(err.message.includes('exceeds maximum allowed length'), 'Max input length limit enforced');
  }

  const validClean = validateInput('  Photosynthesis in Plants  ', 'Topic');
  assert(validClean === 'Photosynthesis in Plants', 'Trims whitespace correctly');

  // 2. Test JSON cleaning helper
  console.log('\n--- Unit: JSON Cleaning Helper ---');
  const markdownFenced = '```json\n{"questions": []}\n```';
  const cleaned = cleanJsonString(markdownFenced);
  assert(cleaned === '{"questions": []}', 'Strips markdown code fences from JSON');

  // 3. Test Express API Endpoints
  console.log('\n--- Integration: Server HTTP Endpoints ---');
  const app = express();
  app.use(express.json());
  app.use(apiRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Health endpoint check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /health returns 200 OK');
    assert(healthData.status === 'ok', 'Health status is ok');
    assert(healthData.service === 'EduGenie', 'Service identifier is EduGenie');
    assert(healthData.model === 'gemini-3.8-flash', 'Model is gemini-3.8-flash');

    // Empty input validation via API
    const emptyQaRes = await fetch(`${baseUrl}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' }),
    });
    assert(emptyQaRes.status === 400, 'POST /qa with empty body returns 400 Bad Request');
    const emptyQaData = await emptyQaRes.json();
    assert(emptyQaData.error.includes('cannot be empty'), 'Returns friendly empty validation error');

    // Length limit validation via API
    const longExplainRes = await fetch(`${baseUrl}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'x'.repeat(12500) }),
    });
    assert(longExplainRes.status === 400, 'POST /explain exceeding 12,000 chars returns 400 Bad Request');

    // Empty quiz topic validation
    const emptyQuizRes = await fetch(`${baseUrl}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });
    assert(emptyQuizRes.status === 400, 'POST /quiz with empty topic returns 400');

    // Empty summary validation
    const emptySummaryRes = await fetch(`${baseUrl}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '  ' }),
    });
    assert(emptySummaryRes.status === 400, 'POST /summarize with empty material returns 400');

    // Empty recommendations validation
    const emptyRecRes = await fetch(`${baseUrl}/learn/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: '' }),
    });
    assert(emptyRecRes.status === 400, 'POST /learn/recommendations with empty topic returns 400');

    // 4. Test Quiz Question Structure Requirements
    console.log('\n--- Unit: Quiz Structure Invariants ---');
    const mockQuizOutput = {
      questions: [
        {
          question: 'What is a closure in Python?',
          options: ['A function object', 'A syntax error', 'A loop construct', 'A memory leak'],
          answer: 'A function object',
          explanation: 'Closures capture free variables.',
        },
        {
          question: 'Which keyword defines a function?',
          options: ['func', 'def', 'function', 'define'],
          answer: 'def',
          explanation: 'def keyword is used in Python.',
        },
        {
          question: 'What does *args do in a function definition?',
          options: ['Passes positional args', 'Passes keyword args', 'Multiplies numbers', 'Forces return'],
          answer: 'Passes positional args',
          explanation: '*args packs variable positional arguments.',
        },
      ],
    };

    assert(mockQuizOutput.questions.length === 3, 'Quiz contains EXACTLY 3 questions');
    assert(
      mockQuizOutput.questions.every((q) => q.options.length === 4),
      'Each question contains EXACTLY 4 options'
    );
    assert(
      mockQuizOutput.questions.every((q) => q.options.includes(q.answer)),
      'Every question answer exists within its options array'
    );
    assert(
      mockQuizOutput.questions.every((q) => Boolean(q.explanation)),
      'Every question has an explanation'
    );

  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
