//----------------------------------------------------------------------------//
//                       __      __                  __   __                  //
//               .-----.|  |_.--|  |.--------.---.-.|  |_|  |_                //
//               |__ --||   _|  _  ||        |  _  ||   _|   _|               //
//               |_____||____|_____||__|__|__|___._||____|____|               //
//                                                                            //
//  File      : SceneMenu.js                                                  //
//  Project   : columns                                                       //
//  Date      : Oct 10, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// SceneMenu                                                                  //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
const SCENE_MENU_TITLE_STR           = "KOLIERY";
const SCENE_MENU_TITLE_SIZE          = 100;
const SCENE_MENU_TITLE_SIN_AMPLITUDE = 20;
const SCENE_MENU_TITLE_SIN_FREQUENCY = 1;

const SCENE_MENU_LEVEL_TEXT_TWEEN_DURATION_MS = 300;
const SCENE_MENU_LEVEL_TEXT_TWEEN_DELAY_MS    = 300;
const SCENE_MENU_LEVEL_FONT_SIZE              = 50;
const SCENE_MENU_OPTIONS_FONT_SIZE            = 35;
const SCENE_MENU_MARQUEE_FONT_SIZE            = 25;

const SCENE_MENU_MARQUEE_TWEEN_DURATION_MS     = 500;
const SCENE_MENU_MARQUEE_TWEEN_DELAY_MS        = 500;
const SCENE_MENU_MARQUEE_TWEEN_REPEAT_DELAY_MS = 2000;

// Sound.
const SCENE_MENU_MUSIC_BACKGROUND = RES_AUDIO_KOMIKU_06_SCHOOL_MP3;
const SCENE_MENU_EFFECT_MENU      = RES_AUDIO_MENU_INTERACTION_WAV;


//------------------------------------------------------------------------------
class SceneMenu
    extends pw_Base_Scene
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();

        //
        // iVars.
        // Title Text.
        this.titleText             = []
        this.titleTextLayer        = new PIXI.Container();
        this.titleTextSinAmplitude = SCENE_MENU_TITLE_SIN_AMPLITUDE;
        this.titleTextSinFrequency = SCENE_MENU_TITLE_SIN_FREQUENCY;

        // Level Text.
        this.levelText       = [];
        this.levelTextLayer  = new PIXI.Container();
        this.levelTweenGroup = pw_Tween_CreateGroup();

        // Marquee Text.
        this.marqueeStrings = [
            "DEVELOPED BY",
            "MATEUS.DIGITAL",
            // "",
            // "",
            "GREETINGS TO THE FRIENDS",
            "OF PROGRAMMERS HIDEOUT",
            // "",
            "AND A BIG BIG KISS",
            "TO MY MOM AND PINGO",
            "-- I MISS YOU --",
            "",
            "FOR MARLA",
            "",
            "",
        ];
        this.marqueeText       = null;
        this.marqueeTween      = null;
        this.marqueeTextIndex  = 0;
        this.marqueeTweenGroup = pw_Tween_CreateGroup();

        // Menu Structure.
        this.menuStructure    = null;
        this.menuSectionIndex = 0;

        //
        // Initialize.
        this._CreateMenuStructure();

        this._InitializeTitleText  ();
        this._InitializeLevelText  ();
        this._InitializeMarqueeText();

        gAudio.Play(SCENE_MENU_MUSIC_BACKGROUND);

        gStarfield.SetSpeedModifier(1);
    } // ctor

    //--------------------------------------------------------------------------
    Update(dt)
    {
        gStarfield.Update(dt);

        if(pw_Keyboard_IsClick(PW_KEY_ARROW_DOWN)) {
            this._UpdateMenuSelection(+1);
        } else if(pw_Keyboard_IsClick(PW_KEY_ARROW_UP)) {
            this._UpdateMenuSelection(-1);
        } else if(pw_Keyboard_IsClick(PW_KEY_ENTER)) {
            this._OnMenuSelection();
        }

        // Tweens.
        this.levelTweenGroup  .update();
        this.marqueeTweenGroup.update();

        // Title.
        for(let i = 0; i < this.titleText.length; ++i) {
            const text = this.titleText[i];
            const len_i = (this.titleText.length - i);

            const value = -pw_Math_Sin(
                (pw_Application_Total_Time * PW_MATH_2PI + len_i) / this.titleTextSinFrequency
            );

            text.y = (value * this.titleTextSinAmplitude);
        }
    } // Update

    //--------------------------------------------------------------------------
    _UpdateMenuSelection(delta)
    {
        const old_selection_index = this.menuSectionIndex;
        const new_selection_index = pw_Math_Wrap(
            0,
            this.levelText.length - 1,
            this.menuSectionIndex + delta,
        );

        const normal_color = gPalette.GetMenuTextNormalColor();
        const select_color = gPalette.GetMenuTextSelectColor(new_selection_index);

        const old_selection_text = this.levelText[old_selection_index];
        const new_selection_text = this.levelText[new_selection_index];

        old_selection_text.rtvar_gradientEffect.SetColor(normal_color);
        new_selection_text.rtvar_gradientEffect.SetColor(select_color);

        this.menuSectionIndex = new_selection_index;
        gAudio.PlayEffect(SCENE_MENU_EFFECT_MENU);
    } // _UpdateMenuSelection

    //--------------------------------------------------------------------------
    _OnMenuSelection()
    {
        gAudio.PlayEffect(SCENE_MENU_EFFECT_MENU);
        switch(this.menuSectionIndex) {
            //
            case 0: Go_To_Scene(SceneGame, SCENE_GAME_LEVEL_EASY  ); break;
            case 1: Go_To_Scene(SceneGame, SCENE_GAME_LEVEL_MEDIUM); break;
            case 2: Go_To_Scene(SceneGame, SCENE_GAME_LEVEL_HARD  ); break;
            //
            case 3: {
                gAudio.ToggleMute();
                this.levelText[3].text = this._GetSoundStatusString();
            }break;
            //
            case 4: Go_To_Scene(SceneHighScore, SceneMenu, SCENE_HIGHSCORE_OPTIONS_NONE); break;
            case 5: Go_To_Scene(SceneCredits); break;
        }
    } // _OnMenuSelection

    //--------------------------------------------------------------------------
    _CreateMenuStructure()
    {
        this.menuStructure = [
            //
            {
                font_size : SCENE_MENU_LEVEL_FONT_SIZE,
                gap       : 0,
                texts     : [
                    "EASY",
                    "MEDIUM",
                    "HARD",
                ]
            },
            //
            {
                font_size : SCENE_MENU_OPTIONS_FONT_SIZE,
                gap       : 20,
                texts     : [
                    this._GetSoundStatusString()
                ]
            },
            //
            {
                font_size : SCENE_MENU_OPTIONS_FONT_SIZE,
                gap       : 20,
                texts     : [
                    "SCORES",
                    "CREDITS",
                ]
            }
        ];
    } // _CreateMenuStructure

    //--------------------------------------------------------------------------
    _InitializeTitleText()
    {
        const str_len    = SCENE_MENU_TITLE_STR.length;
        const LETTER_GAP = 10;

        for(let i = 0; i < str_len; ++i) {
            const c     = SCENE_MENU_TITLE_STR[i];
            const color = gPalette.GetTitleCharColor(i);
            const text  = new pw_Text(c, FONT_PIXELFORCE, SCENE_MENU_TITLE_SIZE, color.num());

            let prev_x = 0;
            let prev_w = 0;
            if(i > 0) {
                prev_x = this.titleText[i-1].x;
                prev_w = this.titleText[i-1].width;
            }

            text.x = (prev_x + prev_w) + LETTER_GAP;

            this.titleTextLayer.addChild(text);
            this.titleText.push(text);
        }

        const screen_size = Get_Design_Size();
        this.titleTextLayer.pivot.set(
            this.titleTextLayer.width  * 0.5,
            this.titleTextLayer.height * 0.5
        );
        this.titleTextLayer.x = (screen_size.x * 0.50)
        this.titleTextLayer.y = (screen_size.y * 0.22) - (this.titleTextSinAmplitude * 2);

        this.addChild(this.titleTextLayer);
    } // _InitializeTitleText

    //--------------------------------------------------------------------------
    _InitializeLevelText()
    {
        const screen_size      = Get_Design_Size();
        const create_text_func = (str, font_size) => {
            // Tween.
            const tween = pw_Tween_CreateBasic(
                SCENE_MENU_LEVEL_TEXT_TWEEN_DURATION_MS,
                this.levelTweenGroup
            )
            .delay(
                (SCENE_MENU_LEVEL_TEXT_TWEEN_DELAY_MS * this.levelText.length)
            )
            .start();

            // Text.
            const text  = new pw_Text(str, FONT_COMMODORE, font_size);
            const color = (this.menuSectionIndex != this.levelText.length)
                ? gPalette.GetMenuTextNormalColor()
                : gPalette.GetMenuTextSelectColor(this.menuSectionIndex);

            Apply_TextUncoverEffect (text, tween);
            Apply_TextGradientEffect(text, color);

            text.anchor.set(0.5, 0.5);

            this.levelText     .push    (text);
            this.levelTextLayer.addChild(text);

            return text;
        }

        let curr_y = 0;
        for(let i = 0; i < this.menuStructure.length; ++i) {
            const section = this.menuStructure[i];
            curr_y += section.gap;

            for(let j = 0; j < section.texts.length; ++j) {
                const str  = section.texts[j];
                const text = create_text_func(str, section.font_size);

                text.x = 0; //(layer_width * 0.5) - (text.width * 0.5);
                text.y = curr_y;

                curr_y += section.font_size;
            }
        }

        // Apply_Debug_Filter(this.levelTextLayer);
        // Text Layer.
        this.levelTextLayer.x = (screen_size.x * 0.50);
        this.levelTextLayer.y = (screen_size.y * 0.40);

        this.addChild(this.levelTextLayer);

        // Tween Group
        this.levelTweenGroup.onComplete(()=>{
            this._SetupMarqueeTween();
        });
    } // _InitializeLevelText

    //--------------------------------------------------------------------------
    _InitializeMarqueeText()
    {
        // Tween.
        this.marqueeTween = pw_Tween_CreateBasic(
            SCENE_MENU_MARQUEE_TWEEN_DURATION_MS,
            this.marqueeTweenGroup
        );

        // Text.
        const screen_size = Get_Design_Size();
        const str         = this.marqueeStrings[0];
        const color       = chroma("black");

        this.marqueeText = new pw_Text(str, FONT_PIXELFORCE, SCENE_MENU_MARQUEE_FONT_SIZE);
        Apply_TextUncoverEffect (this.marqueeText, this.marqueeTween);
        Apply_TextGradientEffect(this.marqueeText, color            );

        this.marqueeText.anchor.set(0.5, 0.5);
        this.marqueeText.x = screen_size.x * 0.5;
        this.marqueeText.y = screen_size.y * 0.95;

        this.addChild(this.marqueeText);
    } // _InitializeMarqueeText

    //--------------------------------------------------------------------------
    _SetupMarqueeTween()
    {
        this.marqueeTween
            .delay(SCENE_MENU_MARQUEE_TWEEN_DELAY_MS)
            .repeatDelay(SCENE_MENU_MARQUEE_TWEEN_REPEAT_DELAY_MS)
            .yoyo(true)
            .repeat(1)
            .onStart(()=>{
                const strings_len = this.marqueeStrings.length;
                const index       = this.marqueeTextIndex;

                const color = gPalette.GetTitleCharColor(index);
                this.marqueeText.filters[1].SetColor(color);

                this.marqueeTextIndex = (index + 1) % strings_len;
                this.marqueeText.text = this.marqueeStrings[index];

                // @notice(stdmatt): After we loop thru all the marquee texts
                // go to another scene.
                if(this.marqueeTextIndex == 0) {
                    Go_To_Scene(
                        SceneHighScore,
                        SceneMenu,
                        SCENE_HIGHSCORE_OPTIONS_GO_BACK_AUTOMATICALLY
                    );
                }
            })
            .start();

            this.marqueeTweenGroup.onComplete(()=>{
                this._SetupMarqueeTween();
            });
    } // _SetupMarqueeTween

    //--------------------------------------------------------------------------
    _GetSoundStatusString()
    {
        return (gAudio.isMuted) ? "SOUNDS OFF" : "SOUNDS ON";
    } // _GetSoundStatusString
}; // class SceneMenu
