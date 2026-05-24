/**
 * HABIBI-SIEM — failure-driven learning, concept checks, reflection prompts
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'habibi-learning-v1';

  function loadAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) { /* */ }
  }

  function recordConceptCheck(gameId, levelNum, questionId, correct) {
    var all = loadAll();
    if (!all[gameId]) all[gameId] = { checks: [], reflections: [], conceptMastery: [] };
    all[gameId].checks.push({
      level: levelNum,
      questionId: questionId,
      correct: !!correct,
      at: Date.now()
    });
    all[gameId].conceptMastery.push(correct ? 1 : 0);
    saveAll(all);
  }

  function getFailureFeedback(gameId, levelNum, errorType, attemptCount) {
    var bank = FEEDBACK_BANK[gameId];
    if (!bank) return null;
    var levelBank = bank['level' + levelNum];
    if (!levelBank || !levelBank[errorType]) return null;
    var entry = levelBank[errorType];
    if (attemptCount >= 2) return entry.second || entry.first;
    if (attemptCount >= 1) return entry.first;
    return null;
  }

  function getRealWorldConnection(gameId, levelNum) {
    var conn = REAL_WORLD[gameId];
    return conn && conn['level' + levelNum] ? conn['level' + levelNum] : '';
  }

  function showConceptCheckModal(question) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'habibi-learn-overlay';
      overlay.innerHTML =
        '<div class="habibi-learn-card" role="dialog">' +
        '<h3>Concept check</h3>' +
        '<p class="habibi-learn-q">' + escapeHtml(question.text) + '</p>' +
        '<div class="habibi-learn-opts"></div>' +
        '<button type="button" class="habibi-learn-skip">Continue</button>' +
        '</div>';
      document.body.appendChild(overlay);
      var opts = overlay.querySelector('.habibi-learn-opts');
      question.options.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'habibi-learn-opt';
        btn.textContent = opt.label;
        btn.addEventListener('click', function () {
          overlay.remove();
          resolve({ index: i, correct: opt.correct, explain: opt.explain });
        });
        opts.appendChild(btn);
      });
      overlay.querySelector('.habibi-learn-skip').addEventListener('click', function () {
        overlay.remove();
        resolve({ skipped: true });
      });
    });
  }

  function showReflectionModal(gameId, storyChoices, levelOutcomes) {
    var prompts = REFLECTION_PROMPTS[gameId] || REFLECTION_PROMPTS.default;
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'habibi-learn-overlay';
      var html = '<div class="habibi-learn-card habibi-learn-wide"><h3>Debrief reflection</h3>';
      prompts.forEach(function (p, i) {
        html += '<p class="habibi-learn-q">' + escapeHtml(p.question) + '</p><div class="habibi-learn-opts" data-idx="' + i + '">';
        p.options.forEach(function (opt) {
          html += '<button type="button" class="habibi-learn-opt" data-val="' + escapeHtml(opt.id) + '">' + escapeHtml(opt.label) + '</button>';
        });
        html += '</div>';
      });
      html += '<button type="button" class="habibi-learn-done">Submit debrief</button></div>';
      overlay.innerHTML = html;
      document.body.appendChild(overlay);
      var answers = {};
      overlay.querySelectorAll('.habibi-learn-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var wrap = btn.closest('.habibi-learn-opts');
          var idx = wrap.getAttribute('data-idx');
          wrap.querySelectorAll('.habibi-learn-opt').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          answers[idx] = btn.getAttribute('data-val');
        });
      });
      overlay.querySelector('.habibi-learn-done').addEventListener('click', function () {
        overlay.remove();
        var all = loadAll();
        if (!all[gameId]) all[gameId] = { checks: [], reflections: [], conceptMastery: [] };
        all[gameId].reflections.push({ answers: answers, at: Date.now(), storyChoices: storyChoices });
        saveAll(all);
        resolve(answers);
      });
    });
  }

  function buildLearningSummary(gameId) {
    var all = loadAll();
    var g = all[gameId];
    if (!g) return { mastery: 0, checks: 0, pattern: 'unknown' };
    var mastery = g.conceptMastery.length
      ? g.conceptMastery.reduce(function (a, b) { return a + b; }, 0) / g.conceptMastery.length
      : 0;
    return {
      mastery: Math.round(mastery * 100),
      checks: g.checks.length,
      reflections: g.reflections.length,
      pattern: 'Recorded across ' + g.checks.length + ' concept checks'
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var FEEDBACK_BANK = {
    the_terminal: {
      level1: {
        wrong_command: {
          first: 'That command is not recognized. Level 1 tasks use basic builtins: ls, pwd, whoami, date, echo.',
          second: 'Hint: the task asks you to list directory contents. The command starts with the letter L and is two characters.'
        },
        syntax_error: {
          first: 'Shell syntax error — check spacing and spelling. Commands are case-sensitive on this appliance.',
          second: 'Try typing exactly: ls (no arguments needed for the first task).'
        }
      },
      level2: {
        wrong_chain: {
          first: 'Your pipeline did not return .log files modified in the last hour. Use find with -name "*.log" and -mmin -60.',
          second: 'Example chain: find . -name "*.log" -mmin -60 — this filters by name and modification time.'
        }
      },
      level3: {
        missed_ip: {
          first: 'The suspicious connection to 192.168.1.100 between 02:00–03:00 was not isolated. Re-run grep on auth.log, then awk to filter timestamps.',
          second: 'Pipeline tip: grep "192.168.1.100" auth.log | grep "02:" | sort | uniq -c sorts connections by volume.'
        }
      }
    },
    the_breach: {
      level1: {
        wrong_command: {
          first: 'Blocking the IP immediately is reactive. For SQL injection against a dev form, notify the developer to patch input validation first.',
          second: 'Correct triage: ALERT DEV — the vulnerability is in application code; network block alone leaves the flaw exploitable from other IPs.'
        }
      },
      level2: {
        wrong_command: {
          first: 'Five alerts in 60 seconds requires ESCALATE to bring tier-2 online — solo triage risks SLA breach.',
          second: 'Use ESCALATE when alert volume exceeds your concurrent handling capacity.'
        }
      }
    },
    the_ghost_network: {
      level1: {
        wrong_command: {
          first: 'Before flagging links, establish baseline — use BASELINE OK after identifying normal device roles.',
          second: 'Network hunts start with inventory and role mapping, not immediate isolation.'
        }
      }
    },
    the_cipher: {
      level1: {
        wrong_command: {
          first: 'Caesar ciphers break with ROTATE WHEEL — try shifting the alphabet before guessing plaintext.',
          second: 'Each wheel position maps A→D, B→E, etc. Match ciphertext letters to plaintext.'
        }
      }
    },
    the_simulation: {
      level1: {
        wrong_command: {
          first: 'Kill chain stage 1 is reconnaissance — use DETECT RECON before blocking delivery.',
          second: 'MITRE ordering matters: you cannot patch exploitation before detecting delivery.'
        }
      }
    },
    the_interrogation_room: {
      level1: {
        wrong_command: {
          first: 'C2 beacons often hide in base64 blobs — DECODE B64 before extracting IPs.',
          second: 'HTTPS noise masks beacon timing; decode payload batches first.'
        }
      }
    },
    the_forge: {
      level1: {
        wrong_command: {
          first: 'Rules need trigger + filter — start with ADD TRIGGER before tuning thresholds.',
          second: 'Detection engineering follows: trigger event → filter noise → test → tune.'
        }
      }
    },
    the_deep_archive: {
      level1: {
        wrong_command: {
          first: 'Forensics requires chronological order — SORT LOGS before anchoring timeline events.',
          second: 'Unsorted logs produce false causality; timestamp order is non-negotiable.'
        }
      }
    },
    the_heist: {
      level1: {
        wrong_command: {
          first: 'Red team ops start with RECON — map checkpoints before staging tools.',
          second: 'Skipping recon triggers rapid-request detection rules in the SIEM.'
        }
      }
    },
    the_lab: {
      level1: {
        wrong_command: {
          first: 'Lab validation starts with controlled brute-force to trigger failed_auth — INJECT BRUTE.',
          second: 'Start with known-bad auth patterns before web attack payloads.'
        }
      }
    },
    the_cartography: {
      level1: {
        wrong_command: {
          first: 'Threat globe analysis begins with FILTER LAYER to show actor origin regions.',
          second: 'Without geographic context, arc attribution is guesswork.'
        }
      }
    },
    the_memorial: {
      level1: {
        wrong_command: {
          first: 'Post-incident review starts with READ CHAPTER — understand narrative before mapping MITRE.',
          second: 'Memorial modules teach from historical breaches; read before quoting.'
        }
      }
    },
    the_resonance: {
      level1: {
        wrong_command: {
          first: 'Rule optimization requires ENABLE AUDIO to map six SIEM channels first.',
          second: 'You cannot balance alert vs ingest channels without identifying them.'
        }
      }
    }
  };

  var REAL_WORLD = {
    the_terminal: {
      level1: 'Real SOCs use CLI for speed: listing directories with ls is the first step in almost every log hunt runbook.',
      level2: 'Threat hunters chain find/grep/awk daily — a single Splunk or Elastic query often mirrors this exact pipeline.',
      level3: 'Auth log correlation at 02:00–03:00 UTC often indicates off-hours credential stuffing; mean time to detect drops when analysts automate these filters.',
      level4: 'Forensic timeline reconstruction is prerequisite to incident classification — NIST SP 800-61 lists timeline analysis under containment preparation.',
      level5: 'Executive briefings require audience adaptation: impact for leadership, root cause for engineers, timeframe for legal/compliance.'
    },
    the_breach: {
      level1: 'Tier-1 analysts see 200+ alerts per shift; distinguishing SQLi on a staging app from active ransomware on DC-01 is core triage skill.',
      level2: 'Escalation SLAs: many SOCs require human response within 60 seconds for high-severity alerts — your 5-alert scenario mirrors that pressure.',
      level3: 'Blocking without investigation preserves uptime but destroys evidence; 67% of IR reports cite incomplete logs as top remediation blocker.',
      level4: 'Ransomware containment balances isolation speed with forensic preservation — NIST recommends segmented network quarantine.',
      level5: 'Executive debriefs translate technical IOCs into business risk language for board reporting.'
    },
    the_ghost_network: {
      level1: 'Network topology baselines detect shadow IT and rogue devices — CMDB drift is a top MITRE initial access vector.',
      level2: 'NetFlow and Zeek logs power lateral movement detection in enterprise SOCs.',
      level3: 'Isolating a node without tracing paths leaves adjacent compromised hosts active.',
      level4: 'C2 channel identification drives firewall and DNS sinkhole rules.',
      level5: 'Micro-segmentation plans emerge from hunt findings — zero trust adoption often starts here.'
    },
    the_cipher: {
      level1: 'Caesar ciphers appear in CTF and malware config obfuscation — rotation is the first automated break attempt.',
      level2: 'Frequency analysis breaks classical substitution — English E/T/A dominate letter counts.',
      level3: 'Rotor machines teach why modern crypto uses computational hardness, not secrecy of algorithm.',
      level4: 'Weak RSA modulus factorization remains a pentest finding on legacy appliances.',
      level5: 'Cryptographic agility — ability to swap algorithms — is now a compliance requirement.'
    },
    the_simulation: {
      level1: 'Recon detection reduces dwell time — mean time to detect correlates with scan visibility.',
      level2: 'Phishing delivery remains #1 initial access — email gateway + user reporting loops matter.',
      level3: 'Patch management SLAs directly affect exploitation window length.',
      level4: 'C2 kill switches are emergency playbooks in mature SOCs.',
      level5: 'After-action reviews map missed controls to MITRE techniques for gap analysis.'
    },
    the_interrogation_room: {
      level1: 'Beaconing detection uses jitter and interval analysis — not all C2 looks like HTTPS.',
      level2: 'Base64 in HTTP headers is a classic exfil staging pattern.',
      level3: 'IOC extraction feeds threat intel platforms and block lists.',
      level4: 'Malware family attribution guides containment playbooks.',
      level5: 'STIX/TAXII sharing packages IOCs for sector ISACs.'
    },
    the_forge: {
      level1: 'Sigma and KQL rules start with a trigger event and scope filters.',
      level2: 'False positive rate above 10% causes alert fatigue and missed true positives.',
      level3: 'Correlation rules link low-severity events into high-severity incidents.',
      level4: 'Detection validation uses replay logs before production deploy.',
      level5: 'Rule lifecycle includes owner, review date, and deprecation — detection debt is real.'
    },
    the_deep_archive: {
      level1: 'Log retention policies (often 90–365 days) constrain forensic reach.',
      level2: 'Timeline anchors use authoritative time sources — clock skew breaks causality.',
      level3: 'Event linking uses session IDs, process lineage, and user context.',
      level4: 'Root cause analysis distinguishes symptom alerts from initiating failure.',
      level5: 'Forensic reports support legal hold and regulatory notification timelines.'
    },
    the_heist: {
      level1: 'Red team recon mirrors attacker OSINT — SIEM detects scan bursts and auth anomalies.',
      level2: 'Credential paths without brute force use stolen tokens or misconfigured service accounts.',
      level3: 'Data staging triggers DLP and volume-based exfil rules.',
      level4: 'SOAR playbooks auto-escalate when suppression windows expire.',
      level5: 'Purple team exercises close gaps found during red team runs.'
    },
    the_lab: {
      level1: 'Detection labs validate rules with synthetic attacks before adversaries arrive.',
      level2: 'SQLi alerts often fire on WAF logs before database compromise.',
      level3: 'XSS findings drive CSP and output encoding fixes in dev pipelines.',
      level4: 'Correlation thresholds prevent single-event noise from paging on-call.',
      level5: 'Coverage charts show which MITRE techniques lack active detections.'
    },
    the_cartography: {
      level1: 'GeoIP enriches firewall logs for actor origin mapping.',
      level2: 'Attack arcs visualize campaign targeting patterns over time.',
      level3: 'TTP matching uses MITRE ATT&CK and threat actor profiles.',
      level4: 'Predictive targeting supports proactive hardening of likely next victims.',
      level5: 'Strategic briefs align security spend with observed threat landscape.'
    },
    the_memorial: {
      level1: 'Historical breaches (Equifax, SolarWinds) inform control frameworks.',
      level2: 'Executive quotes from post-mortems highlight culture and process failures.',
      level3: 'MITRE mapping shows which techniques were undetected too long.',
      level4: 'SIEM gap analysis asks: which rule would have fired if it existed?',
      level5: 'Lessons learned must become tracked remediation items — otherwise history repeats.'
    },
    the_resonance: {
      level1: 'Alert tuning balances sensitivity vs analyst capacity — the core SOC trade-off.',
      level2: 'Ingest volume vs detection signal is a cost and visibility equation.',
      level3: 'Noise channels (ambient logs) mask critical alerts if not filtered.',
      level4: 'Solo critical alerts help analysts focus during incident surges.',
      level5: 'Optimized detection profiles export to SIEM content packs for reuse.'
    }
  };

  var REFLECTION_PROMPTS = {
    the_terminal: [
      {
        question: 'How would you explain tonight\'s timeline to a non-technical manager?',
        options: [
          { id: 'impact', label: 'Focus on business impact and downtime risk' },
          { id: 'technical', label: 'Focus on the exact commands and log sources' },
          { id: 'timeframe', label: 'Focus on when events occurred and response window' }
        ]
      }
    ],
    default: [
      {
        question: 'What trade-off mattered most in your decisions?',
        options: [
          { id: 'speed', label: 'Speed of response' },
          { id: 'accuracy', label: 'Accuracy and evidence preservation' },
          { id: 'balance', label: 'Balanced both' }
        ]
      }
    ]
  };

  var CONCEPT_CHECKS = {
    the_terminal: {
      1: {
        text: 'Why do SOC analysts prefer CLI over GUI for log review?',
        options: [
          { label: 'CLI enables scripting, remote access, and faster repetition', correct: true, explain: 'Correct — automation and SSH access are why terminals remain standard in SOCs.' },
          { label: 'GUI tools cannot display text', correct: false, explain: 'GUIs display text fine; they are slower for scripted repeatable hunts.' },
          { label: 'CLI uses less electricity', correct: false, explain: 'Power usage is irrelevant; workflow speed and scriptability drive CLI adoption.' }
        ]
      }
    }
  };

  global.HabibiLearning = {
    recordConceptCheck: recordConceptCheck,
    getFailureFeedback: getFailureFeedback,
    getRealWorldConnection: getRealWorldConnection,
    showConceptCheckModal: showConceptCheckModal,
    showReflectionModal: showReflectionModal,
    buildLearningSummary: buildLearningSummary,
    CONCEPT_CHECKS: CONCEPT_CHECKS
  };
})(typeof window !== 'undefined' ? window : globalThis);
