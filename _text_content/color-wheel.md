## [EXPOSITION]
**Building the Color Wheel**

## [EXPOSITION]
This exercise demonstrates how to build an RGB+CMY color wheel, showing the relationships between colors as they cycle around the wheel.

## [EXPOSITION]
Start by setting the primary colors.

Starting with the shape at 12 o'clock, make the shape pure **Red** by adding Red and removing its complementary, **Cyan**.

<!-- SHAPE_TRIGGERS: [{"shape": 11, "color": "#ff0000"}] -->
<!-- TRIGGER_SUCCESS: Red is set. -->

## [EXPOSITION]
Moving to the shape at 4 o'clock, make that shape **Green** by adding Green and removing its complementary, **Magenta**.

<!-- SHAPE_TRIGGERS: [{"shape": 3, "color": "#00ff00"}] -->
<!-- TRIGGER_SUCCESS: Green is set. -->

## [EXPOSITION]
Moving to the shape at 8 o'clock, color that shape **Blue** by adding Blue and removing its complementary, **Yellow**.

<!-- SHAPE_TRIGGERS: [{"shape": 7, "color": "#0000ff"}] -->
<!-- TRIGGER_SUCCESS: Blue is set. Primaries complete. -->

## [EXPOSITION]
Next, set the secondary colors.

Select the shape at 6 o'clock, opposite Red, and make that shape **Cyan** by adding Cyan and removing its complementary, **Red**.

<!-- SHAPE_TRIGGERS: [{"shape": 5, "color": "#00ffff"}] -->
<!-- TRIGGER_SUCCESS: Cyan is set. -->

## [EXPOSITION]
Select the shape opposite Green at 10 o'clock and make that shape **Magenta** by adding Magenta and removing its complementary, **Green**.

<!-- SHAPE_TRIGGERS: [{"shape": 9, "color": "#ff00ff"}] -->
<!-- TRIGGER_SUCCESS: Magenta is set. -->

## [EXPOSITION]
Finally, select the shape opposite Blue at 2 o'clock and make that shape **Yellow** by adding Yellow and removing its complementary, **Blue**.

<!-- SHAPE_TRIGGERS: [{"shape": 1, "color": "#ffff00"}] -->
<!-- TRIGGER_SUCCESS: Yellow is set. Secondaries complete. -->

## [EXPOSITION]
Now, to add the 'in between' colors.

Select the shape between Red and Yellow at 1 o'clock, and make that shape **Orange** by cloning Red onto that shape, then selecting it and moving the Green slider to a middle value.

<!-- SHAPE_TRIGGERS: [{"shape": 0, "color": "#ff8000"}] -->
<!-- TRIGGER_SUCCESS: Orange is set. -->

## [EXPOSITION]
Select the shape between Yellow and Green at 3 o'clock and clone Yellow onto that shape; then select it and move the Red slider to a middle value.

## [EXPOSITION]
Select the shape between Green and Cyan at 5 o'clock; clone Green onto that shape, then select it and move the Blue slider to a middle value.

## [EXPOSITION]
Select the shape between Cyan and Blue at 7 o'clock; clone Cyan onto that shape, then select it and move the Green slider to a middle value.

## [EXPOSITION]
Select the shape between Blue and Magenta at 9 o'clock; clone Blue onto that shape, then select it and move the Red slider to a middle value. We define this color as **Violet**.

<!-- SHAPE_TRIGGERS: [{"shape": 10, "color": "#8000ff"}] -->
<!-- TRIGGER_SUCCESS: Violet is set. -->

## [EXPOSITION]
Finally, select the shape between Magenta and Red at 11 o'clock; clone Magenta onto that shape, then select it and remove Blue to a middle value.

## [EXPOSITION]
Now that we have the full color wheel built, leave Orange and Violet, and remove the other non-primary/secondary colors by turning them **White**. We do this to avoid confusion, since these colors are hard to definitively name.

<!-- SHAPE_TRIGGERS: [{"shape": 4, "color": "#ffffff"}, {"shape": 2, "color": "#ffffff"}, {"shape": 6, "color": "#ffffff"}, {"shape": 8, "color": "#ffffff"}] -->
<!-- TRIGGER_SUCCESS: The wheel is clean. -->

## [EXPOSITION]
Now, we've defined the main palette colors for Colormxr: **Red**, **Orange**, **Yellow**, **Green**, **Cyan**, **Blue**, **Violet**, and **Magenta**. Select them in order while looking at the slider interface to see the progressive relationship between colors.
