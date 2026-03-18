# Piston Code Execution Skill

## When to Use
Use this skill when working on code execution features — the Piston proxy route, running code, handling execution output, or debugging execution issues.

## Architecture
```
Monaco Editor → runCode() → /api/execute/ (Next.js API route) → Piston (localhost:2000) → Docker sandbox
```

## Key Files
- **API Route**: `src/app/api/execute/route.ts` — proxies to Piston
- **Store**: `src/store/useCodeEditorStore.ts` — `runCode()`, output/error state
- **Code Builder**: `src/lib/buildExecutableCode.ts` — wraps challenge code with test harness

## Piston API Details
- **URL**: `http://localhost:2000/api/v2/execute` (via `NEXT_PUBLIC_PISTON_API_URL`)
- **Docker**: `docker compose -f docker-compose.piston.yml up -d`
- **Port**: 2000

## Supported Languages
| Language | Piston Runtime | Version |
|----------|---------------|---------|
| JavaScript | nodejs | 20.11.1 |
| TypeScript | typescript | 5.0.3 |
| Python | python | 3.12.0 |
| Java | java | 15.0.2 |
| Rust | rust | 1.68.2 |
| C++ | c++ | 10.2.0 |
| Ruby | ruby | 3.0.1 |
| Swift | swift | 5.3.3 |

## Request/Response Format

### Request to Piston
```json
{
  "language": "python",
  "version": "3.12.0",
  "files": [{ "content": "print('hello')" }],
  "stdin": "",
  "args": [],
  "compile_timeout": 10000,
  "run_timeout": 3000
}
```

### Response from Piston
```json
{
  "run": { "stdout": "...", "stderr": "...", "code": 0 },
  "compile": { "stdout": "", "stderr": "", "code": 0 }
}
```

## Error Handling Layers
1. API-level errors (`data.message`)
2. Compilation errors (`data.compile.code !== 0`)
3. Runtime errors (`data.run.code !== 0`)
4. Network/fetch errors (catch block)

## Common Issues
- **Piston not running**: Check Docker is up with `docker ps`
- **Port conflict**: Ensure port 2000 is free
- **Timeout**: Challenge tests have 3s runtime limit, 10s compile limit
- **Memory**: Default memory limits enforced per challenge
