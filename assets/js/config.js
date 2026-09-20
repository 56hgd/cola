/**
 * ============================================================
 *  SYSTEM CONFIGURATION
 *  Timeline parameters and interactive sequence typography.
 *  Static marketing components are structurally managed in index.html.
 * ============================================================
 */
window.SCROLLY_CONFIG = {

  // ---------- Asset Pipeline ----------
  // Standard frame nomenclature. Must precisely match the output 
  // directory to prevent initialization failure.
  frames: {
    count: 300,               // Total sequence duration in frames
    path: 'frames/',          // Target directory
    prefix: 'ezgif-frame-',   // Frame prefix signature
    extension: '.png',        // File format (adjust to '.jpg' if compressed)
    padLength: 3,             // Zero-padding (e.g., 001 to 300)
  },

  // Timeline length dictating the scroll resistance. 
  // Higher values decrease playback speed, granting typography 
  // extended visibility during the scrub sequence.
  scrollLengthVh: 550,

  // ---------- Sequence Typography ----------
  // Timeline coordinates (0.0 to 1.0) dictate element opacity and 
  // transformation phases during the scroll event.
  chapters: [
    {
      start: 0.00,
      end: 0.10,
      align: 'center',
      emphasis: true,
      eyebrow: 'The Concept',
      title: 'UZARA × Coca-Cola',
      body: 'An uncompromising fusion of industrial design and cultural heritage. Engineered strictly for the competitive tier.',
    },
    {
      start: 0.16,
      end: 0.30,
      align: 'left',
      eyebrow: 'Chassis',
      title: 'Sculpted Ergonomics.',
      body: 'A refined geometric contour finished in premium matte, designed to optimize structural support and grip during sustained competitive engagement.',
    },
    {
      start: 0.36,
      end: 0.50,
      align: 'right',
      eyebrow: 'Actuation',
      title: 'Dynamic Tactile Feedback.',
      body: 'Variable-resistance actuators deliver nuanced mechanical feedback, translating complex digital physics into precise, physical reality.',
    },
    {
      start: 0.56,
      end: 0.70,
      align: 'left',
      eyebrow: 'Telemetry',
      title: 'Zero-Latency Protocol.',
      body: 'A proprietary 2.4GHz architecture ensures sub-4ms response times, maintaining strict input integrity. Supported by a Bluetooth 5.2 dual-channel fallback.',
    },
    {
      start: 0.76,
      end: 0.90,
      align: 'right',
      eyebrow: 'Power Delivery',
      title: 'Extended Endurance.',
      body: 'A high-capacity internal cell delivers up to 40 hours of uninterrupted operational performance, utilizing rapid USB-C PD to minimize downtime.',
    },
  ],
};