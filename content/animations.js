// ============================================================================
// KEY ANIMATIONS
// ----------------------------------------------------------------------------
// This file controls the animated keyboard and graph shown beside each section.
// Edit it freely. The site picks it up on the next page load in development.
//
// Each entry is keyed by a SECTION ID from guide.json (for example 'bhop').
//
//   side   'left' or 'right': which side of the text the keyboard appears on
//   title  small heading above the keyboard
//   hint   one short line under the keyboard
//   steps  the animation, played in order, then repeated
//            keys   keys held down in this step. Any of: W A S D SPACE CTRL
//            mouse  arrow shown while the mouse moves: ← → ↑ ↓  (use '' for none)
//            ms     how long this step lasts, in milliseconds (1000 = 1 second)
//            label  caption shown while this step plays
//   pauseMs   pause at the end before the loop restarts (optional, default 500)
//   graph  (optional) a chart drawn under the text. See the two examples below.
//
// Speed guide: a tap is about 70-100 ms, an air strafe is about 150-200 ms,
// and holding a movement key on the ground is 600-900 ms.
// ============================================================================

// Small helpers so the entries below stay short and easy to read.
const step = (keys, ms, label = '', mouse = '') => ({ keys, ms, label, mouse });

module.exports = {

  // ------------------------------------------------------------ GROUND
  'basic-ground-movement': {
    side: 'right', title: 'Move', hint: 'One key, then two together.',
    steps: [
      step(['W'], 700, 'Forward'),
      step(['A'], 700, 'Left'),
      step(['S'], 700, 'Back'),
      step(['D'], 700, 'Right'),
      step(['W', 'D'], 800, 'Two keys move you diagonally'),
    ],
  },

  'counter-strafing': {
    side: 'right', title: 'Stop fast', hint: 'Moving right? Tap A.',
    steps: [
      step(['D'], 900, 'Moving right'),
      step(['A'], 90, 'Tap A'),                 // the counter-strafe: a very short tap
      step([], 700, 'Stopped. Shoot now'),
    ],
    // ------------------------------------------------------------------
    // CHART under the text. Each line is a list of [time, speed] points joined
    // by STRAIGHT lines. Time is in milliseconds, speed is in units per second.
    //   Slow line:  starts at speed 250 and reaches 0 at 400 ms.
    //   Quick line: starts at speed 250 and reaches 0 at 100 ms.
    // Change a number to move that point. Add more points for a bend.
    // ------------------------------------------------------------------
    graph: {
      type: 'lines',
      title: 'Stopping from a run',
      xLabel: 'Time',
      yLabel: 'Speed',
      lines: [
        { label: 'No counter strafe', points: [[0, 250], [400, 0]] },
        { label: 'Counter strafe',    points: [[0, 250], [100, 0]] },
      ],
    },
  },

  'ducking-crouch-input': {
    side: 'right', title: 'Crouch', hint: 'Slower, and a smaller body.',
    steps: [step(['CTRL'], 800, 'Hold crouch'), step(['W', 'CTRL'], 900, 'Move while crouched')],
  },

  'approach-setup': {
    side: 'right', title: 'Run-up', hint: 'Start from the same spot each time.',
    steps: [step(['W'], 900, 'Run up'), step(['W', 'SPACE'], 250, 'Jump'), step([], 500, 'Land')],
  },

  // ------------------------------------------------------------ AIR
  'air-strafing': {
    side: 'right', title: 'Air strafe', hint: 'Key and mouse go the same way.',
    steps: [
      step(['W'], 500, 'Run up'),
      step(['SPACE'], 120, 'Jump and let go of W'),
      step(['A'], 170, 'Hold A, turn left', '←'),
      step(['D'], 170, 'Hold D, turn right', '→'),
      step(['A'], 170, 'Hold A, turn left', '←'),
      step(['D'], 170, 'Hold D, turn right', '→'),
      step([], 400, 'Land'),
    ],
    // Chart: top-down path of a jump. Each segment is one strafe key.
    graph: {
      type: 'path', title: 'Path through the air (from above)', note: 'Illustration of the idea.',
      segments: [
        { key: 'A', points: [[40, 170], [110, 160], [170, 135], [220, 110]] },
        { key: 'D', points: [[220, 110], [280, 90], [340, 90], [400, 105]] },
        { key: 'A', points: [[400, 105], [450, 125], [500, 150], [550, 175]] },
      ],
    },
  },

  'strafe-sync': {
    side: 'right', title: 'In sync', hint: 'Keys and mouse move together.',
    steps: [step(['A'], 160, 'A with a left turn', '←'), step(['D'], 160, 'D with a right turn', '→')],
  },

  'forward-key': {
    side: 'right', title: 'W and jumps', hint: 'W on the ground, not in the air.',
    steps: [
      step(['W'], 800, 'Hold W on the ground'),
      step(['SPACE'], 120, 'Let go of W as you jump'),
      step(['A'], 200, 'Steer with A and D', '←'),
      step(['W'], 500, 'Press W again on landing'),
    ],
  },

  'backwards-air': {
    side: 'right', title: 'Backwards', hint: 'Face away, hold S.',
    steps: [step(['S'], 300, 'Face away from your direction'), step(['S', 'A'], 200, 'S with A, turn left', '←'), step(['S', 'D'], 200, 'S with D, turn right', '→')],
  },

  // ------------------------------------------------------------ JUMPS
  'basic-jump': {
    side: 'right', title: 'Jump', hint: 'Space while running.',
    steps: [step(['W'], 600, 'Run'), step(['W', 'SPACE'], 150, 'Jump'), step(['W'], 400, 'Keep moving')],
  },

  'edge-jump': {
    side: 'right', title: 'Edge jump', hint: 'Take off at the very edge.',
    steps: [step(['W'], 800, 'Run to the edge'), step(['W', 'SPACE'], 150, 'Jump at the edge'), step([], 500, 'Cross the gap')],
  },

  'bhop': {
    side: 'right', title: 'Bunny hop', hint: 'Jump the moment you land.',
    steps: [
      step(['W'], 400, 'Run up'),
      step(['SPACE'], 70, 'Jump'),
      step(['A'], 180, 'Strafe', '←'),
      step(['SPACE'], 70, 'Land and jump again'),
      step(['D'], 180, 'Strafe', '→'),
      step(['SPACE'], 70, 'Land and jump again'),
      step(['A'], 180, 'Strafe', '←'),
    ],
  },

  'crouch-jump': {
    side: 'right', title: 'Crouch jump', hint: 'Crouch first, then jump.',
    steps: [
      step(['CTRL'], 80, 'Crouch jump: crouch first'),
      step(['CTRL', 'SPACE'], 120, 'then jump'),
      step([], 600, ''),
      step(['SPACE'], 80, 'Jump crouch: jump first'),
      step(['CTRL'], 250, 'then crouch in the air'),
      step([], 600, ''),
    ],
  },

  'air-crouch': {
    side: 'right', title: 'Air crouch', hint: 'Crouch while in the air.',
    steps: [step(['SPACE'], 80, 'Jump'), step([], 150, ''), step(['CTRL'], 300, 'Crouch in the air'), step([], 400, 'Land')],
  },

  'jump-landing': {
    side: 'right', title: 'Landing', hint: 'W again on landing.',
    steps: [step(['W'], 500, 'Run'), step(['SPACE'], 120, 'Jump'), step([], 350, 'Land'), step(['W'], 400, 'Press W again')],
  },

  // ------------------------------------------------------------ LADDERS AND SURFS
  'ladder-climbing': {
    side: 'right', title: 'Climb', hint: 'W and look slightly down.',
    steps: [step(['W'], 1000, 'Hold W, look slightly down', '↓')],
  },
  'ladder-push-off': {
    side: 'right', title: 'Push off', hint: 'Space on the ladder.',
    steps: [step([], 500, 'On the ladder'), step(['SPACE'], 120, 'Space: jump straight off'), step([], 500, '')],
  },
  'ladder-jump': {
    side: 'right', title: 'Ladder jump', hint: 'Side key and mouse.',
    steps: [step([], 400, 'On the ladder'), step(['D'], 450, 'Hold D, turn right', '→')],
  },
  'ladder-room-bhop': {
    side: 'right', title: 'Ladder room', hint: 'Jump off, jump again.',
    steps: [step(['SPACE'], 100, 'Jump off backwards'), step([], 250, ''), step(['SPACE'], 100, 'Jump again'), step(['W'], 400, 'Carry on')],
  },
  'surf-basics': {
    side: 'right', title: 'Surf', hint: 'Key into the ramp, turn with it.',
    steps: [step(['D'], 800, 'Hold D into the ramp', '→'), step(['A'], 800, 'Hold A into the ramp', '←')],
  },

  // ------------------------------------------------------------ ADVANCED
  'vent-bhop': {
    side: 'right', title: 'Vent bhop', hint: 'One crouching hop.',
    steps: [step(['W'], 400, 'Run in'), step(['W', 'CTRL'], 200, 'Crouch'), step(['W', 'CTRL', 'SPACE'], 120, 'Hop through')],
  },
  'jumpbug': {
    side: 'right', title: 'Jumpbug', hint: 'Jump and release crouch together.',
    steps: [step(['CTRL'], 700, 'Fall while crouched'), step(['SPACE'], 100, 'Jump and release crouch together'), step([], 500, '')],
  },
  'long-jump-vanilla': {
    side: 'right', title: 'Long jump', hint: 'Run up, jump, air strafe.',
    steps: [
      step(['W'], 600, 'Run up'), step(['SPACE'], 120, 'Jump'),
      step(['A'], 150, 'Strafe', '←'), step(['D'], 150, 'Strafe', '→'),
      step(['A'], 150, 'Strafe', '←'), step(['D'], 150, 'Strafe', '→'), step([], 400, 'Land'),
    ],
  },
  'run-boost': {
    side: 'right', title: 'Run boost', hint: 'Follow your teammate, then jump off.',
    steps: [step(['W'], 700, 'Run the same path'), step(['W', 'SPACE'], 150, 'Jump off their head')],
  },
};
