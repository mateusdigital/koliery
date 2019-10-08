//----------------------------------------------------------------------------//
// SceneSplash                                                                //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
const SPLASH_SCENE_FONT_SIZE               = 40;
const SPLASH_SCENE_TEXT_EFFECT_DURATION_MS = 1300;

//------------------------------------------------------------------------------
class SceneSplash
    extends Base_Scene
{
    //--------------------------------------------------------------------------
    constructor()
    {
        super();

        //
        // iVars.
        // Properties.
        this.stdmattText  = new Text("stdmatt",  SPLASH_SCENE_FONT_SIZE);
        this.presentsText = new Text("presents", SPLASH_SCENE_FONT_SIZE);

        this.stdmattTextEffect  = new TextUncoverEffect(this.stdmattText );
        this.presentsTextEffect = new TextUncoverEffect(this.presentsText);

        this.effectTween = this._CreateEffectTween();

        //
        // Initialize.
        const screen_size = Get_Screen_Size();

        this.stdmattText.pivot.set(0.5);
        this.stdmattText.x = (screen_size.x * 0.5);
        this.stdmattText.y = (screen_size.y * 0.5) - this.stdmattText.height;

        this.presentsText.pivot.set(0.5);
        this.presentsText.x = (screen_size.x * 0.5);
        this.presentsText.y = (screen_size.y * 0.5) + this.presentsText.height;

        this.addChild(this.stdmattText );
        this.addChild(this.presentsText);
    } // ctor

    //--------------------------------------------------------------------------
    _CreateEffectTween()
    {
        let progress = {t: 0};
        let final    = {t: 1};

        const tween = new TWEEN.Tween(progress)
            .to(final, SPLASH_SCENE_TEXT_EFFECT_DURATION_MS)
            .onUpdate(()=>{
                console.log(progress.t);
                this.stdmattTextEffect .progress = progress.t;
                this.presentsTextEffect.progress = progress.t;
            })
            .delay(500)
            .yoyo(true)
            .repeat(1)
            .start();
    } // _CreateEffectTween
}; // class SceneSplash
