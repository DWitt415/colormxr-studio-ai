
## [EXPOSITION]
So far, complementary colors have been defined by primary / secondary pairs: 
Red↔Cyan, Green↔Magenta, Blue↔Yellow. 

However, every color has a complement, which is its opposite. This means that complementary, or opposite values fill each channel to full strength, resulting in White, a neutral color with all channels at full strength.

This is easy to see with primary and secondary colors:
255.0.0 + 0.255.255 = 255.255.255

Next, we will use this formula to derive a the complementary color for a 'complex' (non primary / secondary) color.

## [EXPOSITION]
Example: Using this color - **140.55.205**, we can use this formula; The complementary color is derived by subtracting each channel value from 255;
 
  255−140=115
  255−55=178
  255−205=50

Add them together like this: **115.178,.50**
  
  Add any color to its complement and you always get 255.255.255 — White. This is the universal formula, and it works for any color value in the system.

## [CHECKPOINT: ready_to_calculate]
<!-- AI_PROMPT: Check student has the complex complement exercise open — two shapes side by side -->
<!-- CONTEXT: 1×2 layout, shapes initialized to rgb(171,171,171) and rgb(205,205,205). White background. -->
<!-- PILLS: ["I've got it open", "What's the starting color?"] -->

## [EXPERIMENT: set_first_color]
<!-- AI_PROMPT: Guide student to select the first shape and set it to R:140, G:55, B:205 using the sliders -->
<!-- CONTEXT: This is an arbitrary complex color — not a primary or secondary -->
<!-- PILLS: ["Got it — 140 55 205", "How do I get a specific value?", "The sliders are tricky to land exactly"] -->

## [EXPERIMENT: calculate_complement]
<!-- AI_PROMPT: Walk student through the subtraction: 255−140=115, 255−55=178, 255−205=50. Then guide them to set the second shape to R:115, G:178, B:50 -->
<!-- PILLS: ["Got both shapes set", "I got a different result", "Can I use the secondary sliders for this?"] -->

## [OBSERVE: complement_result]
<!-- AI_PROMPT: Ask student to look at the two shapes side by side — do they look like complements? What do they notice? -->
<!-- FOCUS: Unlike primary/secondary pairs, complex complements are more subtle — visual experience of the formula -->
<!-- PILLS: ["They look like opposites", "They don't look right to me", "This is interesting"] -->

## [EXPOSITION]
The formula works for any color you can mix. The six primary and secondary complements you've already worked with are just special cases where one or more channel values happen to be 0 or 255. Complex complements are the infinite space in between — every possible color paired with its exact opposite.

## [EXPERIMENT: free_pair]
<!-- AI_PROMPT: Invite student to try their own pair — mix any color on shape 1 and calculate its complement for shape 2 -->
<!-- PILLS: ["I made a pair", "Walk me through it again", "What makes a good pair to try?"] -->

## [EXPOSITION]
While this formula helps to define the exact opposite complementary color, the 'dirty little secret' of color theory is that perceptual complements exist as a range, where small variations visually enhance the relationship in different ways. 

Therefore, you can think of an exact complementary as a starting point for exploring a myriad of different color relationships, where you learn to make color adjustments as you evaluate how the relationship changes.

## [CHECKPOINT: exercise_complete]
<!-- AI_PROMPT: Wrap up — student now has the complete formula for complementary color. Bridge to the color wheel, which organizes all of this spatially. -->
<!-- CONTEXT: Student understands the 255-minus formula and has applied it -->
<!-- PILLS: ["I'm ready to move on", "Tell me more about what makes these useful", "Can I keep experimenting?"] -->
