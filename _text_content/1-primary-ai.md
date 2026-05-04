
## [EXPOSITION]
Welcome to Colormixing 101!

This is where you will learn the foundations of RGB colormixing from first principles and hands-on, eyes-on learning.

First, I'm going to give you an overview of the Colormxr interface — how it's organized, what the controls do, and how to read the color values. This is an important foundational step to working intelligently with color.

## [EXPOSITION]
Colormxr has two main components: the shapeset and the Colormxr interface. 

The **shapeset** is a graphic layout of shapes over a background layer. This is the composition that you will apply color to. 

The **Colormxr interface** is the panel on the bottom right that you use to mix colors and get color values.

## [EXPOSITION]
At the bottom of the interface, you'll see the current color value displayed in two formats: **RGB** and **Hex**. 

The RGB value shows the amount of each primary color channel, **Red, Green, Blue**, as a number from 0 to 255. 

0 means no color.
255 means full strength. 

Hex does the same thing in a more technical shorthand used by most software. This is what you would copy to use as a color code for a web page design, for example.

But for our purposes, RGB is the one to watch — it's much easier to understand and reason about, once you know the basic formula.

## [EXPOSITION]
Each RGB channel has 256 possible values (0–255), and so all three channels combined give us the possibility of just under 17 million possible colors (256 × 256 × 256). That sounds overwhelming, but you're about to learn a system that makes it very manageable.

## [EXPOSITION]
Below the color display, you'll see seven vertical sliders: 

**Black**, **Red**, **Yellow**, **Green**, **Cyan**, **Blue**, and **Magenta**. 

Each one controls a specific color channel — or in some cases, two channels at once. We'll dig into what that means as you start mixing.

## [EXPOSITION]
The **Black slider** is special. It controls all three primary color channels equally, moving the color through the full grayscale range from Black to White. 

An important concept here: Black, White, and Gray are all created by equal amounts of Red, Green, and Blue , which is why they're called **neutral colors**. When you use the Black slider, you're not adding or removing black ink — you're changing all channels in unison.

Pro Tip: You can reset any color to Black quickly using the Black slider.

## [EXPOSITION]
Select the shape and move the Black slider up towards White, and then back down to Black. This shows you the entire **Grayscale** range. Notice how the RGB color values are equal in each channel.

## [EXPOSITION]
Also notice the same thing is happening to the Hex values. Hex values, like RGB values, consist of three channel values, but they are represented as alpha-numeric values. To be precise, they are **hex values**, which range from 0 to 15. Since 0-10 can't cover this, the letters A to F are used to represent them. 

Here's an example of a hex value for a single color channel:
F = 15, so FF = 15 x 15 = 255

And so White = 255.255.255 or #FFFFFF

So really, hex values are equivalent to RGB values, but they just use a different kind of notation. 

Pro Tip: most graphics and web design software use hex color values, so this is what you would copy to use in other applications.
## [CHECKPOINT: interface_ready]
<!-- AI_PROMPT: Check that student understands the Colormxr interface basics -->
<!-- CONTEXT: Just completed interface overview — shapeset, RGB/Hex display, 7 sliders, Black slider, -->
<!-- PILLS: ["Yes", "I have a question"] -->

## [OBSERVE: interface_first_look]
<!-- AI_PROMPT: Ask what they notice about the starting state — what does the color display show? -->
<!-- FOCUS: Shape starts black, RGB reads 0.0.0, all sliders at bottom -->
<!-- PILLS: ["I see 0.0.0", "I see #000000", "I don't know"] -->

## [EXPERIMENT: primary_red]
<!-- AI_PROMPT: Guide student to drag the Red slider all the way to the top -->
<!-- CONTEXT: Making pure Red — RGB 255.0.0 -->
<!-- COLOR_TRIGGER: 255.0.0 -->
<!-- PILLS: ["How far up?", "Nothing's happening"] -->

## [OBSERVE: primary_red_value]
<!-- AI_PROMPT: Ask them to read the RGB value and notice what it says -->
<!-- FOCUS: 255.0.0 — maximum Red, zero Green, zero Blue. This is a primary color. -->
<!-- PILLS: ["255.0.0", "Tell me more", "I don't see it"] -->

## [EXPOSITION]
A **primary color** is defined as having a single full-strength channel and zero in the other two. Red is 255.0.0. It's the purest, brightest Red possible — no other color mixed in. Primary colors are the foundation: all other colors in the system are built from them.


## [EXPERIMENT: primary_green]
<!-- AI_PROMPT: Now guide them to reset and try Green (0.255.0) -->
<!-- CONTEXT: Completing the three primary colors -->
<!-- COLOR_TRIGGER: 0.255.0 -->
<!-- PILLS: ["How do I reset?", "Give me a hint"] -->

## [EXPERIMENT: primary_blue]
<!-- AI_PROMPT: Now guide them to reset and try Blue (0.0.255) -->
<!-- CONTEXT: Completing the three primary colors -->
<!-- COLOR_TRIGGER: 0.0.255 -->
<!-- PILLS: ["How do I reset?", "Give me a hint"] -->

## [CHECKPOINT: primaries_complete]
<!-- AI_PROMPT: Confirm they've mixed all three primaries and bridge to the next concept — secondary colors -->
<!-- CONTEXT: Student has made Red, Green, and Blue. Introducing secondary colors next. -->
<!-- PILLS: ["Ready to keep going", "I have questions"] -->



## [EXPOSITION]
Now that you've mixed the three primary colors, let's look at what happens when you combine two of them. 

**Secondary colors** are defined as full-strength mixes of exactly two primary channels. 

There are three secondary colors: 
**Yellow** (Red + Green)
**Cyan** (Green + Blue)
**Magenta** (Blue + Red).

## [EXPOSITION]
This is where the advantage of the Colormxr interface becomes clear:

For example, to make Yellow, you could drag the Red slider up, and then drag the Green slider up — two separate moves that don't coordinate visually. 

Instead, **Yellow slider** controls both color channels at once, so you can move through all shades of Yellow in a single gesture while keeping the visual relationship intact.

## [EXPOSITION]
The same logic applies to the other secondary sliders: 

**Cyan** controls Green + Blue, 
**Magenta** controls Blue + Red. 

These dual-channel sliders are one of the key features of Colormxr;  they uncover the relationship between the primary and secondary colors, providing you with direct visual control of secondary colors in a meaningful way — something you can't do with basic RGB controls.

## [EXPERIMENT: secondary_yellow]
<!-- AI_PROMPT: Guide student to reset the shape color to Black and then drag the Yellow slider all the way to the top, noticing the relationship between the Red and Green sliders -->
<!-- CONTEXT: Making pure Yellow — RGB 255.255.0 -->
<!-- COLOR_TRIGGER: 255.255.0 -->
<!-- PILLS: ["How far up?", "Nothing's happening"] -->

## [EXPERIMENT: secondary_cyan]
<!-- AI_PROMPT: Guide student to drag the Cyan slider all the way to the top, noticing the relationship between the Green and Blue sliders -->
<!-- CONTEXT: Making pure Cyan — RGB 0.255.255 -->
<!-- COLOR_TRIGGER: 0.255.255 -->
<!-- PILLS: ["I'm confused"] -->

## [EXPERIMENT: secondary_magenta]
<!-- AI_PROMPT: Guide student to drag the Magenta slider all the way to the top, noticing the relationship between the Blue and Red sliders -->
<!-- CONTEXT: Making pure Magenta — RGB 255.0.255 -->
<!-- COLOR_TRIGGER: 255.0.255 -->
<!-- PILLS: ["I need help"] -->

## [EXPERIMENT: free_exploration]
<!-- AI_PROMPT: Guide student to mix all 6 primary and secondary colors in order: Red, Yellow, Green, Cyan, Blue, Magenta. Then change the background between Black, White, and Gray and observe how it affects the shape color. -->
<!-- FOCUS: Color interaction — how background value affects perceived foreground color -->
<!-- PILLS: ["Done — interesting!", "What am I supposed to notice?", "The background changes things a lot"] -->

## [OBSERVE: color_interaction]
<!-- AI_PROMPT: Ask what they noticed when changing the background — do colors feel different against black vs white vs gray? -->
<!-- FOCUS: Colors appear brighter on light backgrounds, richer on dark. This is color interaction. -->
<!-- PILLS: ["I'm ready to move on", "Tell me more", "I didn't notice much"] -->


---
