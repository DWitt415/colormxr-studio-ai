
## [EXPOSITION]
This exercise brings together everything from the last two. You'll use a 2-row layout with a Gray background — top row starting from Black, bottom row starting from White — and mix all six primary and secondary colors using both addition and subtraction. The result will be a complete map of complementary color pairs, visible all at once.

## [EXPOSITION]
The Gray background matters here. Against a neutral gray, you'll begin to see color interaction — how the same color can look different depending on what surrounds it. This effect will become more significant as we go further into the course.

## [CHECKPOINT: ready_to_begin]
<!-- AI_PROMPT: Check that student has the relationships exercise open and can see the 2×6 grid — top row black, bottom row white, gray background -->
<!-- CONTEXT: 2×6 grid, 12 shapes. Top row starts Black, bottom row starts White. Background: rgb(169,169,169) -->
<!-- PILLS: ["I've got it open", "My top row isn't black", "What's the gray background for?"] -->

## [EXPERIMENT: top_row_addition]
<!-- AI_PROMPT: Guide student to color the top row by adding to Black, left to right in order: Red, Yellow, Green, Cyan, Blue, Magenta -->
<!-- CONTEXT: Using both primary and secondary sliders for this row -->
<!-- SHAPE_TRIGGERS: [{"shape": 0, "color": "#ff0000"}, {"shape": 1, "color": "#ffff00"}, {"shape": 2, "color": "#00ff00"}, {"shape": 3, "color": "#00ffff"}, {"shape": 4, "color": "#0000ff"}, {"shape": 5, "color": "#ff00ff"}] -->
<!-- TRIGGER_SUCCESS: Top row complete — primaries and secondaries in place. -->
<!-- PILLS: ["Top row done", "What order again?", "Remind me how to make Yellow"] -->

## [EXPERIMENT: bottom_row_subtraction]
<!-- AI_PROMPT: Guide student to color the bottom row by subtracting from White, same order: subtract Cyan (leaves Red), subtract Magenta (leaves Yellow), subtract Yellow (leaves Green), subtract Red (leaves Cyan), subtract Green (leaves Blue), subtract Blue (leaves Magenta) -->
<!-- CONTEXT: Each bottom shape is made by subtracting the complementary color of the top shape above it -->
<!-- SHAPE_TRIGGERS: [{"shape": 6, "color": "#00ffff"}, {"shape": 7, "color": "#0000ff"}, {"shape": 8, "color": "#ff00ff"}, {"shape": 9, "color": "#ff0000"}, {"shape": 10, "color": "#ffff00"}, {"shape": 11, "color": "#00ff00"}] -->
<!-- TRIGGER_SUCCESS: Bottom row complete. Every top and bottom pair adds up to White. -->
<!-- PILLS: ["Bottom row done", "Which color do I subtract for Red?", "I'm getting confused"] -->

## [OBSERVE: complementary_pairs]
<!-- AI_PROMPT: Ask student to click the top and bottom shape in any column while watching the RGB readout — what do they notice about the values? -->
<!-- FOCUS: Top + bottom values in each column add up to 255.255.255 (White). This is the complementary relationship. -->
<!-- PILLS: ["They add up to 255", "I'm not sure what to look for", "Tell me what I should be seeing"] -->

## [EXPOSITION]
What you're seeing is the mathematical definition of a complementary pair: two colors whose channel values add up to 255.255.255 — pure White. Red (255.0.0) and Cyan (0.255.255) add up to 255.255.255. So do every other pair in your layout. This is why complementary colors are considered opposites — they literally complete each other.

## [CHECKPOINT: exercise_complete]
<!-- AI_PROMPT: Wrap up and reinforce the complementary relationship — both the visual result and the numerical logic. Bridge to the phantom colors exercise, which explores what the brain does with this same relationship. -->
<!-- CONTEXT: Student has completed the full complementary pairs layout using both addition and subtraction -->
<!-- PILLS: ["I'm ready to move on", "Can I explore more with the background?", "Tell me more about complements"] -->
