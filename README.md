# jQuery Slider

"jQuery Slider" is Qlik Sense extension that uses [jQuery UI Range slider](https://jqueryui.com/slider/#range).
The extension is based on a ***field (and not on variable)***. 

After assign dimension, is possible to select consecutive values from this field with the slider. The slider will also change based on the selected/possible values in the desired field.

The slider is using QS internal field values numeration to check if the selected/possible values are consecutive or not. Which makes the slider "Load order" based. 