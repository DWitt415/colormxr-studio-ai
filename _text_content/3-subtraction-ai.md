
## [EXPOSITION]
So far, you've created colors by adding to Black. Now we're going to work the other direction: and create colors by **removing** from White. This is color subtraction — and it reveals something fundamental about the relationship between primary and secondary colors.

## [EXPOSITION]
Remember, White is all three primary channels at full strength: 255.255.255. When you subtract a primary color from White, you're left with the other two color channels — which together make a secondary color. 

Subtract Red from White and you get Cyan. 
Subtract Green and you get Magenta. 
Subtract Blue and you get Yellow. 

Every primary color and its complementary secondary are mirror images of each other — together, they add up to White.

## [CHECKPOINT: ready_to_subtract]
<!-- AI_PROMPT: Introduce the exercise. Don't tell the student to start-->
<!-- CONTEXT: 1×6 grid, all shapes initialized to White (255.255.255) -->
<!-- PILLS: ["Ready to start"] -->

## [EXPERIMENT: subtract_primaries]
<!-- AI_PROMPT: Guide student through the first three shapes — select each and drag the named primary slider all the way down to zero: shape 1 subtract Red, shape 2 subtract Green, shape 3 subtract Blue -->
<!-- SHAPE_TRIGGERS: [{"shape": 0, "color": "#00ffff"}, {"shape": 1, "color": "#ff00ff"}, {"shape": 2, "color": "#ffff00"}] -->
<!-- TRIGGER_SUCCESS: Right — subtracting Red, Green, Blue from White gives Cyan, Magenta, Yellow. -->
<!-- PILLS: ["I need help"] -->

## [EXPERIMENT: subtract_secondaries]
<!-- AI_PROMPT: Guide student through the second three shapes — select each and drag the named secondary slider all the way down to zero: shape 4 subtract Yellow, shape 5 subtract Cyan, shape 3 subtract Magenta -->
<!-- SHAPE_TRIGGERS: [{"shape": 3, "color": "#0000ff"}, {"shape": 4, "color": "#ff0000"}, {"shape": 5, "color": "#ff00ff"}] -->
<!-- TRIGGER_SUCCESS: Right — subtracting Cyan, Magenta, Yellow gives Red, Green and Blue -->
<!-- PILLS: ["I've got it"] ["I need help"] -->

## [EXPERIMENT: subtract_from bottom_row]
<!-- AI_PROMPT: Guide student to subtract the top shape color from the shape beneath it -->
<!-- SHAPE_TRIGGERS: [{"shape": 3, "color": "#0000ff"}, {"shape": 4, "color": "#ff0000"}, 
<!-- PILLS: ["I need help"] -->




## [OBSERVE: full_row_pattern]
<!-- AI_PROMPT: Ask student to look at the relationship between the top shape color and the shape color beneath it and describe what they see — are they spotting the pattern? 
click on the top and bottom shape sequentially to see the relationship-->
<!-- FOCUS: The vertical color pairs are complementary colors, combined they add up to white -->
<!-- PILLS: ["I get it", "What's the pattern exactly?"] -->

## [CHECKPOINT: exercise_complete]
<!-- AI_PROMPT: Confirm the key insight: colors can be created by subtracting from 
White. The values of two complementary colors combine to create White -->
<!-- CONTEXT: Student has completed subtraction of all 6 primary/secondary colors from White and discovered the complementary relationship between them -->
<!-- PILLS: ["I'm ready to move on", "Tell me more"] -->
