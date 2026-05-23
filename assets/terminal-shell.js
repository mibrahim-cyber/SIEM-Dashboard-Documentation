/**
 * Meridian-7 Terminal — in-memory filesystem + command interpreter
 */
(function (global) {
  'use strict';

  var SEVS = ['INFO', 'WARN', 'LOW', 'MED', 'HIGH', 'CRIT'];
  var RULES = ['brute-force', 'sql-injection', 'port-scan', 'lateral-move', 'data-exfil', 'dns-tunnel'];
  var IPS = ['10.0.4.12', '192.168.1.44', '203.0.113.8', '172.16.0.91', '10.10.10.5'];

  function genAlerts(n) {
    var lines = [];
    var base = Date.now() - n * 60000;
    for (var i = 0; i < n; i++) {
      var ts = new Date(base + i * 60000).toISOString();
      var sev = SEVS[i % SEVS.length];
      var rule = RULES[i % RULES.length];
      var ip = IPS[i % IPS.length];
      lines.push('[' + ts + '] ' + sev + ' rule=' + rule + ' src=' + ip + ' msg=Alert #' + (i + 1) + ' correlation_id=M7-' + String(10000 + i));
    }
    return lines.join('\n');
  }

  function mkFile(content, mode) {
    return { type: 'file', content: content || '', mode: mode || '644', mtime: Date.now() };
  }

  function mkDir(children) {
    return { type: 'dir', children: children || {}, mode: '755', mtime: Date.now() };
  }

  var FS = mkDir({
    home: mkDir({
      analyst: mkDir({
        '.bash_history': mkFile('ls\nwhoami\ncat /var/log/siem/alerts.log | head\ngrep CRIT /var/log/siem/alerts.log\nman habibi\n'),
        'notes.txt': mkFile('Remember: SIEM_SECRET is not in plaintext.\nCheck /opt/siem/config.json for pipeline status.\n'),
        'motd_seen': mkFile(''),
      }),
    }),
    var: mkDir({
      log: mkDir({
        siem: mkDir({
          'alerts.log': mkFile(genAlerts(2100)),
          'ingest.log': mkFile('[boot] ingest pipeline online\n[ok] parser bundle v15.1\n'),
          'audit.log': mkFile('[audit] session opened\n'),
        }),
      }),
    }),
    etc: mkDir({
      hostname: mkFile('meridian-7-terminal\n'),
      motd: mkFile(
        '╔══════════════════════════════════════════════════╗\n' +
        '║  MERIDIAN-7 SIEM · ANALYST TERMINAL v15.1        ║\n' +
        '║  Authorized personnel only. All actions logged.  ║\n' +
        '╚══════════════════════════════════════════════════╝\n'
      ),
      'passwd': mkFile('root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:Analyst:/home/analyst:/bin/bash\n'),
    }),
    opt: mkDir({
      siem: mkDir({
        'config.json': mkFile(JSON.stringify({ version: '15.1.0', cluster: 'meridian-7', ingest: 'online', rules: 847 }, null, 2) + '\n'),
        'rules.db': mkFile('[binary stub — use forge.html for rule builder]\n'),
      }),
    }),
    proc: mkDir({
      '1': mkDir({ status: mkFile('Name:\tingestd\nState:\tS (sleeping)\n'), cmdline: mkFile('/usr/sbin/ingestd --config /opt/siem/config.json\n') }),
      '42': mkDir({ status: mkFile('Name:\trules-engine\nState:\tR (running)\n'), cmdline: mkFile('/usr/sbin/rules-engine\n') }),
      '1337': mkDir({ status: mkFile('Name:\tshell-session\nState:\tR (running)\n'), cmdline: mkFile('-bash\n') }),
    }),
    usr: mkDir({
      bin: mkDir({
        fortune: mkFile('#!/bin/sh\necho "The SIEM sees what the firewall forgot."\n'),
      }),
    }),
    tmp: mkDir({}),
  });

  var cwd = FS.children.home.children.analyst;
  var cwdPath = '/home/analyst';
  var user = 'analyst';
  var hostname = 'meridian-7';
  var history = [];
  var tailFInterval = null;
  var sudoUntil = 0;

  function resolvePath(path, base) {
    base = base || cwdPath;
    var parts = (path.startsWith('/') ? path : base + (base.endsWith('/') ? '' : '/') + path).split('/').filter(Boolean);
    var node = FS;
    var built = '';
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === '.') continue;
      if (parts[i] === '..') {
        built = built.split('/').slice(0, -1).join('/');
        var p = built || '/';
        node = FS;
        if (p !== '/') {
          p.split('/').filter(Boolean).forEach(function (seg) {
            node = node.children[seg];
          });
        }
        continue;
      }
      built += (built ? '/' : '') + parts[i];
      if (!node.children || !node.children[parts[i]]) return null;
      node = node.children[parts[i]];
    }
    return { node: node, path: '/' + built };
  }

  function listDir(dirNode) {
    return Object.keys(dirNode.children || {}).sort();
  }

  function formatLs(names, long) {
    if (!long) return names.join('  ');
    return names.map(function (n) {
      var ch = cwd.children[n];
      var typ = ch && ch.type === 'dir' ? 'd' : '-';
      return typ + 'rwxr-xr-x  1 analyst analyst  ' + (ch && ch.type === 'file' ? (ch.content || '').length : 4096) + '  ' + n;
    }).join('\n');
  }

  var FORTUNES = [
    'The SIEM sees what the firewall forgot.',
    'Correlation is caring.',
    'There is no patch for human error — only detections.',
    'Trust but verify. Then log it.',
    'The attacker reads your docs too.',
  ];

  var NMAP_OUTPUT = 'Starting Nmap 7.94\nNmap scan report for target\nPORT     STATE SERVICE\n22/tcp   open  ssh\n443/tcp  open  https\n8080/tcp open  http-proxy\n514/udp  open  syslog\n\nNmap done: 1 IP address scanned\n';

  var SSH_BANNER = 'Welcome to remote host siem-relay.internal\nLast login: Today from 10.0.4.12\n$ ';

  function stopTailF() {
    if (tailFInterval) {
      clearInterval(tailFInterval);
      tailFInterval = null;
    }
  }

  function runCommand(line, term, write) {
    var trimmed = line.trim();
    if (!trimmed) return;
    history.push(trimmed);
    var parts = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    var cmd = parts[0].replace(/^['"]|['"]$/g, '');
    var args = parts.slice(1).map(function (a) { return a.replace(/^['"]|['"]$/g, ''); });

    if (cmd === 'clear') { term.clear(); return; }
    if (cmd === 'history') {
      if (args[0] === 'payload') {
        write('\r\n\x1b[33m[!] Historical payload fragment recovered:\x1b[0m M7-HIST-0xDEADBEEF\r\n');
        if (global.SiemCore) global.SiemCore.SessionState.incrementEggs();
        return;
      }
      history.forEach(function (h, i) { write(String(i + 1).padStart(4) + '  ' + h + '\r\n'); });
      return;
    }

    if (cmd === 'whoami') {
      write(user + '\r\n');
      return;
    }

    if (cmd === 'SIEM_SECRET' || trimmed === 'echo $SIEM_SECRET') {
      write('\r\n\x1b[32mACCESS GRANTED — SIEM_SECRET=meridian-seven-observation-deck\x1b[0m\r\n');
      if (global.SiemCore) {
        global.SiemCore.AchievementSystem.check('egg_secret');
        global.SiemCore.SessionState.incrementEggs();
      }
      return;
    }

    if (cmd === 'fortune') {
      write(FORTUNES[Math.floor(Math.random() * FORTUNES.length)] + '\r\n');
      if (global.SiemCore) global.SiemCore.SessionState.incrementEggs();
      return;
    }

    if (cmd === 'rm' && args.join(' ') === '-rf /') {
      write('\r\n\x1b[31mrm: it is too late. The logs have already seen you.\x1b[0m\r\n');
      write('\x1b[90m[audit] rm -rf / blocked by immutable retention policy\x1b[0m\r\n');
      if (global.SiemCore) global.SiemCore.SessionState.incrementEggs();
      return;
    }

    if (cmd === 'man' && args[0] === 'habibi') {
      write('\r\nHABIBI-SIEM(7)          Meridian-7 Manual          HABIBI-SIEM(7)\r\n\r\n');
      write('NAME\r\n       habibi — the SIEM that watches with love\r\n\r\n');
      write('DESCRIPTION\r\n       Correlates alerts, ingests logs, and never sleeps.\r\n');
      write('       "Habibi" — Arabic for "my dear" — because your data deserves care.\r\n\r\n');
      if (global.SiemCore) global.SiemCore.AchievementSystem.check('egg_habibi');
      return;
    }

    if (cmd === 'ls') {
      var target = args.length && !args[0].startsWith('-') ? args[args.length - 1] : cwdPath;
      var long = args.indexOf('-l') !== -1 || args.indexOf('-la') !== -1;
      var resolved = resolvePath(target);
      if (!resolved || resolved.node.type !== 'dir') {
        write('ls: cannot access: No such directory\r\n');
        return;
      }
      write(formatLs(listDir(resolved.node), long) + '\r\n');
      return;
    }

    if (cmd === 'cat') {
      if (!args.length) { write('cat: missing operand\r\n'); return; }
      var r = resolvePath(args[0]);
      if (!r || r.node.type !== 'file') { write('cat: ' + args[0] + ': No such file\r\n'); return; }
      var content = r.node.content;
      var lines = content.split('\n');
      if (lines.length > 40) {
        write(content.split('\n').slice(0, 40).join('\r\n') + '\r\n');
        write('\x1b[90m-- pager: ' + lines.length + ' lines total (showing 40, use less) --\x1b[0m\r\n');
      } else {
        write(content.replace(/\n/g, '\r\n') + (content.endsWith('\n') ? '' : '\r\n'));
      }
      return;
    }

    if (cmd === 'grep') {
      var pattern = args[0];
      var fileArg = args[args.length - 1];
      if (!pattern || !fileArg) { write('grep: usage: grep PATTERN FILE\r\n'); return; }
      var rf = resolvePath(fileArg);
      if (!rf || rf.node.type !== 'file') { write('grep: ' + fileArg + ': No such file\r\n'); return; }
      var re;
      try { re = new RegExp(pattern); } catch (_) { write('grep: invalid pattern\r\n'); return; }
      rf.node.content.split('\n').forEach(function (ln) {
        if (re.test(ln)) write(ln + '\r\n');
      });
      return;
    }

    if (cmd === 'ssh') {
      write(SSH_BANNER);
      return;
    }

    if (cmd === 'nmap') {
      write(NMAP_OUTPUT.replace(/\n/g, '\r\n'));
      return;
    }

    if (cmd === 'tail') {
      if (args[0] === '-f' && args[1]) {
        stopTailF();
        var rt = resolvePath(args[1]);
        if (!rt || rt.node.type !== 'file') { write('tail: cannot open\r\n'); return; }
        var tailLines = rt.node.content.split('\n').slice(-5);
        tailLines.forEach(function (l) { write(l + '\r\n'); });
        write('\x1b[90m-- following ' + args[1] + ' (Ctrl+C to stop) --\x1b[0m\r\n');
        var tick = 0;
        tailFInterval = setInterval(function () {
          tick++;
          var sev = SEVS[tick % SEVS.length];
          write('[' + new Date().toISOString() + '] ' + sev + ' rule=live-stream src=' + IPS[tick % IPS.length] + ' msg=tail -f event ' + tick + '\r\n');
        }, 2000);
        return;
      }
      write('tail: usage: tail -f FILE\r\n');
      return;
    }

    if (cmd === 'sudo') {
      if (Date.now() < sudoUntil) {
        write('[sudo] analyst already elevated (15 min TTL)\r\n');
        return;
      }
      write('[sudo] password for analyst: ');
      term.write('\x1b[8m'); // hidden
      var sudoBuf = '';
      var sudoHandler = term.onData(function (data) {
        if (data === '\r' || data === '\n') {
          term.write('\x1b[28m\r\n');
          sudoHandler.dispose();
          if (sudoBuf === 'meridian' || sudoBuf === 'habibi') {
            sudoUntil = Date.now() + 900000;
            write('[sudo] analyst ALL=(ALL) NOPASSWD: /opt/siem/*\r\n');
          } else {
            write('[sudo] sorry, try again.\r\n');
          }
          term.write(prompt());
          return;
        }
        if (data === '\u007f') { sudoBuf = sudoBuf.slice(0, -1); return; }
        sudoBuf += data;
      });
      return 'SUDO_PENDING';
    }

    if (cmd === 'ps') {
      write('  PID TTY          TIME CMD\r\n');
      write('    1 ?        00:00:01 ingestd\r\n');
      write('   42 ?        00:12:44 rules-engine\r\n');
      write(' 1337 pts/0    00:00:00 bash\r\n');
      return;
    }

    if (cmd === 'top') {
      write('Tasks: 3 total, 1 running, 2 sleeping\r\n');
      write('  PID USER      PR  NI    VIRT    RES  %CPU COMMAND\r\n');
      write('   42 analyst   20   0  512000  48000  12.3 rules-engine\r\n');
      write('    1 analyst   20   0  128000  12000   2.1 ingestd\r\n');
      write(' 1337 analyst   20   0   64000   8000   0.3 bash\r\n');
      write('\x1b[90m-- press q to exit (simulated) --\x1b[0m\r\n');
      return;
    }

    if (cmd === 'curl') {
      var url = args[0] || 'http://localhost/api/health';
      write('HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n');
      write('{"status":"ok","station":"meridian-7","url":"' + url + '"}\r\n');
      return;
    }

    if (cmd === 'python3') {
      if (args.join(' ') === '-c "print(42)"' || (args[0] === '-c' && args[1] === 'print(42)')) {
        write('42\r\n');
        return;
      }
      write('Python 3.11.8 (Meridian stub)\r\n>>> \r\n');
      write('\x1b[90mInteractive REPL stub — try: python3 -c "print(42)"\x1b[0m\r\n');
      return;
    }

    if (cmd === 'cd') {
      var cdTarget = args[0] || '/home/analyst';
      var cr = resolvePath(cdTarget);
      if (!cr || cr.node.type !== 'dir') { write('cd: ' + cdTarget + ': No such directory\r\n'); return; }
      cwd = cr.node;
      cwdPath = cr.path;
      return;
    }

    if (cmd === 'pwd') {
      write(cwdPath + '\r\n');
      return;
    }

    write('bash: ' + cmd + ': command not found\r\n');
  }

  function prompt() {
    return '\x1b[32m' + user + '@' + hostname + '\x1b[0m:\x1b[34m' + cwdPath + '\x1b[0m$ ';
  }

  global.TerminalShell = {
    FS: FS,
    runCommand: runCommand,
    prompt: prompt,
    stopTailF: stopTailF,
    getCwdPath: function () { return cwdPath; },
    getMotd: function () {
      return resolvePath('/etc/motd').node.content;
    },
  };
})(typeof window !== 'undefined' ? window : this);
