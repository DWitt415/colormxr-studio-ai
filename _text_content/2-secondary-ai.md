
## [EXPOSITION]
Now that you've mixed colors individually, let's use multiple shapes to see primary and secondary colors side by side. 

In this exercise you'll mix the three primary colors in the top row, then use **color cloning** to derive the secondary colors in the bottom row — the same way they relate in theory, made visible in the layout.

## [EXPERIMENT: top_row_primaries]
<!-- AI_PROMPT: Guide student to color the three top-row shapes Red, Green, and Blue — one per shape, left to right -->
<!-- SHAPE_TRIGGERS: [{"shape": 0, "color": "#ff0000"}, {"shape": 1, "color": "#00ff00"}, {"shape": 2, "color": "#0000ff"}] -->
<!-- TRIGGER_SUCCESS: Primary colors locked in — Red, Green, Blue. -->
<!-- PILLS: ["Top row done", "I'm having trouble with one"] -->

## [OBSERVE: primary_values]
<!-- AI_PROMPT: Ask them to click each top-row shape and read the RGB values — confirming single-channel primaries -->
<!-- FOCUS: Red = 255.0.0, Green = 0.255.0, Blue = 0.0.255 -->
<!-- PILLS: ["All three read correctly", "Something looks off"] -->

## [EXPOSITION]
Next, I'll show you Color Cloning, a key feature of Colormxr that allows you to copy a color from a shape onto one or more other shapes. This is helpful for using a color as a starting point for mixing another color, or control the color of multiple shapes.

Here are the steps:

1 - Select a shape
2 - Press and hold the **Shift** key 
3 - Click another shape to copy the current color onto it. 

Both shapes are now selected and under control with the interface. Change the color value and watch how it controls the selected shapes.

Alternatively, clicking just the second shape releases the original, so that you change only the color of the latest shape. This lets you build on a color rather than starting from scratch each time.

Let's try it now!
## [EXPERIMENT: clone_to_yellow]
<!-- AI_PROMPT: Guide student to clone Red onto the shape below it (Shift+click), then click it to deselect the first shape, then add Green to make Yellow -->
<!-- CONTEXT: Red + Green = Yellow (255.255.0) -->
<!-- SHAPE_TRIGGERS: [{"shape": 3, "color": "#ffff00"}] -->
<!-- TRIGGER_SUCCESS: You've got it! Yellow is Red + Green. -->
<!-- PILLS: ["Got it, "The clone isn't working", "Something went wrong"] -->

## [EXPERIMENT: clone_to_cyan]
<!-- AI_PROMPT: Now clone Green onto the shape below it, deselect Green, add Blue to make Cyan -->
<!-- CONTEXT: Green + Blue = Cyan (0.255.255) -->
<!-- SHAPE_TRIGGERS: [{"shape": 4, "color": "#00ffff"}] -->
<!-- TRIGGER_SUCCESS: You've got it! Cyan is Green + Blue. -->
<!-- PILLS: ["Got Cyan", "Something is off"] -->

## [EXPERIMENT: clone_to_magenta]
<!-- AI_PROMPT: Clone Blue onto the shape below it, deselect Blue, add Red to make Magenta -->
<!-- CONTEXT: Blue + Red = Magenta (255.0.255) -->
<!-- SHAPE_TRIGGERS: [{"shape": 5, "color": "#ff00ff"}] -->
<!-- TRIGGER_SUCCESS: You've got it! Magenta is Blue + Red. -->
<!-- PILLS: ["Got Magenta", "Something is wrong"] -->

## [OBSERVE: full_set]
<!-- AI_PROMPT: Ask student to step back and look at the full 2×3 layout — six colors, two rows -->
<!-- FOCUS: Each secondary is built from the primary color above it plus another primary. Click on the top primary and then the secondary color below it to see the additive relationship-->
<!-- PILLS: ["I can see the pattern", "What should I notice?", "My colors don't look right"] -->

## [CHECKPOINT: exercise_complete]
<!-- AI_PROMPT: Confirm exercise is done. Reinforce the relationship: each secondary is built from the two primaries. Bridge to the subtraction exercise. -->
<!-- CONTEXT: Student has completed the full primary/secondary layout by addition and cloning -->
<!-- PILLS: ["I'm ready to move on", "Tell me more"] -->
