# **App Name**: ChronoLens

## Core Features:

- 3D Environment Setup: Create a 3D environment using Three.js with a background star field or galaxy texture to simulate the distant universe.
- Black Hole Representation: Model a black hole as a dark sphere with an optional, toggleable accretion disk.
- Real-Time Gravitational Lensing: Implement real-time gravitational lensing using custom fragment shaders to warp light from background stars around the black hole, creating Einstein rings and distorted arcs. Intensify distortions near the event horizon.
- 3D Camera Controls: Enable users to rotate the camera around the black hole for viewing lensing from any angle and zoom in/out for different distortion levels. The app includes the ability for the tool to rewrite the instructions for improved precision, depending on the platform and the selected 3D graphics library
- Adjustable Simulation Parameters: Implement sliders to adjust black hole mass (changes lensing strength), the distance of the background source, and observer position.
- Ray Bending Simulation: Calculate accurate ray bending using the formulas of General Relativity
- Performance Optimization: Optimize rendering via raymarching to ensure smooth lensing effects without significant performance lag.

## Style Guidelines:

- Background color: Dark, desaturated blue-gray (#222A30) to simulate the void of space. Complements the glowing elements and dark central sphere.
- Primary color: Soft, glowing cyan (#6FF2E4) for interactive elements (sliders, reset button), and the accretion disk (if toggled on). Evokes the ethereal nature of astronomical phenomena.
- Accent color: Warm orange (#F2A76F) to highlight controls or significant lensing distortions, drawing attention to areas of high activity. This color acts as an analogous complement.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text. 'Space Grotesk' will create a techy feel that fits with a scientific visualization, and 'Inter' will provide excellent legibility if any amount of supporting text is added.
- The layout should feature a full-screen 3D canvas with a minimalistic UI for controls (sliders and reset button), positioned unobtrusively.
- Smooth transitions for camera movements and parameter adjustments enhance the user experience, providing fluid interaction within the 3D space.
- Simple, glowing icons for control buttons, providing visual cues without distracting from the 3D scene.