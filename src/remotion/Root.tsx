import React from "react";
import { Composition } from "remotion";
import {
  VideoComposition,
  VideoCompositionProps,
} from "../components/video-editor/video-composition";
import { AIVideo } from "../app/video/[id]/aivideo";
import { useVideoPlayer } from "../hooks/use-video-editor";

const video: VideoCompositionProps = {
  _id: "97c33b6c-a005-48c1-8f52-816b5a6dcb33",
  user: "c05b7bfc-7042-453a-8577-3e19aa4e4959",
  title: "Video Project - 8/31/2025",
  script:
    "If you find yourself in a factory on a small island and your reflection isn't in the mirror, listen carefully. First, don't run. Second, if you hear footsteps behind you, stop. If they stop too, don't look back. Third, if the lights flicker and you see a face in the dark, blink slowly and smile. Fourth, if you see your reflection in a puddle and it's smiling back, wave and walk away. Lastly, if you wake up on a different floor of the factory, sit down and wait. Someone will find you.",
  status: "completed",
  format: {
    width: 1080,
    height: 1920,
  },
  segments: [
    {
      id: "fcd34af8-a3f6-4d1f-8805-cec79961ad35",
      _id: "fcd34af8-a3f6-4d1f-8805-cec79961ad35",
      text: "If you find yourself in a factory on a small island",
      imagePrompt:
        '{"description":"Imagine a large, old factory interior on a small, desolate island. The scene is atmospheric and dark, illuminated only by the harsh light of a camera flash. The factory is filled with rusted machinery and aging infrastructure. The camera\'s flash creates stark shadows, enhancing the eerie mood. In the foreground, an empty mirror hangs on a crumbling wall, reflecting nothing but darkness. The composition draws the eye into the depths of the factory, hinting at the isolation of the island setting. Light mist or fog clings to the floor, adding to the mysterious atmosphere.","lighting":"Dark with harsh, direct flash lighting creating strong contrasts and deep shadows.","atmosphere":"Isolated, eerie, and unsettling, with a sense of abandonment.","effects":"Stark contrasts, dramatic shadows, and slight mist on the floor."}',
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/fcd34af8-a3f6-4d1f-8805-cec79961ad35/image/image_0_1756654427736.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/fcd34af8-a3f6-4d1f-8805-cec79961ad35/audio/audio_0_1756654427376.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 3.76,
      withBlur: false,
      backgroundMinimized: false,
      order: 0,
      wordTimings: [
        {
          end: 0.699999988079071,
          text: "if you find",
          start: 0,
          words: [
            {
              end: 0.2199999988079071,
              text: "if",
              start: 0,
            },
            {
              end: 0.4399999976158142,
              text: "you",
              start: 0.2199999988079071,
            },
            {
              end: 0.699999988079071,
              text: "find",
              start: 0.4399999976158142,
            },
          ],
        },
        {
          end: 2.119999885559082,
          text: "yourself in a",
          start: 0.699999988079071,
          words: [
            {
              end: 1.1399999856948853,
              text: "yourself",
              start: 0.699999988079071,
            },
            {
              end: 1.559999942779541,
              text: "in",
              start: 1.1399999856948853,
            },
            {
              end: 2.119999885559082,
              text: "a",
              start: 1.559999942779541,
            },
          ],
        },
        {
          end: 2.8399999141693115,
          text: "factory on a",
          start: 2.119999885559082,
          words: [
            {
              end: 2.119999885559082,
              text: "factory",
              start: 2.119999885559082,
            },
            {
              end: 2.5799999237060547,
              text: "on",
              start: 2.119999885559082,
            },
            {
              end: 2.8399999141693115,
              text: "a",
              start: 2.5799999237060547,
            },
          ],
        },
        {
          end: 3.440000057220459,
          text: "small island",
          start: 2.8399999141693115,
          words: [
            {
              end: 3.140000104904175,
              text: "small",
              start: 2.8399999141693115,
            },
            {
              end: 3.440000057220459,
              text: "island",
              start: 3.140000104904175,
            },
          ],
        },
      ],

      media: [],
      elements: [],
    },
    {
      id: "213c0e83-5931-40aa-a8b9-4758fd5a397c",
      _id: "213c0e83-5931-40aa-a8b9-4758fd5a397c",
      text: "and your reflection isn't in the mirror, listen carefully.",
      imagePrompt:
        '{"description":"The view is from a dark, cavernous hallway inside the factory. The camera\'s flash reveals industrial grime and debris scattered across the floor. The focus is on a large, dusty mirror on the wall, which should reflect nothing but the dark hallway, adding to the unsettling atmosphere. The composition is balanced, with the mirror prominently placed in the center. Shadows loom behind the mirror, suggesting hidden depths beyond the visible scene. A cold, uneasy ambiance permeates the air.","lighting":"Camera flash highlighting the mirror and casting deep shadows in the hallway.","atmosphere":"Tense and suspenseful, with an ominous silence.","effects":"Grimy textures, high contrast reflections, and deep shadows."}',
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/213c0e83-5931-40aa-a8b9-4758fd5a397c/image/image_1_1756654427556.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/213c0e83-5931-40aa-a8b9-4758fd5a397c/audio/audio_1_1756654426889.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 3.81,
      withBlur: false,
      backgroundMinimized: false,
      order: 1,
      wordTimings: [
        {
          end: 0.9599999785423279,
          text: "and your reflection",
          start: 0,
          words: [
            {
              end: 0.2800000011920929,
              text: "and",
              start: 0,
            },
            {
              end: 0.4399999976158142,
              text: "your",
              start: 0.2800000011920929,
            },
            {
              end: 0.9599999785423279,
              text: "reflection",
              start: 0.4399999976158142,
            },
          ],
        },
        {
          end: 1.8799999952316284,
          text: "isn't in the",
          start: 0.9599999785423279,
          words: [
            {
              end: 1.440000057220459,
              text: "isn't",
              start: 0.9599999785423279,
            },
            {
              end: 1.6399999856948853,
              text: "in",
              start: 1.440000057220459,
            },
            {
              end: 1.8799999952316284,
              text: "the",
              start: 1.6399999856948853,
            },
          ],
        },
        {
          end: 3.319999933242798,
          text: "mirror Listen carefully",
          start: 1.8799999952316284,
          words: [
            {
              end: 2.059999942779541,
              text: "mirror",
              start: 1.8799999952316284,
            },
            {
              end: 2.880000114440918,
              text: "Listen",
              start: 2.880000114440918,
            },
            {
              end: 3.319999933242798,
              text: "carefully",
              start: 2.880000114440918,
            },
          ],
        },
      ],
      media: [],
      elements: [],
    },
    {
      id: "347eefe4-a971-4aba-b9c9-96b61eee261d",
      _id: "347eefe4-a971-4aba-b9c9-96b61eee261d",
      text: "First, don't run.",
      imagePrompt:
        '{"description":"A dimly lit factory corridor stretches into the darkness. The view captures a point-of-view as the camera looks down the long hallway. The harsh flash lighting illuminates patches of the corridor, creating a pattern of light and shadow. There is a sense of anticipation in the air. The middle distance reveals a shadowy figure partially obscured in darkness, suggesting the presence of something or someone just out of sight.","lighting":"Intermittent, harsh flash lighting creating a rhythm of light and shadow.","atmosphere":"Tense and alert, with a sense of foreboding.","effects":"Dramatic lighting contrasts, shadowy figures, and a sense of depth in the hallway."}',
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/347eefe4-a971-4aba-b9c9-96b61eee261d/image/image_2_1756654427858.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/347eefe4-a971-4aba-b9c9-96b61eee261d/audio/audio_2_1756654426720.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 1,
      withBlur: false,
      backgroundMinimized: false,
      order: 2,
      wordTimings: [
        {
          end: 0.800000011920929,
          text: "First don't run",
          start: 0,
          words: [
            {
              end: 0.3400000035762787,
              text: "First",
              start: 0,
            },
            {
              end: 0.6399999856948853,
              text: "don't",
              start: 0.47999998927116394,
            },
            {
              end: 0.800000011920929,
              text: "run",
              start: 0.6399999856948853,
            },
          ],
        },
      ],
      media: [],
      elements: [],
    },
    {
      id: "53e0fe63-a5ec-4219-bcbe-c26d88229fa4",
      _id: "53e0fe63-a5ec-4219-bcbe-c26d88229fa4",
      text: "Second, if you hear footsteps behind you, stop.",
      imagePrompt:
        '{"description":"A shadowy corner of the factory, where the light flickers sporadically, revealing a ghostly face in the dark. The face is pale and otherworldly, contrasted against the inky shadows. The composition is tight, focusing on the face, which seems to emerge from the darkness. The atmosphere is chilling, with the flickering light adding a sense of movement and unpredictability.","lighting":"Flickering, unreliable light that creates a sense of movement and instability.","atmosphere":"Eerie and ghostly, with a hint of the supernatural.","effects":"Flicker lighting, ghostly face details, and deep shadows."}',
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/53e0fe63-a5ec-4219-bcbe-c26d88229fa4/image/image_3_1756654428595.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/53e0fe63-a5ec-4219-bcbe-c26d88229fa4/audio/audio_3_1756654427233.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 3.55,
      withBlur: false,
      backgroundMinimized: false,
      order: 3,
      wordTimings: [
        {
          end: 0.8399999737739563,
          text: "Second if you",
          start: 0,
          words: [
            {
              end: 0.47999998927116394,
              text: "Second",
              start: 0,
            },
            {
              end: 0.6800000071525574,
              text: "if",
              start: 0.6600000262260437,
            },
            {
              end: 0.8399999737739563,
              text: "you",
              start: 0.6800000071525574,
            },
          ],
        },
        {
          end: 2.0399999618530273,
          text: "hear footsteps behind",
          start: 0.8399999737739563,
          words: [
            {
              end: 1.059999942779541,
              text: "hear",
              start: 0.8399999737739563,
            },
            {
              end: 1.5399999618530273,
              text: "footsteps",
              start: 1.059999942779541,
            },
            {
              end: 2.0399999618530273,
              text: "behind",
              start: 1.5399999618530273,
            },
          ],
        },
        {
          end: 2.880000114440918,
          text: "you stop",
          start: 2.0399999618530273,
          words: [
            {
              end: 2.240000009536743,
              text: "you",
              start: 2.0399999618530273,
            },
            {
              end: 2.880000114440918,
              text: "stop",
              start: 2.619999885559082,
            },
          ],
        },
      ],
      media: [],
      elements: [],
    },
    {
      id: "3c8fdf73-dab0-4fa3-8bbf-bb6f178c71ed",
      _id: "3c8fdf73-dab0-4fa3-8bbf-bb6f178c71ed",
      text: "If they stop too, don't look back.",
      imagePrompt:
        '{"description":"A reflective puddle on the factory\'s concrete floor captures the eerie ambience of the surroundings. The camera\'s flash lights up the water, which mirrors a smiling reflection staring back. The composition has the puddle in the foreground, with the dark factory interior looming in the background. The cold, unsettling smile in the reflection contrasts with the dim, somber surroundings.","lighting":"Harsh flash reflecting off the puddle, creating stark contrasts.","atmosphere":"Unsettling and mysterious, with a surreal twist.","effects":"Reflection details, eerie smile, and contrasting light and shadow."}',
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/3c8fdf73-dab0-4fa3-8bbf-bb6f178c71ed/image/image_4_1756654428078.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/3c8fdf73-dab0-4fa3-8bbf-bb6f178c71ed/audio/audio_4_1756654427503.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 2.44,
      withBlur: false,
      backgroundMinimized: false,
      order: 4,
      wordTimings: [
        {
          end: 0.7400000095367432,
          text: "If they stop",
          start: 0,
          words: [
            {
              end: 0.2199999988079071,
              text: "If",
              start: 0,
            },
            {
              end: 0.41999998688697815,
              text: "they",
              start: 0.2199999988079071,
            },
            {
              end: 0.7400000095367432,
              text: "stop",
              start: 0.41999998688697815,
            },
          ],
        },
        {
          end: 1.840000033378601,
          text: "to don't look",
          start: 0.7400000095367432,
          words: [
            {
              end: 1.0199999809265137,
              text: "to",
              start: 0.7400000095367432,
            },
            {
              end: 1.6799999475479126,
              text: "don't",
              start: 1.4600000381469727,
            },
            {
              end: 1.840000033378601,
              text: "look",
              start: 1.6799999475479126,
            },
          ],
        },
        {
          end: 2.180000066757202,
          text: "back",
          start: 1.840000033378601,
          words: [
            {
              end: 2.180000066757202,
              text: "back",
              start: 1.840000033378601,
            },
          ],
        },
      ],

      media: [],
      elements: [],
    },
    {
      id: "7f794591-e741-45b5-83bb-f134459c7876",
      _id: "7f794591-e741-45b5-83bb-f134459c7876",
      text: "Third, if the lights flicker and you see a face in the dark,",
      imagePrompt:
        '{"description":"A haunting view of the factory floor, filled with rusted machinery and crumbling walls. The camera\'s flash lights up a section of the floor, revealing a scene that feels both familiar and disorienting. The perspective is from a low angle, as if sitting down, capturing the factory\'s scale and decay. Dust motes dance in the air, visible in the flash light. The atmosphere is one of confusion and eerie anticipation.","lighting":"Direct flash highlighting textures and creating deep shadows.","atmosphere":"Disorienting and eerie, with a sense of quiet unease.","effects":"Decayed textures, floating dust motes, and stark contrasts."}',
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/7f794591-e741-45b5-83bb-f134459c7876/image/image_5_1756654428154.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/7f794591-e741-45b5-83bb-f134459c7876/audio/audio_5_1756654427761.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 3,
      withBlur: false,
      backgroundMinimized: false,
      order: 5,
      wordTimings: [
        {
          end: 0.8799999952316284,
          text: "Third if the",
          start: 0,
          words: [
            {
              end: 0.4399999976158142,
              text: "Third",
              start: 0,
            },
            {
              end: 0.6800000071525574,
              text: "if",
              start: 0.5600000023841858,
            },
            {
              end: 0.8799999952316284,
              text: "the",
              start: 0.6800000071525574,
            },
          ],
        },
        {
          end: 1.7599999904632568,
          text: "lights flicker and",
          start: 0.8799999952316284,
          words: [
            {
              end: 1.0800000429153442,
              text: "lights",
              start: 0.8799999952316284,
            },
            {
              end: 1.5199999809265137,
              text: "flicker",
              start: 1.0800000429153442,
            },
            {
              end: 1.7599999904632568,
              text: "and",
              start: 1.5199999809265137,
            },
          ],
        },
        {
          end: 2.200000047683716,
          text: "you see a",
          start: 1.7599999904632568,
          words: [
            {
              end: 1.9199999570846558,
              text: "you",
              start: 1.7599999904632568,
            },
            {
              end: 2.0199999809265137,
              text: "see",
              start: 1.9199999570846558,
            },
            {
              end: 2.200000047683716,
              text: "a",
              start: 2.0199999809265137,
            },
          ],
        },
        {
          end: 2.680000066757202,
          text: "face in the",
          start: 2.200000047683716,
          words: [
            {
              end: 2.380000114440918,
              text: "face",
              start: 2.200000047683716,
            },
            {
              end: 2.5199999809265137,
              text: "in",
              start: 2.380000114440918,
            },
            {
              end: 2.680000066757202,
              text: "the",
              start: 2.5199999809265137,
            },
          ],
        },
        {
          end: 2.819999933242798,
          text: "dark",
          start: 2.680000066757202,
          words: [
            {
              end: 2.819999933242798,
              text: "dark",
              start: 2.680000066757202,
            },
          ],
        },
      ],

      media: [],
      elements: [],
    },
    {
      id: "191a7d27-d4f6-4094-b040-14a453330615",
      _id: "191a7d27-d4f6-4094-b040-14a453330615",
      text: "blink slowly and smile.",
      imagePrompt: "Visual representation of: blink slowly and smile.",
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/191a7d27-d4f6-4094-b040-14a453330615/image/image_6_1756654427714.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/191a7d27-d4f6-4094-b040-14a453330615/audio/audio_6_1756654427902.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 2.16,
      withBlur: false,
      backgroundMinimized: false,
      order: 6,
      wordTimings: [
        {
          end: 1.3200000524520874,
          text: "Link slowly and",
          start: 0,
          words: [
            {
              end: 0.41999998688697815,
              text: "Link",
              start: 0,
            },
            {
              end: 0.8600000143051147,
              text: "slowly",
              start: 0.41999998688697815,
            },
            {
              end: 1.3200000524520874,
              text: "and",
              start: 0.8600000143051147,
            },
          ],
        },
        {
          end: 1.600000023841858,
          text: "smile",
          start: 1.3200000524520874,
          words: [
            {
              end: 1.600000023841858,
              text: "smile",
              start: 1.3200000524520874,
            },
          ],
        },
      ],

      media: [],
      elements: [],
    },
    {
      id: "1d360df6-a7fb-409d-aa49-da72e62ca6f2",
      _id: "1d360df6-a7fb-409d-aa49-da72e62ca6f2",
      text: "Fourth, if you see your reflection in a puddle",
      imagePrompt:
        "Visual representation of: Fourth, if you see your reflection in a puddle",
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/1d360df6-a7fb-409d-aa49-da72e62ca6f2/image/image_7_1756654428243.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/1d360df6-a7fb-409d-aa49-da72e62ca6f2/audio/audio_7_1756654428026.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 2.56,
      withBlur: false,
      backgroundMinimized: false,
      order: 7,
      wordTimings: [
        {
          end: 0.9599999785423279,
          text: "Fourth if you",
          start: 0,
          words: [
            {
              end: 0.5,
              text: "Fourth",
              start: 0,
            },
            {
              end: 0.7799999713897705,
              text: "if",
              start: 0.699999988079071,
            },
            {
              end: 0.9599999785423279,
              text: "you",
              start: 0.7799999713897705,
            },
          ],
        },
        {
          end: 1.659999966621399,
          text: "see a reflection",
          start: 0.9599999785423279,
          words: [
            {
              end: 1.100000023841858,
              text: "see",
              start: 0.9599999785423279,
            },
            {
              end: 1.3200000524520874,
              text: "a",
              start: 1.100000023841858,
            },
            {
              end: 1.659999966621399,
              text: "reflection",
              start: 1.3200000524520874,
            },
          ],
        },
        {
          end: 2.319999933242798,
          text: "in a puddle",
          start: 1.659999966621399,
          words: [
            {
              end: 2,
              text: "in",
              start: 1.659999966621399,
            },
            {
              end: 2.1600000858306885,
              text: "a",
              start: 2,
            },
            {
              end: 2.319999933242798,
              text: "puddle",
              start: 2.1600000858306885,
            },
          ],
        },
      ],

      media: [],
      elements: [],
    },
    {
      id: "53608217-744c-4abc-9140-46a30ab267f3",
      _id: "53608217-744c-4abc-9140-46a30ab267f3",
      text: "and it's smiling back, wave and walk away.",
      imagePrompt:
        "Visual representation of: and it's smiling back, wave and walk away.",
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/53608217-744c-4abc-9140-46a30ab267f3/image/image_8_1756654428462.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/53608217-744c-4abc-9140-46a30ab267f3/audio/audio_8_1756654427166.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 3.04,
      withBlur: false,
      backgroundMinimized: false,
      order: 8,
      wordTimings: [
        {
          end: 0.7400000095367432,
          text: "and it's smiling",
          start: 0,
          words: [
            {
              end: 0.20000000298023224,
              text: "and",
              start: 0,
            },
            {
              end: 0.46000000834465027,
              text: "it's",
              start: 0.20000000298023224,
            },
            {
              end: 0.7400000095367432,
              text: "smiling",
              start: 0.46000000834465027,
            },
          ],
        },
        {
          end: 2.240000009536743,
          text: "back wave and",
          start: 0.7400000095367432,
          words: [
            {
              end: 1.2599999904632568,
              text: "back",
              start: 0.7400000095367432,
            },
            {
              end: 1.940000057220459,
              text: "wave",
              start: 1.940000057220459,
            },
            {
              end: 2.240000009536743,
              text: "and",
              start: 1.940000057220459,
            },
          ],
        },
        {
          end: 2.7799999713897705,
          text: "walk away",
          start: 2.240000009536743,
          words: [
            {
              end: 2.4800000190734863,
              text: "walk",
              start: 2.240000009536743,
            },
            {
              end: 2.7799999713897705,
              text: "away",
              start: 2.4800000190734863,
            },
          ],
        },
      ],
      media: [],
      elements: [],
    },
    {
      id: "eb8fea07-d04e-4456-b92b-dc4f5648f033",
      _id: "eb8fea07-d04e-4456-b92b-dc4f5648f033",
      text: "Lastly, if you wake up on a different floor of the factory, sit down and wait.",
      imagePrompt:
        "Visual representation of: Lastly, if you wake up on a different floor of the factory, sit down and wait.",
      imageUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/eb8fea07-d04e-4456-b92b-dc4f5648f033/image/image_9_1756654427659.jpg",
      audioUrl:
        "https://assets.cursorshorts.com/c05b7bfc-7042-453a-8577-3e19aa4e4959/97c33b6c-a005-48c1-8f52-816b5a6dcb33/eb8fea07-d04e-4456-b92b-dc4f5648f033/audio/audio_9_1756654427535.mp3",
      audioVolume: 1,
      playBackRate: 1,
      duration: 5.01,
      withBlur: false,
      backgroundMinimized: false,
      order: 9,
      wordTimings: [
        {
          end: 1.2799999713897705,
          text: "Lastly if you",
          start: 0,
          words: [
            {
              end: 0.6000000238418579,
              text: "Lastly",
              start: 0,
            },
            {
              end: 1.059999942779541,
              text: "if",
              start: 0.9800000190734863,
            },
            {
              end: 1.2799999713897705,
              text: "you",
              start: 1.059999942779541,
            },
          ],
        },
        {
          end: 1.7000000476837158,
          text: "wake up on",
          start: 1.2799999713897705,
          words: [
            {
              end: 1.440000057220459,
              text: "wake",
              start: 1.2799999713897705,
            },
            {
              end: 1.600000023841858,
              text: "up",
              start: 1.440000057220459,
            },
            {
              end: 1.7000000476837158,
              text: "on",
              start: 1.600000023841858,
            },
          ],
        },
        {
          end: 2.4000000953674316,
          text: "a different floor",
          start: 1.7000000476837158,
          words: [
            {
              end: 1.9199999570846558,
              text: "a",
              start: 1.7000000476837158,
            },
            {
              end: 2.180000066757202,
              text: "different",
              start: 1.9199999570846558,
            },
            {
              end: 2.4000000953674316,
              text: "floor",
              start: 2.180000066757202,
            },
          ],
        },
        {
          end: 3.0399999618530273,
          text: "of the factory",
          start: 2.4000000953674316,
          words: [
            {
              end: 2.559999942779541,
              text: "of",
              start: 2.4000000953674316,
            },
            {
              end: 2.700000047683716,
              text: "the",
              start: 2.559999942779541,
            },
            {
              end: 3.0399999618530273,
              text: "factory",
              start: 2.700000047683716,
            },
          ],
        },
        {
          end: 4.21999979019165,
          text: "sit down and",
          start: 3.5399999618530273,
          words: [
            {
              end: 3.6600000858306885,
              text: "sit",
              start: 3.5399999618530273,
            },
            {
              end: 3.880000114440918,
              text: "down",
              start: 3.6600000858306885,
            },
            {
              end: 4.21999979019165,
              text: "and",
              start: 3.880000114440918,
            },
          ],
        },
        {
          end: 4.300000190734863,
          text: "wait",
          start: 4.21999979019165,
          words: [
            {
              end: 4.300000190734863,
              text: "wait",
              start: 4.21999979019165,
            },
          ],
        },
      ],
      media: [],
      elements: [],
    },
  ],
  selectedMedia: {
    images: [],
    videos: [],
  },
  voice: "default",
  type: "short",
  mediaType: "image",
  isRemotion: true,
  selectedModel: "default",
  audioType: "tts",
  audioPrompt: "",
  watermark: false,
  isFeatured: false,
  layers: [],
  tracks: [],
  createdAt: "2025-08-31T15:33:24.021Z",
  updatedAt: "2025-08-31T15:33:52.655Z",
  __v: 0,
};
export const RemotionRoot: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    selectedFrameIndex,
    totalDuration,
    currentSegmentInfo,
    togglePlayPause,
    updateCurrentTime,
    selectFrame,
  } = useVideoPlayer(video);

  // Calculate frame number for display
  const fps = 30;
  const totalFrames = Math.max(1, Math.floor(totalDuration * fps));

  return (
    <>
      <Composition
        id="VideoComposition"
        className="h-80 w-full"
        component={VideoComposition}
        durationInFrames={totalFrames}
        compositionWidth={video.format?.width || "1080"}
        compositionHeight={video.format?.height || "1920"}
        fps={fps}
        width={video.format.width || "1080"}
        height={video.format.height || "1920"}
        style={{
          width: "100%",
          height: "100%",
        }}
        defaultProps={{
          project: video,
        }}
        autoPlay={false}
        controls={true}
        loop={false}
        allowFullscreen
        doubleClickToFullscreen
        showVolumeControls={true}
        spaceKeyToPlayOrPause={false}
      />
    </>
  );
};
