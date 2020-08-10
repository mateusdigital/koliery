//----------------------------------------------------------------------------//
//                       __      __                  __   __                  //
//               .-----.|  |_.--|  |.--------.---.-.|  |_|  |_                //
//               |__ --||   _|  _  ||        |  _  ||   _|   _|               //
//               |_____||____|_____||__|__|__|___._||____|____|               //
//                                                                            //
//  File      : Block.js                                                      //
//  Project   : columns                                                       //
//  Date      : Oct 11, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// Block                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
const BLOCK_COLOR_INDEX_COUNT = 3;
const BLOCK_BORDER_SIZE       = 1;

// Tweens
const BLOCK_DESTROY_TWEEN_DURATION_MS = 500;
const BLOCK_DESTROY_TWEEN_EASING      = TWEEN.Easing.Circular.In

const BLOCK_FALL_TWEEN_DURATION_MS = 600;
const BLOCK_FALL_TWEEN_EASING      = TWEEN.Easing.Back.Out

const BLOCK_BLINK_TWEEN_DURATION_MS       = 150;
const BLOCK_BLINK_TWEEN_BLINK_COUNT       = 2;
const BLOCK_BLINK_TWEEN_BLINK_DURATION_MS = (BLOCK_BLINK_TWEEN_DURATION_MS / BLOCK_BLINK_TWEEN_BLINK_COUNT);


//------------------------------------------------------------------------------
let S_BLOCK_OBJECT_ID = 0;

//------------------------------------------------------------------------------
function Create_Random_Block(boardRef)
{
    let color_index = pw_Random_Int(0, BLOCK_COLOR_INDEX_COUNT);
    let block       = new Block(boardRef, color_index);

    return block;
} // Create_Random_Block


//------------------------------------------------------------------------------
class Block
    extends PIXI.Sprite
{
    //--------------------------------------------------------------------------
    constructor(boardRef, colorIndex)
    {
        super(PIXI.Texture.WHITE);

        //
        // iVars
        // References.
        this.boardRef = boardRef;
        // HouseKeeping.
        this.blockId      = S_BLOCK_OBJECT_ID++;
        this.coordInBoard = pw_Vector_Create(0, 0);
        this.colorIndex   = colorIndex;
        this.isDestroying = false;

        this.width = this.boardRef.blockSize.x;
        this.height = this.boardRef.blockSize.y -1;
        this.tint = 0xFF0000;
        Apply_BlockTintEffect(this, gPalette.GetBlockColor(this.colorIndex));

        // // Debug.
        // let text = new PIXI.Text(this.blockId,{fontFamily : 'Arial', fontSize: 24, fill : 0xFFFFFF, align : 'left'});
        // text.x = this.width  / 2 - text.width  / 2;
        // text.y = this.height / 2 - text.height / 2;
        // this.addChild(text);
    } // ctor

    //--------------------------------------------------------------------------
    SetCoordInBoard(x, y)
    {
        this.coordInBoard.set(x, y);
    } // SetCoordInBoard

    //--------------------------------------------------------------------------
    StartDestroyAnimation()
    {
        this.isDestroying = true;
        const blink  = this._CreateBlinkAnimation();
        blink.start();
    } // StartDestroyAnimation

    //--------------------------------------------------------------------------
    StartFallAnimation(targetCoord)
    {
        let position = pw_Vector_Copy(this.position);
        let target   = pw_Vector_Create(position.x, targetCoord.y * this.boardRef.blockSize.y);

        // debugger;
        let tween = new TWEEN.Tween(position, this.boardRef.fallTweenGroup)
            .to(target, BLOCK_FALL_TWEEN_DURATION_MS)
            .onUpdate(()=>{
                this.x = position.x;
                this.y = position.y;
            })
            .onComplete(()=>{
               this.boardRef.RemoveBlock(this);
               this.boardRef.SetBlock(this, targetCoord);
            })
            .easing(BLOCK_FALL_TWEEN_EASING)
            .start();
    }

    //--------------------------------------------------------------------------
    _CreateSquashAnimation()
    {
        let tween = pw_Tween_CreateBasic(
            BLOCK_DESTROY_TWEEN_DURATION_MS,
            this.boardRef.destroyTweenGroup
        )
        .onComplete(()=>{
            this.boardRef.RemoveBlock(this);
        })
        .easing(BLOCK_DESTROY_TWEEN_EASING)

        return tween;
    } // _CreateSquashAnimation

    //--------------------------------------------------------------------------
    _CreateBlinkAnimation()
    {
        // @notice(stdmatt): Just to make easier to think how much the block
        // should blink. So when we think that it needs to blink 2 times,
        // we need to actually blink 4, because the tween actually "counts"
        // each transition as a blink.
        const repeat_ms = (BLOCK_BLINK_TWEEN_BLINK_COUNT  % 2 == 0)
            ? BLOCK_BLINK_TWEEN_BLINK_COUNT + 2
            : BLOCK_BLINK_TWEEN_BLINK_COUNT + 1;

        let tween = pw_Tween_CreateBasic(
            BLOCK_BLINK_TWEEN_BLINK_DURATION_MS
        )
        .repeat(repeat_ms)
        .yoyo(true)
        .onRepeat(()=>{
            const color = (!tween._reversed)
                ? gPalette.GetBlockColor     (this.colorIndex)
                : gPalette.GetBlockBlinkColor(this.colorIndex);

            this.blockTintEffect.SetColor(color);
        })
        .onComplete(()=>{
            const squash = this._CreateSquashAnimation();
            Apply_BlockSquashEffect(this, squash);
            squash.start();
        });

        return tween;
    } // _CreateBlinkAnimation
}; // class Block
