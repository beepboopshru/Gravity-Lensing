# Gravity Lensing Visualizer

This is an interactive 3D web application that demonstrates the phenomenon of gravitational lensing, as predicted by Albert Einstein's theory of General Relativity. It allows you to manipulate the mass of a black hole and observe how its immense gravity bends the fabric of spacetime, distorting the light from the stars and galaxies behind it.
<img width="673" height="539" alt="image" src="https://github.com/user-attachments/assets/6b17c3e4-a86c-42de-84ac-665466894741" />


## The Science Behind Gravitational Lensing

### General Relativity and Spacetime

At the heart of gravitational lensing is one of the most profound ideas in modern physics: spacetime. Einstein's theory of General Relativity tells us that space and time are not a static, empty backdrop for the universe. Instead, they are woven together into a single, dynamic fabric called spacetime.

Massive objects, like stars, galaxies, and especially black holes, warp or curve this fabric. Think of placing a heavy bowling ball on a stretched-out rubber sheet. The ball creates a dip or a curve in the sheet. In the same way, massive objects create a "gravity well" in spacetime.

### The Path of Light

Light, like everything else in the universe, travels through spacetime. It follows the straightest possible path, but when spacetime itself is curved, that path also becomes curved. As light from a distant star passes by a massive object, its path is bent by the curvature of spacetime.

### The Black Hole as a Cosmic Lens

A black hole represents an extreme curvature of spacetime. Its gravitational pull is so immense that it creates a very deep gravity well. When light from a background object (like a star or an entire galaxy) passes near the edge of a black hole, it is deflected significantly.

This bending of light is what we call **gravitational lensing**. The black hole acts like a giant, natural lens in space. From our perspective as an observer, the light from the background object appears to come from a different position. This can lead to several fascinating visual effects:

*   **Distortion**: The background appears warped and stretched, as if viewed through a funhouse mirror.
*   **Magnification**: The lensing effect can focus light, making distant objects appear brighter and larger than they actually are.
*   **Einstein Rings**: If the observer, the lensing object (the black hole), and the background object are perfectly aligned, the background light is smeared into a complete circle, known as an Einstein Ring.

## Features of this Simulation

This application uses a shader to simulate the path of light rays in real-time. For each pixel on your screen, it traces a ray of light backward from the camera, calculates how it would be bent by the black hole's gravity, and then determines what color it should be from the background starfield.

*   **Interactive Mass Control**: Use the slider to increase or decrease the mass of the black hole. Notice how a more massive black hole creates a more dramatic lensing effect, bending light more severely.
*   **Accretion Disk**: The glowing, swirling ring around the black hole is the accretion disk. This is a disk of superheated gas and dust that orbits the black hole at incredible speeds. Frictional and gravitational forces heat this material, causing it to emit intense radiation, which is what we are visualizing.
*   **Dynamic Starfield**: The background is populated with thousands of stars to provide a rich backdrop for the lensing effect.
