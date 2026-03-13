/**
 * Builds executable code by combining user code with driver code template.
 *
 * Driver code uses template variables:
 * - {{USER_CODE}}        → user's submitted code
 * - {{TEST_INPUT}}       → test case input string
 * - {{EXPECTED_OUTPUT}}  → expected output string
 * - {{TEST_ID}}          → test case ID
 * - {{TEST_INDEX}}       → numeric index of test case
 *
 * Output format from driver code:
 * - PASS:<testId>:<runtimeMs>
 * - FAIL:<testId>:expected=<val>:actual=<val>:<runtimeMs>
 * - ERROR:<testId>:<message>
 * - __TOTAL_RUNTIME__:<ms>
 */

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface ExecutionResult {
  id: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: number;
  isHidden: boolean;
}

interface ParsedResults {
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded" | "Compilation Error";
  testCasesPassed: number;
  totalTestCases: number;
  testResults: ExecutionResult[];
  runtime: number;
  errorMessage?: string;
}

// Build the full executable code from user code + driver code + test cases
export function buildExecutableCode(
  userCode: string,
  driverTemplate: string | undefined,
  testCases: TestCase[],
  language: string
): string {
  if (language === "python") {
    return buildPythonCode(userCode, driverTemplate, testCases);
  }
  if (language === "javascript" || language === "typescript") {
    return buildJSCode(userCode, driverTemplate, testCases);
  }
  // Fallback: just return user code
  return userCode;
}

function buildPythonCode(
  userCode: string,
  driverTemplate: string | undefined,
  testCases: TestCase[]
): string {
  let code = `import sys, json, time, math\nimport traceback\n`;
  code += `try:\n    import numpy as np\nexcept: pass\n`;
  code += `try:\n    from collections import *\nexcept: pass\n`;
  code += `try:\n    from itertools import *\nexcept: pass\n`;
  code += `try:\n    from functools import *\nexcept: pass\n\n`;

  // User code
  code += `# ===== USER CODE =====\n`;
  code += userCode + "\n\n";

  // Driver code
  code += `# ===== DRIVER CODE =====\n`;
  code += `_start_total = time.time()\n\n`;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    
    // Format input replacing newlines with commas to handle multi-line arguments
    const formattedInput = tc.input.trim().replace(/\n/g, ", ");

    if (driverTemplate && driverTemplate.trim()) {
      // Use custom driver template
      const driverInstance = driverTemplate
        .replace(/\{\{TEST_INPUT\}\}/g, formattedInput)
        .replace(/\{\{EXPECTED_OUTPUT\}\}/g, tc.expectedOutput)
        .replace(/\{\{TEST_ID\}\}/g, tc.id)
        .replace(/\{\{TEST_INDEX\}\}/g, String(i));

      code += `# --- Test Case ${i + 1} ---\n`;
      code += `try:\n`;
      code += `    _tc_start = time.time()\n`;
      code += driverInstance.split("\n").map((line) => `    ${line}`).join("\n");
      code += `\n    _tc_end = time.time()\n`;
      code += `except Exception as _e:\n`;
      code += `    print(f"ERROR:${tc.id}:{_e}")\n\n`;
    } else {
      // Default auto driver - directly pass arguments
      code += `try:\n`;
      code += `    _tc_start = time.time()\n`;
      code += `    _expected_${i} = ${tc.expectedOutput}\n`;
      code += `    _result_${i} = solution(${formattedInput})\n`;
      code += `    _tc_ms = (time.time() - _tc_start) * 1000\n`;
      code += `    if str(_result_${i}) == str(_expected_${i}):\n`;
      code += `        print(f"PASS:${tc.id}:{_tc_ms:.2f}")\n`;
      code += `    else:\n`;
      code += `        print(f"FAIL:${tc.id}:expected={_expected_${i}}:actual={_result_${i}}:{_tc_ms:.2f}")\n`;
      code += `except Exception as _e:\n`;
      code += `    print(f"ERROR:${tc.id}:{_e}")\n\n`;
    }
  }

  code += `_end_total = time.time()\n`;
  code += `print(f"__TOTAL_RUNTIME__:{(_end_total - _start_total)*1000:.2f}")\n`;

  return code;
}

function buildJSCode(
  userCode: string,
  driverTemplate: string | undefined,
  testCases: TestCase[]
): string {
  let code = `// Auto-generated test runner\n`;
  code += userCode + "\n\n";
  code += `const _startTotal = Date.now();\n\n`;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    
    // Format input: replace newlines with commas to handle multiple arguments
    // e.g., "[2,7,11,15]\n9" -> "[2,7,11,15], 9"
    const formattedInput = tc.input.trim().replace(/\n/g, ", ");

    if (driverTemplate && driverTemplate.trim()) {
      // Backward compatibility: some seeded challenges had ...{{TEST_INPUT}} which is invalid JS 
      // when there are multiple comma-separated arguments.
      let safeTemplate = driverTemplate.replace(/\.\.\.\{\{TEST_INPUT\}\}/g, "{{TEST_INPUT}}");
      
      const driver = safeTemplate
        .replace(/\{\{TEST_INPUT\}\}/g, formattedInput)
        .replace(/\{\{EXPECTED_OUTPUT\}\}/g, tc.expectedOutput)
        .replace(/\{\{TEST_ID\}\}/g, tc.id)
        .replace(/\{\{TEST_INDEX\}\}/g, String(i));

      code += `try {\n`;
      code += `  const _tcStart${i} = Date.now();\n`;
      code += driver + "\n";
      code += `  const _tcEnd${i} = Date.now();\n`;
      code += `} catch(_e${i}) {\n`;
      code += `  console.log("ERROR:${tc.id}:" + _e${i}.message);\n`;
      code += `}\n\n`;
    } else {
      // Default auto driver - directly pass formatted input as arguments
      code += `try {\n`;
      code += `  const _tcStart = Date.now();\n`;
      code += `  const _expected${i} = ${tc.expectedOutput};\n`;
      code += `  const _result${i} = solution(${formattedInput});\n`;
      code += `  const _tcMs = Date.now() - _tcStart;\n`;
      code += `  if (JSON.stringify(_result${i}) === JSON.stringify(_expected${i})) {\n`;
      code += `    console.log("PASS:${tc.id}:" + _tcMs);\n`;
      code += `  } else {\n`;
      code += `    console.log("FAIL:${tc.id}:expected=" + JSON.stringify(_expected${i}) + ":actual=" + JSON.stringify(_result${i}) + ":" + _tcMs);\n`;
      code += `  }\n`;
      code += `} catch(_e) {\n`;
      code += `  console.log("ERROR:${tc.id}:" + _e.message);\n`;
      code += `}\n\n`;
    }
  }

  code += `console.log("__TOTAL_RUNTIME__:" + (Date.now() - _startTotal));\n`;
  return code;
}

// Parse the stdout/stderr from execution into structured results
export function parseExecutionResults(
  stdout: string,
  stderr: string,
  testCases: TestCase[]
): ParsedResults {
  // Check for compilation error (no PASS/FAIL output at all)
  if (!stdout.includes("PASS:") && !stdout.includes("FAIL:") && !stdout.includes("ERROR:")) {
    if (stderr) {
      return {
        status: "Compilation Error",
        testCasesPassed: 0,
        totalTestCases: testCases.length,
        testResults: testCases.map((tc) => ({
          id: tc.id,
          passed: false,
          input: tc.isHidden ? "Hidden" : tc.input,
          expected: tc.isHidden ? "Hidden" : tc.expectedOutput,
          actual: stderr.substring(0, 500),
          runtime: 0,
          isHidden: tc.isHidden,
        })),
        runtime: 0,
        errorMessage: stderr.substring(0, 1000),
      };
    }

    // Runtime error with some output but no test results
    return {
      status: "Runtime Error",
      testCasesPassed: 0,
      totalTestCases: testCases.length,
      testResults: testCases.map((tc) => ({
        id: tc.id,
        passed: false,
        input: tc.isHidden ? "Hidden" : tc.input,
        expected: tc.isHidden ? "Hidden" : tc.expectedOutput,
        actual: stdout ? stdout.substring(0, 200) : "No output",
        runtime: 0,
        isHidden: tc.isHidden,
      })),
      runtime: 0,
      errorMessage: stdout || "No output produced",
    };
  }

  const lines = stdout.split("\n");
  const testResults: ExecutionResult[] = [];
  let passed = 0;
  let totalRuntime = 0;

  for (const tc of testCases) {
    const passLine = lines.find((l) => l.startsWith(`PASS:${tc.id}:`));
    const failLine = lines.find((l) => l.startsWith(`FAIL:${tc.id}:`));
    const errorLine = lines.find((l) => l.startsWith(`ERROR:${tc.id}:`));

    if (passLine) {
      const parts = passLine.split(":");
      const runtime = parseFloat(parts[2] || "0");
      testResults.push({
        id: tc.id,
        passed: true,
        input: tc.isHidden ? "Hidden" : tc.input,
        expected: tc.isHidden ? "Hidden" : tc.expectedOutput,
        actual: tc.isHidden ? "Hidden" : tc.expectedOutput,
        runtime,
        isHidden: tc.isHidden,
      });
      passed++;
    } else if (failLine) {
      const expectedMatch = failLine.match(/expected=(.+?):actual=(.+?):(\d+\.?\d*)/);
      testResults.push({
        id: tc.id,
        passed: false,
        input: tc.isHidden ? "Hidden" : tc.input,
        expected: tc.isHidden ? "Hidden" : (expectedMatch?.[1] ?? tc.expectedOutput),
        actual: tc.isHidden ? "Hidden" : (expectedMatch?.[2] ?? "Unknown"),
        runtime: parseFloat(expectedMatch?.[3] ?? "0"),
        isHidden: tc.isHidden,
      });
    } else if (errorLine) {
      const errorMsg = errorLine.split(":").slice(2).join(":");
      testResults.push({
        id: tc.id,
        passed: false,
        input: tc.isHidden ? "Hidden" : tc.input,
        expected: tc.isHidden ? "Hidden" : tc.expectedOutput,
        actual: `Error: ${errorMsg}`,
        runtime: 0,
        isHidden: tc.isHidden,
      });
    } else {
      testResults.push({
        id: tc.id,
        passed: false,
        input: tc.isHidden ? "Hidden" : tc.input,
        expected: tc.isHidden ? "Hidden" : tc.expectedOutput,
        actual: "No output",
        runtime: 0,
        isHidden: tc.isHidden,
      });
    }
  }

  // Parse total runtime
  const runtimeMatch = stdout.match(/__TOTAL_RUNTIME__:([\d.]+)/);
  if (runtimeMatch) totalRuntime = parseFloat(runtimeMatch[1]);

  const status = passed === testCases.length ? "Accepted" : "Wrong Answer";

  return {
    status,
    testCasesPassed: passed,
    totalTestCases: testCases.length,
    testResults,
    runtime: Math.round(totalRuntime),
  };
}
