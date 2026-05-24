#!/usr/bin/env python3
"""Generate dio-guide.js with explicit 24x32 pixel arrays for every animation frame."""
from __future__ import annotations
from pathlib import Path
import textwrap

OUT = Path(__file__).resolve().parents[1] / "shared" / "dio-guide.js"
W, H = 24, 32

# Build base Dio silhouette as palette keys
def blank():
    return [[None for _ in range(W)] for _ in range(H)]


def rect(grid, x0, y0, x1, y1, key):
    for y in range(y0, min(y1 + 1, H)):
        for x in range(x0, min(x1 + 1, W)):
            if 0 <= y < H and 0 <= x < W:
                grid[y][x] = key


def draw_jojo_dio(offset_x=0, offset_y=0, mouth=0, eyes_wide=False, arm_point=False, arm_up=False, crouch=0, cape_side=0):
    """Humanoid Dio — visible anime face/jawline, hair frames face, professional readable silhouette."""
    g = blank()
    ox, oy = offset_x, offset_y
    # Hair — top + sides only (face center stays clear)
    rect(g, 6 + ox, 0 + oy, 17 + ox, 1 + oy, "HAIR")
    rect(g, 5 + ox, 1 + oy, 18 + ox, 2 + oy, "HAIR_DARK")
    rect(g, 4 + ox, 2 + oy, 6 + ox, 6 + oy, "HAIR")
    rect(g, 17 + ox, 2 + oy, 19 + ox, 6 + oy, "HAIR")
    rect(g, 6 + ox, 2 + oy, 17 + ox, 4 + oy, "HAIR")
    rect(g, 7 + ox, 4 + oy, 8 + ox, 8 + oy, "HAIR_DARK")
    rect(g, 15 + ox, 4 + oy, 16 + ox, 8 + oy, "HAIR_DARK")
    rect(g, 8 + ox, 3 + oy, 15 + ox, 5 + oy, "HAIR")
    # Heart headband
    rect(g, 7 + ox, 6 + oy, 16 + ox, 7 + oy, "HEART_BAND")
    rect(g, 11 + ox, 6 + oy, 12 + ox, 7 + oy, "HEART_GREEN")
    # Face — tapered jaw (anime chin)
    rect(g, 9 + ox, 8 + oy, 14 + ox, 8 + oy, "SKIN")
    rect(g, 8 + ox, 9 + oy, 15 + ox, 12 + oy, "SKIN")
    rect(g, 8 + ox, 13 + oy, 15 + ox, 13 + oy, "SKIN")
    rect(g, 9 + ox, 14 + oy, 14 + ox, 14 + oy, "SKIN")
    rect(g, 10 + ox, 15 + oy, 13 + ox, 15 + oy, "SKIN")
    # Jawline definition
    rect(g, 8 + ox, 13 + oy, 8 + ox, 14 + oy, "SKIN_DARK")
    rect(g, 15 + ox, 13 + oy, 15 + ox, 14 + oy, "SKIN_DARK")
    rect(g, 9 + ox, 14 + oy, 9 + ox, 15 + oy, "SKIN_DARK")
    rect(g, 14 + ox, 14 + oy, 14 + ox, 15 + oy, "SKIN_DARK")
    rect(g, 10 + ox, 15 + oy, 10 + ox, 15 + oy, "SKIN_DARK")
    rect(g, 13 + ox, 15 + oy, 13 + ox, 15 + oy, "SKIN_DARK")
    # Cheek shadow (subtle, not full face)
    rect(g, 8 + ox, 10 + oy, 8 + ox, 12 + oy, "SHADOW")
    rect(g, 15 + ox, 11 + oy, 15 + ox, 12 + oy, "SKIN_DARK")
    # Eyes
    brow = 9 + oy
    eye = 10 + oy
    if eyes_wide:
        rect(g, 9 + ox, eye, 11 + ox, eye + 1, "EYE_WHITE")
        rect(g, 12 + ox, eye, 14 + ox, eye + 1, "EYE_WHITE")
        rect(g, 10 + ox, eye, 10 + ox, eye, "EYE")
        rect(g, 13 + ox, eye, 13 + ox, eye, "EYE")
    else:
        rect(g, 9 + ox, brow, 11 + ox, brow, "SHADOW")
        rect(g, 12 + ox, brow, 14 + ox, brow, "SHADOW")
        rect(g, 10 + ox, eye, 11 + ox, eye, "EYE_WHITE")
        rect(g, 10 + ox, eye, 10 + ox, eye, "EYE")
        rect(g, 13 + ox, eye, 14 + ox, eye, "EYE_WHITE")
        rect(g, 13 + ox, eye, 13 + ox, eye, "EYE")
    # Mouth
    my = 12 + oy
    if mouth == 1:
        rect(g, 10 + ox, my, 13 + ox, my, "SHADOW")
    elif mouth == 2:
        rect(g, 9 + ox, my, 14 + ox, my + 1, "TEETH")
        rect(g, 10 + ox, my, 13 + ox, my, "MOUTH_IN")
    elif mouth == 3:
        rect(g, 11 + ox, my, 12 + ox, my, "SKIN_DARK")
    else:
        rect(g, 10 + ox, my, 13 + ox, my, "SHADOW")
        rect(g, 11 + ox, my - 1, 12 + ox, my - 1, "SKIN_DARK")
    # Neck
    rect(g, 10 + ox, 16 + oy, 13 + ox, 16 + oy, "SKIN")
    # Torso — humanoid jacket
    chest = 17 + oy + crouch
    rect(g, 7 + ox, chest, 16 + ox, 24 + oy + crouch, "JACKET")
    rect(g, 8 + ox, chest + 1, 15 + ox, 23 + oy + crouch, "JACKET_DARK")
    rect(g, 7 + ox, chest, 16 + ox, chest, "JACKET_GOLD")
    rect(g, 9 + ox, chest + 1, 14 + ox, chest + 3, "SHADOW")
    rect(g, 10 + ox, chest + 3, 13 + ox, 21 + oy + crouch, "SHADOW")
    if cape_side <= 0:
        rect(g, 5 + ox, chest + 2, 6 + ox, 27 + oy, "CAPE")
    if cape_side >= 0:
        rect(g, 17 + ox, chest + 2, 18 + ox, 27 + oy, "CAPE")
    # Arms
    if arm_point:
        rect(g, 16 + ox, 14 + oy + crouch, 22 + ox, 16 + oy + crouch, "JACKET")
        rect(g, 22 + ox, 14 + oy + crouch, 23 + ox, 15 + oy + crouch, "SKIN")
        rect(g, 5 + ox, 18 + oy + crouch, 7 + ox, 22 + oy + crouch, "JACKET")
    elif arm_up:
        rect(g, 5 + ox, 12 + oy + crouch, 8 + ox, 17 + oy + crouch, "JACKET")
        rect(g, 15 + ox, 12 + oy + crouch, 18 + ox, 17 + oy + crouch, "JACKET")
    else:
        rect(g, 5 + ox, 18 + oy + crouch, 7 + ox, 24 + oy + crouch, "JACKET")
        rect(g, 16 + ox, 18 + oy + crouch, 18 + ox, 24 + oy + crouch, "JACKET")
    # Legs
    ly = 25 + oy + crouch
    if crouch > 0:
        rect(g, 8 + ox, ly, 11 + ox, 31 + oy, "JACKET_DARK")
        rect(g, 12 + ox, ly, 15 + ox, 31 + oy, "JACKET_DARK")
    else:
        rect(g, 8 + ox, ly, 10 + ox, 31 + oy, "JACKET_DARK")
        rect(g, 13 + ox, ly, 15 + ox, 31 + oy, "JACKET_DARK")
    return g


# alias for frame builders
draw_base_dio = draw_jojo_dio


def draw_walk_frame(step, direction=1):
    ox = 0
    oy = 0
    leg_fwd = step % 4
    cape = -1 if step < 4 else 1
    g = draw_base_dio(offset_x=ox, offset_y=oy, mouth=0, cape_side=cape)
    if leg_fwd == 0:
        rect(g, 7, 25, 10, 31, "JACKET_DARK")
        rect(g, 14, 24, 16, 30, "JACKET_DARK")
    elif leg_fwd == 1:
        rect(g, 8, 24, 11, 31, "JACKET_DARK")
        rect(g, 13, 25, 15, 30, "JACKET_DARK")
    elif leg_fwd == 2:
        rect(g, 9, 25, 11, 31, "JACKET_DARK")
        rect(g, 13, 24, 16, 31, "JACKET_DARK")
    else:
        rect(g, 7, 24, 9, 30, "JACKET_DARK")
        rect(g, 14, 25, 17, 31, "JACKET_DARK")
    if step < 4:
        rect(g, 3, 17, 5, 27, "CAPE")
    else:
        rect(g, 18, 17, 20, 27, "CAPE")
    return g


def draw_dodge_frame(step):
    """All dodge frames stay humanoid — no abstract blocks."""
    if step == 0:
        return draw_base_dio(eyes_wide=True)
    if step == 1:
        return draw_base_dio(crouch=1, eyes_wide=True)
    if step == 2:
        return draw_base_dio(offset_y=-2, arm_up=True, eyes_wide=True)
    if step == 3:
        return draw_base_dio(offset_x=2, offset_y=-3, arm_up=True, cape_side=1)
    if step == 4:
        return draw_base_dio(offset_x=4, offset_y=-2, arm_point=True, mouth=2)
    return draw_base_dio(offset_x=6, offset_y=-1, mouth=1)


def draw_za_frame(step):
    if step == 0:
        return draw_base_dio(arm_up=True, cape_side=-1)
    if step == 1:
        g = draw_base_dio(offset_y=-2, arm_up=True)
        rect(g, 6, 0, 17, 3, "HAIR")
        return g
    if step == 2:
        return draw_base_dio(arm_point=True, arm_up=True, cape_side=1)
    if step == 3:
        return draw_base_dio(arm_point=True, arm_up=True, cape_side=1)
    return draw_base_dio(mouth=0)


def grid_to_js_rows(grid, indent="    "):
    lines = []
    for row in grid:
        lines.append(indent + "[")
        for c in row:
            if c is None:
                lines.append(indent + "  null,")
            else:
                lines.append(indent + f"  '{c}',")
        lines.append(indent + "],")
    return "\n".join(lines)


def emit_frame(name, grid):
    return f"  // {name}\n  [\n{grid_to_js_rows(grid)}\n  ]"


def build_frames():
    frames = {}
    frames["IDLE_FRAMES"] = []
    for i, (oy, cape, ox) in enumerate([(0, 0, 0), (-1, 0, 0), (0, 0, 0), (0, -1, -1)]):
        frames["IDLE_FRAMES"].append(draw_base_dio(offset_y=oy, offset_x=ox, cape_side=cape))
    frames["WALK_FRAMES"] = [draw_walk_frame(i) for i in range(8)]
    frames["POINT_FRAMES"] = [
        draw_base_dio(arm_point=False),
        draw_base_dio(arm_point=True),
        draw_base_dio(arm_point=True, cape_side=1),
    ]
    frames["DODGE_FRAMES"] = [draw_dodge_frame(i) for i in range(6)]
    frames["TALK_FRAMES"] = [draw_base_dio(offset_y=-1, mouth=m) for m in range(4)]
    frames["ZA_WARUDO_FRAMES"] = [draw_za_frame(i) for i in range(5)]
    frames["HOVER_FRAMES"] = [draw_base_dio(offset_y=0), draw_base_dio(offset_y=-2)]
    return frames


STORYLINE_JS = r'''
var DIO_STORYLINE = {
  'index': {
    enter: [
      "You have arrived at HABIBI-SIEM. I am DIO, your operations guide.",
      "Operation MERIDIAN-7 — thirteen trials, one breach, one story.",
      "Click the button below when you are ready. Only I can begin your investigation."
    ],
    tips: [
      "Each module unlocks the next in sequence.",
      "Complete all 13 to unlock your Analyst Debrief Report."
    ],
    nextAction: { label: "Begin Operation MERIDIAN-7", url: "experience-modules/game1-terminal/index.html" }
  },
  'game1-terminal': {
    enter: [
      "The Terminal. Where all analysts begin.",
      "Type commands. The system responds. Learn to read what it tells you.",
      "This is reconnaissance — the first phase of every investigation.",
      "Complete all 5 levels. I will be watching."
    ],
    level1: ["Level 1. Basic commands. Type: ls, then pwd, whoami, date, echo hello."],
    level2: ["Chain commands. find . -name '*.log' -mmin -60"],
    level3: ["grep 192.168.1.100 auth.log — watch the load bar."],
    level4: ["grep ACCESS, CMD, MODIFY, NET — rebuild the timeline."],
    level5: ["Epilogue. Your choices carry forward to The Breach."],
    complete: ["WRYYY. The Breach awaits. An incident is already in progress."],
    nextAction: { label: "Enter The Breach", url: "experience-modules/game2-breach/index.html" }
  },
  'game2-breach': {
    enter: [
      "The Breach. Alerts incoming. SQL injection. Brute force. Lateral movement.",
      "Triage correctly. Alert the right team.",
      "Your Terminal report already told me your approach."
    ],
    level1: ["SQL injection from 185.193.88.14. BLOCK IP first, then ALERT DEV."],
    level2: ["Five alerts. Five minutes. Match each alert to the correct playbook action."],
    level3: ["INVESTIGATE LOGS before BLOCK IP. Sequence matters."],
    level4: ["LOCKBIT-3 ransomware. Patient zero first, then contain, then escalate."],
    complete: ["Contained. The Ghost Network holds the lateral movement evidence."],
    nextAction: { label: "Enter The Ghost Network", url: "experience-modules/game3-network/index.html" }
  },
  'game3-network': {
    enter: ["The Ghost Network. Click nodes. Trace lateral movement."],
    level1: ["Find DC-01. The Domain Controller."],
    level2: ["Flag anomalous RDP from WS-003 to DC-01."],
    level3: ["Attacker enumerates. Next target: DB-01."],
    level4: ["C2 beats every 10 seconds. Find the pulse."],
    complete: ["The network told you everything. The Cipher is next."],
    nextAction: { label: "Enter The Cipher", url: "experience-modules/game4-cipher/index.html" }
  },
  'game4-cipher': {
    enter: ["The Cipher. Caesar. Substitution. Enigma. RSA."],
    level1: ["URYYB JBEYQ. Shift 13."],
    level2: ["Frequency analysis. E dominates English."],
    level3: ["Enigma rotors. Find the combination."],
    level4: ["RSA N=3233. Factor it."],
    complete: ["You can read their traffic. The Simulation shows the full kill chain."],
    nextAction: { label: "Enter The Simulation", url: "experience-modules/game5-simulation/index.html" }
  },
  'game5-simulation': {
    enter: ["The Simulation. Full MITRE kill chain."],
    level1: ["Reconnaissance detected. Block or segment."],
    level2: ["Phishing delivery. Choose your control."],
    level3: ["CVE-2024-1234 exploitation window."],
    level4: ["C2 and lateral movement. Stop both if you can."],
    complete: ["The Interrogation Room holds the decoded commands."],
    nextAction: { label: "Enter The Interrogation Room", url: "experience-modules/game6-intercept/index.html" }
  },
  'game6-intercept': {
    enter: ["The Interrogation Room. Decode C2. Extract IOCs."],
    complete: ["Playbook exposed. The Forge awaits."],
    nextAction: { label: "Enter The Forge", url: "experience-modules/game7-forge/index.html" }
  },
  'game7-forge': {
    enter: ["The Forge. Write detection rules. Catch malicious. Ignore benign."],
    complete: ["Rules written. Test them in The Deep Archive."],
    nextAction: { label: "Enter The Deep Archive", url: "experience-modules/game8-archive/index.html" }
  },
  'game8-archive': {
    enter: ["The Deep Archive. Sort logs. Reconstruct the timeline."],
    complete: ["Timeline complete. See the attack from the other side — The Heist."],
    nextAction: { label: "Enter The Heist", url: "experience-modules/game9-heist/index.html" }
  },
  'game9-heist': {
    enter: ["The Heist. Plan the attack path. Fewest hops. Least monitored."],
    complete: ["Both sides seen. Analyse the malware in The Lab."],
    nextAction: { label: "Enter The Lab", url: "experience-modules/game10-lab/index.html" }
  },
  'game10-lab': {
    enter: ["The Lab. Static analysis. Dynamic behaviour. Extract IOCs."],
    complete: ["Sample profiled. Cartography shows attribution."],
    nextAction: { label: "Enter The Cartography", url: "experience-modules/game11-cartography/index.html" }
  },
  'game11-cartography': {
    enter: ["The Cartography. Attribute the actor. Click the origin region."],
    complete: ["Attribution filed. The Memorial documents the lesson."],
    nextAction: { label: "Enter The Memorial", url: "experience-modules/game12-memorial/index.html" }
  },
  'game12-memorial': {
    enter: ["The Memorial. Root cause. Remediation. Document it."],
    complete: ["One trial remains. The Resonance."],
    nextAction: { label: "Enter The Resonance", url: "experience-modules/game13-resonance/index.html" }
  },
  'game13-resonance': {
    enter: ["The Resonance. Tune thresholds. Maximise signal."],
    complete: [
      "ZA WARUDO.",
      "All 13 trials complete.",
      "You traced MERIDIAN-7 from first alert to attribution.",
      "Your Debrief Report is ready.",
      "WRYYY."
    ],
    nextAction: { label: "View Debrief Report", url: "debrief.html" }
  },
  'terminal': { enter: ["Classic terminal experience. For 3D command center, use the 3D link."], nextAction: { label: "3D Terminal", url: "experience-modules/game1-terminal/index.html" } },
  'breach': { enter: ["Classic breach sim. 3D triage module available."], nextAction: { label: "3D Breach", url: "experience-modules/game2-breach/index.html" } },
  'network': { enter: ["Ghost Network classic view."], nextAction: { label: "3D Network", url: "experience-modules/game3-network/index.html" } },
  'cipher': { enter: ["Cipher vault classic."], nextAction: { label: "3D Cipher", url: "experience-modules/game4-cipher/index.html" } },
  'sim': { enter: ["Kill chain classic sim."], nextAction: { label: "3D Simulation", url: "experience-modules/game5-simulation/index.html" } },
  'intercept': { enter: ["Intercept room classic."], nextAction: { label: "3D Interrogation", url: "experience-modules/game6-intercept/index.html" } },
  'forge': { enter: ["Rule forge classic."], nextAction: { label: "3D Forge", url: "experience-modules/game7-forge/index.html" } },
  'archive': { enter: ["Deep archive classic."], nextAction: { label: "3D Archive", url: "experience-modules/game8-archive/index.html" } },
  'heist': { enter: ["Heist classic."], nextAction: { label: "3D Heist", url: "experience-modules/game9-heist/index.html" } },
  'lab': { enter: ["Detection lab classic."], nextAction: { label: "3D Lab", url: "experience-modules/game10-lab/index.html" } },
  'cartography': { enter: ["Threat globe classic."], nextAction: { label: "3D Cartography", url: "experience-modules/game11-cartography/index.html" } },
  'memorial': { enter: ["Memorial classic."], nextAction: { label: "3D Memorial", url: "experience-modules/game12-memorial/index.html" } },
  'resonance': { enter: ["Resonance classic."], nextAction: { label: "3D Resonance", url: "experience-modules/game13-resonance/index.html" } },
  'debrief': { enter: ["Operation MERIDIAN-7 debrief. Your analyst report."], nextAction: { label: "Return to Hub", url: "index.html" } }
};

var RECRUITER_SCRIPT = [
  "Welcome. I am DIO. I will give you the 90-second overview.",
  "HABIBI-SIEM is a Security Operations Centre simulator built entirely in-browser.",
  "13 games. Each teaches one phase of real SOC work — from log analysis to malware sandboxing.",
  "Built with Three.js, Cannon-es physics, and a shared progression engine.",
  "Game 1: The Terminal. CLI threat reconnaissance. MITRE T1059.",
  "Game 2: The Breach. Incident response triage. NIST RS.RP-1.",
  "Game 6: The Interrogation Room. C2 communication decoding. MITRE T1071.",
  "Game 7: The Forge. Detection rule engineering. SIGMA and YARA.",
  "Game 11: The Cartography. Threat actor attribution. MITRE Groups.",
  "Together the 13 games cover all 5 NIST CSF functions: Identify, Protect, Detect, Respond, Recover.",
  "The detection engine in the companion dashboard maps to STRIDE and MITRE ATT&CK.",
  "28 modules. 245 guides. One connected investigation across 13 playable experiences.",
  "That is HABIBI-SIEM. ZA WARUDO."
];
'''

DIO_CLASSES = r'''
var DIO_PALETTE = {
  SKIN: '#F4C88A',
  SKIN_DARK: '#D4A870',
  HAIR: '#F5E642',
  HAIR_DARK: '#C8BB20',
  HEART_BAND: '#FF4466',
  HEART_PINK: '#FF88AA',
  HEART_GREEN: '#44BB55',
  JACKET: '#F0D030',
  JACKET_DARK: '#C8A018',
  JACKET_GOLD: '#FFE860',
  CAPE: '#2A1048',
  COAT: '#2A1A4A',
  COAT_LIGHT: '#3D2A6A',
  COAT_GOLD: '#C8A020',
  SHIRT: '#F0E8D0',
  EYE: '#8040C0',
  EYE_DARK: '#401880',
  EYE_WHITE: '#FFFFFF',
  EYE_GLOW: '#CC66FF',
  TEETH: '#FFFFFF',
  MOUTH_IN: '#1A0818',
  SHADOW: '#0A0412',
  TRANSPARENT: null
};

function DioSprite(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.pixelSize = 5;
  this.currentAnimation = 'idle';
  this.currentFrame = 0;
  this.frameTimer = 0;
  this.guide = null;
  this.animations = {
    idle: { frames: IDLE_FRAMES, loop: true, fps: 8 },
    walk: { frames: WALK_FRAMES, loop: true, fps: 12 },
    point: { frames: POINT_FRAMES, loop: false, fps: 8 },
    dodge: { frames: DODGE_FRAMES, loop: false, fps: 16 },
    talk: { frames: TALK_FRAMES, loop: true, fps: 10 },
    za_warudo: { frames: ZA_WARUDO_FRAMES, loop: false, fps: 10 },
    hover: { frames: HOVER_FRAMES, loop: true, fps: 4 }
  };
}

DioSprite.prototype.drawFrame = function (frameData, offsetX, offsetY) {
  var row, col, colour;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  for (row = 0; row < 32; row++) {
    for (col = 0; col < 24; col++) {
      colour = frameData[row][col];
      if (colour === null) continue;
      this.ctx.fillStyle = DIO_PALETTE[colour];
      this.ctx.fillRect(
        offsetX + col * this.pixelSize,
        offsetY + row * this.pixelSize,
        this.pixelSize,
        this.pixelSize
      );
    }
  }
};

DioSprite.prototype.update = function (dt) {
  this.frameTimer += dt;
  var anim = this.animations[this.currentAnimation];
  var frameDuration = 1000 / anim.fps;
  if (this.frameTimer >= frameDuration) {
    this.frameTimer = 0;
    this.currentFrame++;
    if (this.currentFrame >= anim.frames.length) {
      if (anim.loop) {
        this.currentFrame = 0;
      } else {
        this.currentFrame = anim.frames.length - 1;
        this.onAnimationComplete(this.currentAnimation);
      }
    }
  }
};

DioSprite.prototype.playAnimation = function (name) {
  if (this.currentAnimation === name) return;
  this.currentAnimation = name;
  this.currentFrame = 0;
  this.frameTimer = 0;
};

DioSprite.prototype.onAnimationComplete = function (animName) {
  if (animName === 'point' || animName === 'talk') this.playAnimation('idle');
  if (animName === 'za_warudo') this.playAnimation('idle');
  if (animName === 'dodge' && this.guide) this.guide.onDodgeComplete();
};

function DioGuide() {
  this.container = null;
  this.canvas = null;
  this.speechBubble = null;
  this.speechText = null;
  this.sprite = null;
  this.x = window.innerWidth * 0.85;
  this.y = window.innerHeight * 0.6;
  this.isDodging = false;
  this.isVisible = true;
  this.dialogueQueue = [];
  this.lastMouseX = 0;
  this.lastMouseY = 0;
  this.floatOffset = 0;
  this.floatDir = 1;
  this.storylinePosition = null;
  this.animFrame = null;
  this.autoAdvanceTimer = null;
  this.recruiterMode = false;
  this.recruiterIndex = 0;
  this.recruiterStart = 0;
  this.levelTrackInterval = null;
  this.lastLevel = null;
  this.gameCompleteShown = false;
  this.pendingAction = null;
  this.isLanding = false;
  this.landingFloat = 0;
}

DioGuide.prototype.init = function () {
  var params = new URLSearchParams(window.location.search);
  this.recruiterMode = params.get('recruiter') === 'true';
  this.buildDOM();
  this.bindEvents();
  this.detectCurrentPage();
  this.initLevelTracking();
  if (this.recruiterMode) this.startRecruiterTour();
  this.startLoop();
  var self = this;
  window.addEventListener('habibi-game-complete', function (e) {
    if (e.detail && e.detail.gameId) self.onGameComplete(e.detail.gameId);
  });
  window.addEventListener('resize', function () { self.applyLayout(); });
};

DioGuide.prototype.buildDOM = function () {
  this.container = document.createElement('div');
  this.container.id = 'dio-guide';
  this.panel = document.createElement('div');
  this.panel.className = 'dio-panel';
  this.speechBubble = document.createElement('div');
  this.speechBubble.id = 'dio-speech';
  this.speechText = document.createElement('div');
  this.speechText.id = 'dio-speech-text';
  this.actionSlot = document.createElement('div');
  this.actionSlot.id = 'dio-actions';
  this.actionSlot.className = 'dio-actions';
  var name = document.createElement('div');
  name.className = 'dio-speaker-name';
  name.textContent = 'DIO';
  var subtitle = document.createElement('div');
  subtitle.className = 'dio-speaker-sub';
  subtitle.textContent = 'Operations Guide · MERIDIAN-7';
  var tail = document.createElement('div');
  tail.className = 'dio-speech-tail';
  this.avatarWrap = document.createElement('div');
  this.avatarWrap.className = 'dio-avatar';
  this.canvas = document.createElement('canvas');
  this.canvas.width = 120;
  this.canvas.height = 160;
  this.speechBubble.appendChild(name);
  this.speechBubble.appendChild(subtitle);
  this.speechBubble.appendChild(this.speechText);
  this.speechBubble.appendChild(this.actionSlot);
  this.speechBubble.appendChild(tail);
  this.avatarWrap.appendChild(this.canvas);
  this.panel.appendChild(this.speechBubble);
  this.panel.appendChild(this.avatarWrap);
  this.container.appendChild(this.panel);
  document.body.appendChild(this.container);
  this.sprite = new DioSprite(this.canvas);
  this.sprite.guide = this;
  this.applyLayout();
};

DioGuide.prototype.bindEvents = function () {
  var self = this;
  this.panel.addEventListener('click', function (e) {
    if (e.target.closest('#dio-next-btn')) return;
    if (!self.isDodging && !self.recruiterMode) self.advanceDialogue();
  });
};

DioGuide.prototype.applyLayout = function () {
  if (this.isLanding) {
    this.container.classList.add('dio-landing');
    document.body.classList.add('dio-start-only');
    this.container.style.left = '50%';
    this.container.style.right = 'auto';
    this.container.style.top = 'auto';
    this.container.style.bottom = '28px';
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight - 160;
    return;
  }
  this.container.classList.remove('dio-landing');
  this.x = Math.min(window.innerWidth - 380, Math.max(16, window.innerWidth * 0.62));
  this.y = Math.max(80, window.innerHeight - 180);
  this.container.style.left = this.x + 'px';
  this.container.style.top = this.y + 'px';
  this.container.style.bottom = 'auto';
  this.container.style.right = 'auto';
};

DioGuide.prototype.checkHoverDistance = function () {
  if (this.isDodging || this.recruiterMode || this.isLanding) return;
  var rect = this.container.getBoundingClientRect();
  var dx = this.lastMouseX - (rect.left + rect.width / 2);
  var dy = this.lastMouseY - (rect.top + rect.height / 2);
  if (Math.sqrt(dx * dx + dy * dy) < 60) this.dodge();
};

DioGuide.prototype.dodge = function () {
  var self = this;
  this.isDodging = true;
  this.sprite.playAnimation('dodge');
  var corners = [
    { x: 40, y: 40 },
    { x: window.innerWidth - 140, y: 40 },
    { x: 40, y: window.innerHeight - 200 },
    { x: window.innerWidth - 140, y: window.innerHeight - 200 }
  ];
  var best = corners[0];
  var bestDist = -1;
  corners.forEach(function (c) {
    var d = Math.hypot(c.x - self.lastMouseX, c.y - self.lastMouseY);
    if (d > bestDist) { bestDist = d; best = c; }
  });
  var startX = this.x, startY = this.y, startTime = performance.now();
  var moveInterval = setInterval(function () {
    var t = Math.min((performance.now() - startTime) / 400, 1);
    var eased = 1 - Math.pow(1 - t, 3);
    self.x = startX + (best.x - startX) * eased;
    self.y = startY + (best.y - startY) * eased;
    self.updatePosition();
    if (t >= 1) clearInterval(moveInterval);
  }, 16);
};

DioGuide.prototype.onDodgeComplete = function () {
  var self = this;
  this.sprite.playAnimation('idle');
  setTimeout(function () { self.isDodging = false; }, 500);
};

DioGuide.prototype.startLoop = function () {
  var self = this;
  var lastTime = performance.now();
  function loop(now) {
    var dt = now - lastTime;
    lastTime = now;
    self.floatOffset += self.floatDir * dt * 0.04;
    if (Math.abs(self.floatOffset) > 6) self.floatDir *= -1;
    var floatY = self.floatOffset;
    if (self.isLanding) {
      self.container.style.transform = 'translateX(-50%) translateY(' + floatY + 'px)';
    } else {
      self.container.style.transform = 'translateY(' + floatY + 'px)';
    }
    self.sprite.update(dt);
    var anim = self.sprite.animations[self.sprite.currentAnimation];
    self.sprite.drawFrame(anim.frames[self.sprite.currentFrame], 0, 0);
    self.animFrame = requestAnimationFrame(loop);
  }
  self.animFrame = requestAnimationFrame(loop);
};

DioGuide.prototype.updatePosition = function () {
  if (!this.isLanding) {
    this.container.style.left = this.x + 'px';
    this.container.style.top = this.y + 'px';
  }
};

DioGuide.prototype.resolvePageKey = function () {
  if (document.body.classList.contains('landing-dio-mode')) return 'index';
  var path = window.location.pathname;
  var parts = path.split('/').filter(Boolean);
  var filename = (parts[parts.length - 1] || 'index').replace('.html', '');
  var pageMap = {
    index: 'index', terminal: 'terminal', breach: 'breach', network: 'network',
    cipher: 'cipher', sim: 'sim', intercept: 'intercept', forge: 'forge',
    archive: 'archive', heist: 'heist', lab: 'lab', cartography: 'cartography',
    memorial: 'memorial', resonance: 'resonance', debrief: 'debrief', read: 'read'
  };
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].indexOf('game') === 0 && parts[i].indexOf('-') > 0) return parts[i];
  }
  if (pageMap[filename]) return pageMap[filename];
  if (filename === 'index' || filename === '') return 'index';
  if (/\/index\.html$/i.test(path) || path === '/' || /\/$/.test(path)) return 'index';
  if (!/\.html$/i.test(path) && !pageMap[filename]) return 'index';
  return filename || 'index';
};

DioGuide.prototype.detectCurrentPage = function () {
  this.storylinePosition = this.resolvePageKey();
  this.isLanding = this.storylinePosition === 'index' && !this.recruiterMode;
  this.applyLayout();
  if (DIO_STORYLINE[this.storylinePosition]) {
    var script = DIO_STORYLINE[this.storylinePosition];
    if (script.nextAction) this.pendingAction = script.nextAction;
    if (this.isLanding && script.nextAction) this.showNextActionButton(script.nextAction);
    if (script.enter && !this.recruiterMode) {
      var lines = script.enter.slice();
      if (window.HabibiNarrative) {
        var ctxMap = {
          'game2-breach': 'the_breach', 'game3-network': 'the_ghost_network',
          'game4-cipher': 'the_cipher', 'game5-simulation': 'the_simulation',
          'game6-intercept': 'the_interrogation_room', 'game7-forge': 'the_forge',
          'game8-archive': 'the_deep_archive', 'game9-heist': 'the_heist',
          'game10-lab': 'the_lab', 'game11-cartography': 'the_cartography',
          'game12-memorial': 'the_memorial', 'game13-resonance': 'the_resonance'
        };
        var ctxId = ctxMap[this.storylinePosition];
        if (ctxId) {
          var ctxLine = HabibiNarrative.getContextForGame(ctxId);
          if (ctxLine) lines.unshift(ctxLine);
        }
      }
      this.queueDialogue(lines);
    } else if (script.nextAction && !this.recruiterMode) {
      this.showNextActionButton(script.nextAction);
    }
  }
};

DioGuide.prototype.queueDialogue = function (lines) {
  this.dialogueQueue = lines.slice();
  this.advanceDialogue();
};

DioGuide.prototype.advanceDialogue = function () {
  var self = this;
  if (this.dialogueQueue.length === 0) {
    this.sprite.playAnimation('idle');
    if (this.pendingAction) this.showNextActionButton(this.pendingAction);
    return;
  }
  var line = this.dialogueQueue.shift();
  this.showSpeechBubble(line);
  this.sprite.playAnimation('talk');
  var readTime = Math.min(Math.max(line.length * 60, 2000), 6000);
  clearTimeout(this.autoAdvanceTimer);
  this.autoAdvanceTimer = setTimeout(function () {
    if (self.dialogueQueue.length > 0) self.advanceDialogue();
    else {
      self.sprite.playAnimation('idle');
      if (self.pendingAction) self.showNextActionButton(self.pendingAction);
    }
  }, readTime);
};

DioGuide.prototype.showSpeechBubble = function (text) {
  this.speechText.textContent = text;
  this.speechBubble.style.opacity = '1';
};

DioGuide.prototype.hideSpeechBubble = function () {
  this.speechBubble.style.opacity = '0';
};

DioGuide.prototype.showNextActionButton = function (action) {
  if (!this.actionSlot) return;
  this.actionSlot.innerHTML = '';
  var btn = document.createElement('a');
  btn.href = action.url;
  btn.id = 'dio-next-btn';
  btn.className = 'dio-next-btn';
  btn.textContent = action.label;
  this.actionSlot.appendChild(btn);
  this.speechBubble.style.opacity = '1';
};

DioGuide.prototype.initLevelTracking = function () {
  var self = this;
  var gameMap = {
    'game1-terminal': 'the_terminal', 'game2-breach': 'the_breach',
    'game3-network': 'the_ghost_network', 'game4-cipher': 'the_cipher',
    'game5-simulation': 'the_simulation', 'game6-intercept': 'the_interrogation_room',
    'game7-forge': 'the_forge', 'game8-archive': 'the_deep_archive',
    'game9-heist': 'the_heist', 'game10-lab': 'the_lab',
    'game11-cartography': 'the_cartography', 'game12-memorial': 'the_memorial',
    'game13-resonance': 'the_resonance'
  };
  this.levelTrackInterval = setInterval(function () {
    try {
      var pageKey = self.storylinePosition;
      var gameId = gameMap[pageKey];
      if (!gameId) return;
      var raw = localStorage.getItem('habibi-xp-' + gameId);
      if (!raw) return;
      var data = JSON.parse(raw);
      var level = data.currentLevel || 1;
      if (level !== self.lastLevel) {
        self.lastLevel = level;
        var script = DIO_STORYLINE[pageKey];
        var levelKey = 'level' + level;
        if (script && script[levelKey]) {
          self.queueDialogue(script[levelKey]);
          self.sprite.playAnimation('point');
        }
      }
      if (data.completedLevels && data.completedLevels.indexOf(5) >= 0 && !self.gameCompleteShown) {
        self.gameCompleteShown = true;
        self.onGameComplete(gameId);
      }
    } catch (err) { /* ignore */ }
  }, 2000);
};

DioGuide.prototype.onGameComplete = function (gameId) {
  if (!this._completedGames) this._completedGames = {};
  if (this._completedGames[gameId]) return;
  this._completedGames[gameId] = true;
  var map = {
    the_terminal: 'game1-terminal', the_breach: 'game2-breach', the_ghost_network: 'game3-network',
    the_cipher: 'game4-cipher', the_simulation: 'game5-simulation',
    the_interrogation_room: 'game6-intercept', the_forge: 'game7-forge',
    the_deep_archive: 'game8-archive', the_heist: 'game9-heist', the_lab: 'game10-lab',
    the_cartography: 'game11-cartography', the_memorial: 'game12-memorial',
    the_resonance: 'game13-resonance'
  };
  var key = map[gameId];
  if (!key || !DIO_STORYLINE[key]) return;
  var script = DIO_STORYLINE[key];
  if (script.complete) {
    this.queueDialogue(script.complete);
    this.sprite.playAnimation('za_warudo');
  }
  if (script.nextAction) this.showNextActionButton(script.nextAction);
  if (window.HabibiNarrative) HabibiNarrative.recordGameComplete(gameId, {});
};

DioGuide.prototype.startRecruiterTour = function () {
  var self = this;
  this.recruiterStart = Date.now();
  this.recruiterIndex = 0;
  var bar = document.createElement('div');
  bar.id = 'dio-recruiter-bar';
  bar.innerHTML = 'Recruiter Preview — 90 seconds <div id="dio-recruiter-fill"></div>';
  document.body.prepend(bar);
  function nextLine() {
    if (self.recruiterIndex >= RECRUITER_SCRIPT.length) {
      self.queueDialogue(['Full experience available here. Debrief report auto-generated on completion.']);
      return;
    }
    self.showSpeechBubble(RECRUITER_SCRIPT[self.recruiterIndex]);
    self.sprite.playAnimation('talk');
    self.recruiterIndex++;
    var elapsed = Date.now() - self.recruiterStart;
    var pct = Math.min(100, (elapsed / 90000) * 100);
    var fill = document.getElementById('dio-recruiter-fill');
    if (fill) fill.style.width = pct + '%';
    setTimeout(nextLine, 6000);
  }
  nextLine();
};

window.DioGuide = DioGuide;
document.addEventListener('DOMContentLoaded', function () {
  window.DIO = new DioGuide();
  window.DIO.init();
});
'''


def main():
    frames = build_frames()
    body = ["(function (global) {\n'use strict';\n\n"]
    body.append(DIO_CLASSES.split("function DioSprite")[0])
    for set_name, frame_list in frames.items():
        body.append(f"var {set_name} = [\n")
        for idx, grid in enumerate(frame_list):
            body.append(f"  // {set_name} frame {idx}\n  [\n{grid_to_js_rows(grid)}\n  ],\n")
        body.append("];\n\n")
    body.append(STORYLINE_JS)
    body.append("\n")
    body.append(DIO_CLASSES[DIO_CLASSES.index("function DioSprite"):])
    body.append("\n})(typeof window !== 'undefined' ? window : globalThis);\n")
    content = "".join(body)
    OUT.write_text(content, encoding="utf-8")
    lines = len(content.splitlines())
    pixels = sum(content.count("'" + k) for k in ["SKIN", "HAIR", "COAT", "EYE", "HEART"])
    print(f"Wrote {OUT} — {lines} lines, ~{pixels} palette pixel refs")


if __name__ == "__main__":
    main()
