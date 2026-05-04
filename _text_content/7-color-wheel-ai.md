
## [EXPOSITION]
The color wheel is a spatial map of color relationships. In this exercise, you'll build one yourself — placing the primary and secondary colors at their positions around the wheel, then filling in the transitional colors between them. By the time you're done, you'll have defined the full Colormxr palette: **Red, Orange, Yellow, Green, Cyan, Blue, Violet, and Magenta**.

## [EXPOSITION]
This wheel is arranged in RGB+CMY order, not the traditional RYB artist's wheel. The primaries — Red, Green, Blue — are spaced 120° apart. The secondaries — Cyan, Magenta, Yellow — sit opposite their complements. The positions matter: they encode the relationships you've been working with.

## [CHECKPOINT: ready_to_build]
<!-- AI_PROMPT: Use this 12 shape layout to build the full RGB+CMY color wheel -->
<!-- CONTEXT: SVG layout with 12 shapes arranged around a clock face. All shapes at SVG defaults. Background #F0F0F0. -->
<!-- PILLS: ["I've got it open", "What does the layout look like?"] -->

## [EXPERIMENT: set_primaries]
<!-- AI_PROMPT: Guide student to set the three primary positions: 12 o'clock = Red, 4 o'clock = Green, 8 o'clock = Blue -->
<!-- CONTEXT: These are the three primary anchor points — pure single-channel colors -->
<!-- SHAPE_TRIGGERS: [{"shape": 11, "color": "#ff0000"}, {"shape": 3, "color": "#00ff00"}, {"shape": 7, "color": "#0000ff"}] -->
<!-- TRIGGER_SUCCESS: Primaries placed — Red, Green, Blue. -->
<!-- PILLS: ["Primaries are set", "Which position is 12 o'clock?", "One of mine doesn't look right"] -->

## [EXPERIMENT: set_secondaries]
<!-- AI_PROMPT: Guide student to set the three secondary positions: 6 o'clock = Cyan (opposite Red), 10 o'clock = Magenta (opposite Green), 2 o'clock = Yellow (opposite Blue) -->
<!-- CONTEXT: Each secondary is directly opposite its complementary primary -->
<!-- SHAPE_TRIGGERS: [{"shape": 5, "color": "#00ffff"}, {"shape": 9, "color": "#ff00ff"}, {"shape": 1, "color": "#ffff00"}] -->
<!-- TRIGGER_SUCCESS: Secondaries placed. -->
<!-- PILLS: ["Secondaries are set", "How do I make Cyan again?", "Should I use the secondary sliders?"] -->

## [OBSERVE: primary_secondary_wheel]
<!-- AI_PROMPT: Ask student to look at the six-color wheel so far — what do they notice about the arrangement? Each color and its complement are directly across from each other. -->
<!-- FOCUS: Spatial encoding of the complementary relationship — visually intuitive -->
<!-- PILLS: ["I see the complements facing each other", "Tell me more about the arrangement", "Looks right — what's next?"] -->

## [EXPERIMENT: in_between_colors]
<!-- AI_PROMPT: Guide student through the six transitional shapes, one at a time: 1 o'clock (Orange) = clone Red, move Green to mid; 3 o'clock = clone Yellow, move Red to mid; 5 o'clock = clone Green, move Blue to mid; 7 o'clock = clone Cyan, move Green to mid; 9 o'clock (Violet) = clone Blue, move Red to mid; 11 o'clock = clone Magenta, move Blue to mid; middle values don't need to be exact-->
<!-- CONTEXT: "Middle value" = approximately 127–128, halfway up the slider. These are the transitional/tertiary colors. -->
<!-- SHAPE_TRIGGERS: [{"shape": 0, "color": "#ff8000"}, {"shape": 10, "color": "#8000ff"}] -->
<!-- TRIGGER_SUCCESS: Orange and Violet placed — transitional colors complete. -->
<!-- PILLS: ["All six done", "Walk me through one of them", "What's a middle value exactly?"] -->

## [EXPOSITION]
You've now built a complete 12-color wheel. The last step is to leave **Orange** (1 o'clock) and **Violet** (9 o'clock) in place, and set the other four transitional shapes back to White. We do this because those four colors don't have clear, agreed-upon names — removing them keeps the palette unambiguous.

## [EXPERIMENT: remove_unnamed]
<!-- AI_PROMPT: Guide student to reset the transitional shapes at 3, 5, 7, and 11 o'clock to White by dragging the Black slider to the top -->
<!-- SHAPE_TRIGGERS: [{"shape": 4, "color": "#ffffff"}, {"shape": 2, "color": "#ffffff"}, {"shape": 6, "color": "#ffffff"}, {"shape": 8, "color": "#ffffff"}] -->
<!-- TRIGGER_SUCCESS: The wheel is clean. -->
<!-- PILLS: ["Done — four shapes are white", "Which ones stay?", "Why those four?"] -->

## [OBSERVE: final_palette]
<!-- AI_PROMPT: Ask student to click through the 8 named colors in order — Red, Orange, Yellow, Green, Cyan, Blue, Violet, Magenta — while watching the sliders. What do they notice about the progression? -->
<!-- FOCUS: Progressive channel relationships — each color transitions smoothly to the next. This is the Colormxr palette. -->
<!-- PILLS: ["I can see the progression", "What should I be noticing in the sliders?", "This is the full palette?"] -->

## [CHECKPOINT: exercise_complete]
<!-- AI_PROMPT: Wrap up the color wheel and the full Colormixing 101 section. Student now has the complete foundation: primary/secondary colors, addition and subtraction, complementary relationships, complex complements, and the full Colormxr palette arranged spatially. Bridge to the next lesson. -->
<!-- CONTEXT: Student has built the complete Colormxr color wheel — Red, Orange, Yellow, Green, Cyan, Blue, Violet, Magenta -->
<!-- PILLS: ["I'm done", "Tell me more about using this palette", "Can I explore more here?"] -->
