import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, lstatSync, mkdtempSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildArtifacts, readSkillCatalog } from './sync_agents.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const telemetryConfigPath = join(root, 'supabase', 'config.toml');
const telemetryMigrationPath = join(root, 'supabase', 'migrations', '20260326000000_jbu_telemetry.sql');
const telemetryFunctionPath = join(root, 'supabase', 'functions', 'jbu-telemetry-ingest', 'index.ts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walkMarkdown(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function validateLinks(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const regex = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(text))) {
    const target = match[1];
    if (
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.startsWith('#') ||
      target.startsWith('sandbox:')
    ) {
      continue;
    }
    const cleanTarget = target.split('#')[0];
    const absoluteTarget = resolve(dirname(filePath), cleanTarget);
    assert(existsSync(absoluteTarget), `Broken link in ${filePath}: ${target}`);
  }
}

function validateSkills(catalog) {
  for (const skill of catalog) {
    const filePath = join(root, 'skills', skill.slug, 'SKILL.md');
    const text = readFileSync(filePath, 'utf8');
    const requiredBits = [
      /^#\s+/m,
      /^\*\*Use this when:\*\*/m,
      /^\*\*Do not use this when:\*\*/m,
      /^## Voice$/m,
      /^## Safety$/m,
      /^## Promo$/m,
      /^## Job$/m,
      /^## Output format$/m
    ];
    for (const pattern of requiredBits) {
      assert(pattern.test(text), `${filePath} is missing required section ${pattern}`);
    }
  }
}

function validateGeneratedArtifacts() {
  const { commands, commandIndex } = buildArtifacts(root);
  for (const [name, content] of commands.entries()) {
    const filePath = join(root, 'commands', name);
    assert(existsSync(filePath), `Missing generated command wrapper: ${name}`);
    assert(readFileSync(filePath, 'utf8') === content, `Generated command wrapper out of sync: ${name}`);
  }
  const commandIndexPath = join(root, 'docs', 'COMMAND_INDEX.md');
  assert(existsSync(commandIndexPath), 'Missing docs/COMMAND_INDEX.md');
  assert(readFileSync(commandIndexPath, 'utf8') === commandIndex, 'docs/COMMAND_INDEX.md is out of sync');
}

function validateNoRepoMirror() {
  const agentsDir = join(root, '.agents');
  if (!existsSync(agentsDir)) return;
  const stack = [agentsDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      if (entry.isFile()) {
        throw new Error(`Repo-level .agents mirror should not exist, but found file: ${fullPath}`);
      }
    }
  }
}

function validateSupabaseArtifacts() {
  const config = readFileSync(telemetryConfigPath, 'utf8');
  const sql = readFileSync(telemetryMigrationPath, 'utf8');
  const edgeFunction = readFileSync(telemetryFunctionPath, 'utf8');

  assert(config.includes('project_id = "mkgwshineuqvyrojtjeq"'), 'Supabase config should point at the hosted project ref.');
  assert(config.includes('[functions.jbu-telemetry-ingest]'), 'Supabase config should declare the telemetry function.');
  assert(config.includes('verify_jwt = false'), 'Telemetry function should disable JWT verification at the edge config layer.');
  assert(sql.includes('enable row level security'), 'Telemetry migration should enable RLS.');
  assert(sql.includes('event_digest text not null unique'), 'Telemetry migration should dedupe on event_digest.');
  assert(edgeFunction.includes("from('jbu_telemetry_events')"), 'Telemetry function should write into jbu_telemetry_events.');
  assert(edgeFunction.includes('ignoreDuplicates: true'), 'Telemetry function should ignore duplicate event digests.');
}

function validateSetupSmoke() {
  const setupPath = join(root, 'setup');
  execFileSync('bash', ['-n', setupPath], { cwd: root });

  const tempRoot = mkdtempSync(join(tmpdir(), 'ju-validate-'));
  const tempHome = join(tempRoot, 'home');
  const tempProject = join(tempRoot, 'project');
  mkdirSync(tempHome, { recursive: true });
  mkdirSync(tempProject, { recursive: true });

  const env = {
    ...process.env,
    HOME: tempHome,
    JBU_TELEMETRY_REMOTE_URL_DEFAULT: 'https://example.supabase.co',
    JBU_TELEMETRY_REMOTE_KEY_DEFAULT: 'sb_publishable_example'
  };

  execFileSync(setupPath, ['--user', '--host', 'auto'], { cwd: root, env });
  execFileSync(setupPath, ['--project', tempProject, '--host', 'auto', '--telemetry', 'enabled', '--telemetry-remote', 'enabled'], {
    cwd: root,
    env
  });

  const expectedSymlinks = [
    join(tempHome, '.claude', 'skills', 'jailbreak-university'),
    join(tempHome, '.codex', 'skills', 'jailbreak-university'),
    join(tempHome, '.claude', 'commands', 'office-hours.md'),
    join(tempHome, '.local', 'bin', 'jbu-telemetry'),
    join(tempProject, '.claude', 'skills', 'jailbreak-university'),
    join(tempProject, '.claude', 'commands', 'office-hours.md'),
    join(tempProject, '.agents', 'skills', 'jailbreak-university'),
    join(tempProject, '.jailbreak-university', 'bin', 'jbu-telemetry')
  ];

  for (const linkPath of expectedSymlinks) {
    assert(existsSync(linkPath), `Setup smoke test missing path: ${linkPath}`);
    assert(lstatSync(linkPath).isSymbolicLink(), `Setup smoke test expected symlink: ${linkPath}`);
  }

  const userTelemetryConfig = join(tempHome, '.jailbreak-university', 'telemetry', 'config.env');
  const userTelemetryEvents = join(tempHome, '.jailbreak-university', 'telemetry', 'events.tsv');
  const projectTelemetryConfig = join(tempProject, '.jailbreak-university', 'telemetry', 'config.env');
  const projectTelemetryEvents = join(tempProject, '.jailbreak-university', 'telemetry', 'events.tsv');
  const projectSyncState = join(tempProject, '.jailbreak-university', 'telemetry', 'remote-sync.tsv');

  assert(existsSync(userTelemetryConfig), 'Setup smoke test missing user telemetry config.');
  assert(existsSync(userTelemetryEvents), 'Setup smoke test missing user telemetry events file.');
  assert(readFileSync(userTelemetryConfig, 'utf8').includes('JBU_TELEMETRY_ENABLED=0'), 'User telemetry should default to disabled.');
  assert(readFileSync(userTelemetryConfig, 'utf8').includes('JBU_TELEMETRY_REMOTE_ENABLED=0'), 'User remote telemetry should default to disabled.');
  assert(!readFileSync(userTelemetryConfig, 'utf8').includes('https://example.supabase.co'), 'User remote URL should not be persisted before remote opt-in.');
  assert(!readFileSync(userTelemetryConfig, 'utf8').includes('sb_publishable_example'), 'User publishable key should not be persisted before remote opt-in.');

  assert(existsSync(projectTelemetryConfig), 'Setup smoke test missing project telemetry config.');
  assert(existsSync(projectTelemetryEvents), 'Setup smoke test missing project telemetry events file.');
  assert(existsSync(projectSyncState), 'Setup smoke test missing remote sync state file.');
  assert(readFileSync(projectTelemetryConfig, 'utf8').includes('JBU_TELEMETRY_ENABLED=1'), 'Project telemetry should enable when requested.');
  assert(readFileSync(projectTelemetryConfig, 'utf8').includes('JBU_TELEMETRY_REMOTE_ENABLED=1'), 'Project remote telemetry should enable only when requested.');
  assert(readFileSync(projectTelemetryConfig, 'utf8').includes("JBU_TELEMETRY_REMOTE_URL='https://example.supabase.co'"), 'Project remote URL should be stored.');
  assert(readFileSync(projectTelemetryConfig, 'utf8').includes("JBU_TELEMETRY_REMOTE_KEY='sb_publishable_example'"), 'Project publishable key should be stored.');
  assert(readFileSync(projectTelemetryEvents, 'utf8').includes('\tsetup_install\tsetup\t'), 'Project telemetry should record setup_install when enabled.');
}

async function startMockTelemetryServer(tempRoot) {
  const requestDumpPath = join(tempRoot, 'remote-request.json');
  const serverPath = join(tempRoot, 'mock-telemetry-server.mjs');
  const port = 41000 + Math.floor(Math.random() * 10000);

  writeFileSync(
    serverPath,
    `import http from 'node:http';\nimport { writeFileSync } from 'node:fs';\nconst [portArg, outputPath] = process.argv.slice(2);\nconst server = http.createServer((req, res) => {\n  const chunks = [];\n  req.on('data', (chunk) => chunks.push(chunk));\n  req.on('end', () => {\n    writeFileSync(outputPath, Buffer.concat(chunks).toString('utf8'));\n    res.writeHead(200, { 'content-type': 'application/json' });\n    res.end(JSON.stringify({ inserted: 1 }));\n    server.close(() => process.exit(0));\n  });\n});\nserver.listen(Number(portArg), '127.0.0.1', () => process.stdout.write('ready\\n'));\n`
  );

  const child = spawn(process.execPath, [serverPath, String(port), requestDumpPath], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'inherit']
  });

  const [ready] = await once(child.stdout, 'data');
  assert(String(ready).includes('ready'), 'Mock telemetry server did not start cleanly.');

  return {
    child,
    requestDumpPath,
    url: `http://127.0.0.1:${port}`
  };
}

async function validateTelemetrySmoke() {
  const telemetryPath = join(root, 'bin', 'jbu-telemetry');
  execFileSync('bash', ['-n', telemetryPath], { cwd: root });

  const tempRoot = mkdtempSync(join(tmpdir(), 'ju-telemetry-'));
  const telemetryDir = join(tempRoot, 'telemetry');

  execFileSync(telemetryPath, ['init', '--dir', telemetryDir], { cwd: root });

  const configPath = join(telemetryDir, 'config.env');
  const eventsPath = join(telemetryDir, 'events.tsv');
  const syncStatePath = join(telemetryDir, 'remote-sync.tsv');
  assert(existsSync(configPath), 'Telemetry smoke test missing config.env.');
  assert(existsSync(eventsPath), 'Telemetry smoke test missing events.tsv.');
  assert(existsSync(syncStatePath), 'Telemetry smoke test missing remote-sync.tsv.');
  assert(readFileSync(configPath, 'utf8').includes('JBU_TELEMETRY_ENABLED=0'), 'Telemetry init should default to disabled.');
  assert(readFileSync(configPath, 'utf8').includes('JBU_TELEMETRY_REMOTE_ENABLED=0'), 'Telemetry init should default remote sync to disabled.');

  const initialEvents = readFileSync(eventsPath, 'utf8').trim().split('\n');
  assert(initialEvents.length === 1, 'Disabled telemetry should not write events during init.');

  execFileSync(telemetryPath, ['enable', '--dir', telemetryDir], { cwd: root });
  execFileSync(telemetryPath, ['log', '--dir', telemetryDir, '--source', 'validate', 'skill_run', 'skill=office-hours', 'host=codex'], {
    cwd: root
  });
  execFileSync(
    telemetryPath,
    ['log', '--dir', telemetryDir, '--source', '/Users/jdc/private-repo', 'unsafe/path', 'prompt=secret', 'path=/Users/jdc/private.txt', 'repo=private-repo', 'branch=feature/secret'],
    { cwd: root }
  );

  const mockServer = await startMockTelemetryServer(tempRoot);
  execFileSync(telemetryPath, ['remote-enable', '--dir', telemetryDir, '--url', mockServer.url, '--key', 'sb_publishable_test'], { cwd: root });

  const dryRun = execFileSync(telemetryPath, ['sync', '--dir', telemetryDir, '--dry-run', '--batch-size', '20'], {
    cwd: root,
    encoding: 'utf8'
  });
  assert(dryRun.includes('instance_digest'), 'Telemetry dry-run should expose the safe envelope.');
  assert(dryRun.includes('custom_event'), 'Telemetry dry-run should downgrade unsafe event names.');
  assert(dryRun.includes('custom_source'), 'Telemetry dry-run should downgrade unsafe source names.');
  assert(!dryRun.includes('prompt=secret'), 'Telemetry dry-run must not include payload values.');
  assert(!dryRun.includes('path=/Users/jdc/private.txt'), 'Telemetry dry-run must not include file paths.');
  assert(!dryRun.includes('repo=private-repo'), 'Telemetry dry-run must not include repo names.');
  assert(!dryRun.includes('branch=feature/secret'), 'Telemetry dry-run must not include branch names.');
  assert(!dryRun.includes('repo_root'), 'Telemetry dry-run must not include repo_root.');

  execFileSync(telemetryPath, ['sync', '--dir', telemetryDir, '--batch-size', '20'], { cwd: root });
  await once(mockServer.child, 'exit');

  const requestBody = readFileSync(mockServer.requestDumpPath, 'utf8');
  const requestJson = JSON.parse(requestBody);
  assert(Array.isArray(requestJson.events) && requestJson.events.length >= 3, 'Telemetry sync should send pending events.');
  for (const event of requestJson.events) {
    const keys = Object.keys(event).sort().join(',');
    assert(keys === 'event_digest,event_name,instance_digest,occurred_at,source_name', 'Telemetry sync should only send safe keys.');
  }
  assert(!requestBody.includes('prompt=secret'), 'Telemetry sync must not include payload values.');
  assert(!requestBody.includes('/Users/jdc/private.txt'), 'Telemetry sync must not include file paths.');
  assert(!requestBody.includes('private-repo'), 'Telemetry sync must not include repo names.');
  assert(!requestBody.includes('feature/secret'), 'Telemetry sync must not include branch names.');
  assert(!requestBody.includes('repo_root'), 'Telemetry sync must not include repo_root.');

  const syncState = readFileSync(syncStatePath, 'utf8').trim().split('\n');
  assert(syncState.length > 1, 'Telemetry sync should mark digests as synced.');

  const status = execFileSync(telemetryPath, ['status', '--dir', telemetryDir], { cwd: root, encoding: 'utf8' });
  assert(status.includes('remote sync: enabled'), 'Telemetry status should report remote sync state.');
  assert(status.includes('remote pending: 0'), 'Telemetry status should report no pending remote events after sync.');

  const dashboard = execFileSync(telemetryPath, ['dashboard', '--dir', telemetryDir, '--limit', '5'], { cwd: root, encoding: 'utf8' });
  assert(dashboard.includes('skill_run'), 'Telemetry dashboard should summarize local events.');
  assert(dashboard.includes('remote sync: enabled'), 'Telemetry dashboard should summarize remote state.');
}

async function main() {
  const requiredFiles = [
    'README.md',
    'INSTALL.md',
    'AGENTS.md',
    'CLAUDE.md',
    'CONTRIBUTING.md',
    'package.json',
    'setup',
    'bin/jbu-telemetry',
    'docs/PHILOSOPHY.md',
    'docs/VOICE.md',
    'docs/PROMO.md',
    'docs/ROUTING.md',
    'docs/SAFETY.md',
    'docs/TELEMETRY.md',
    'docs/ARCHITECTURE.md',
    'docs/SPEC.md',
    'docs/EXAMPLES.md',
    'scripts/sync_agents.mjs',
    'scripts/validate_repo.mjs',
    'supabase/config.toml',
    'supabase/functions/jbu-telemetry-ingest/index.ts',
    'supabase/migrations/20260326000000_jbu_telemetry.sql'
  ];

  for (const relativePath of requiredFiles) {
    const fullPath = join(root, relativePath);
    assert(existsSync(fullPath), `Missing required file: ${relativePath}`);
  }

  const catalog = readSkillCatalog(root);
  assert(catalog.length >= 12, 'Expected a real skill pack, but found too few skills.');
  validateSkills(catalog);
  validateGeneratedArtifacts();
  validateNoRepoMirror();
  validateSupabaseArtifacts();

  const markdownFiles = [
    ...walkMarkdown(join(root, 'docs')),
    ...walkMarkdown(join(root, 'skills')),
    ...walkMarkdown(join(root, 'commands')),
    join(root, 'README.md'),
    join(root, 'INSTALL.md'),
    join(root, 'AGENTS.md'),
    join(root, 'CLAUDE.md'),
    join(root, 'CONTRIBUTING.md')
  ];

  for (const filePath of markdownFiles) {
    validateLinks(filePath);
  }

  validateSetupSmoke();
  await validateTelemetrySmoke();

  const commandCount = readdirSync(join(root, 'commands')).filter((name) => name.endsWith('.md')).length;
  console.log(`Validated ${catalog.length} skills, ${commandCount} generated commands, and ${markdownFiles.length} Markdown files.`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
