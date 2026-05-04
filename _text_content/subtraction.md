## [EXPOSITION]
**Color by subtraction**

## [EXPOSITION]
Starting on the left, you will color each shape by color subtraction from **White**.

## [EXPOSITION]
Select the first shape and subtract **Red**.

<!-- SHAPE_TRIGGERS: [{"shape": 0, "color": "#00ffff"}] -->
<!-- TRIGGER_SUCCESS: Right — subtracting Red from White leaves Cyan. -->

## [EXPOSITION]
Repeat on the next shape and subtract **Green**.

<!-- SHAPE_TRIGGERS: [{"shape": 1, "color": "#ff00ff"}] -->
<!-- TRIGGER_SUCCESS: Right — subtracting Green from White leaves Magenta. -->

## [EXPOSITION]
On the third shape, subtract **Blue**.

<!-- SHAPE_TRIGGERS: [{"shape": 2, "color": "#ffff00"}] -->
<!-- TRIGGER_SUCCESS: Right — subtracting Blue from White leaves Yellow. -->

## [CHECKPOINT: what_colors]
What colors are you left with?

<!-- AI_PROMPT: The student has just subtracted Red, Green, and Blue from three white shapes, resulting in Cyan, Magenta, and Yellow respectively. Ask them simply: what colors are they left with? If they answer "Blue, Red, and Yellow", correct them — those are the colors that were subtracted, not what remains. The correct answer is Cyan, Magenta, and Yellow. Keep your response brief. -->
<!-- PILLS: ["Cyan, Magenta, Yellow", "Blue, Red, and Yellow"] -->

## [EXPOSITION]
It's the same process for the last 3 **White** shapes — subtract the secondary color, in order: **Yellow**, **Cyan**, and **Magenta**.

<!-- SHAPE_TRIGGERS: [{"shape": 3, "color": "#0000ff"}, {"shape": 4, "color": "#ff0000"}, {"shape": 5, "color": "#00ff00"}] -->
<!-- TRIGGER_SUCCESS: Exactly right. -->

## [EXPOSITION]
Are you seeing a pattern?
