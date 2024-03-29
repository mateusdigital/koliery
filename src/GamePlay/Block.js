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
const BLOCK_GRAY_INDEX        = 1;
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
let _S_BLOCK_OBJECT_ID  = 0;
let _BLOCKS_TEMPLATE_TEXTURE = null;
let _GRAY_BLOCK_TEXTURE      = null;
let _BLOCKS_COLORED_TEXTURES = [];

//------------------------------------------------------------------------------
function Create_Random_Block(boardRef)
{
    let color_index = pw_Random_Int(0, BLOCK_COLOR_INDEX_COUNT);
    let block       = new Block(boardRef, color_index);

    return block;
} // Create_Random_Block

//------------------------------------------------------------------------------
function _Create_Blocks_Texture(blockColor, blockSize)
{
    const canvas  = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width  = blockSize.x;
    canvas.height = blockSize.y;

    var template_texture = pw_Texture_GetFromCoords(
        _BLOCKS_TEMPLATE_TEXTURE,
        0, 0,
        blockSize.x,
        blockSize.y
    );

    context.drawImage(template_texture.baseTexture.source, 0, 0);
    const image_data = context.getImageData(0, 0, canvas.width, canvas.height);

    const base      = blockColor.rgb();
    const border    = blockColor.darken(1).rgb();
    const highlight = blockColor.brighten(2).rgb();

    for (let i = 0; i < image_data.data.length; i += 4) {
        const r = image_data.data[i];
        const g = image_data.data[i + 1];
        const b = image_data.data[i + 2];

        if (r == 255) {
            curr_color = border;
        } else if (g == 255) {
            curr_color = base;
        } else if (b == 255) {
            curr_color = highlight;
        }

        image_data.data[i]     = curr_color[0];
        image_data.data[i + 1] = curr_color[1];
        image_data.data[i + 2] = curr_color[2];
}

    context.putImageData(image_data, 0, 0);
    const colored_texture = PIXI.Texture.from(canvas);
    _BLOCKS_COLORED_TEXTURES.push(colored_texture);
}


//------------------------------------------------------------------------------
class Block
    extends PIXI.Sprite
{
    //--------------------------------------------------------------------------
    constructor(boardRef, colorIndex)
    {
        if(!_BLOCKS_TEMPLATE_TEXTURE) {
            _BLOCKS_TEMPLATE_TEXTURE = pw_Texture_Get(RES_TEXTURES_BLOCKS_PNG);

            var block_colors = gPalette.GetBlockColors();
            for(let i = 0; i < block_colors.length; ++i) {
                _Create_Blocks_Texture(block_colors[i], boardRef.blockSize);
            }

            _GRAY_BLOCK_TEXTURE = pw_Texture_GetFromCoords(
                _BLOCKS_TEMPLATE_TEXTURE,
                boardRef.blockSize.x * BLOCK_GRAY_INDEX,
                0,
                boardRef.blockSize.x,
                boardRef.blockSize.y
            );
        }

        const texture = _BLOCKS_COLORED_TEXTURES[colorIndex];
        super(texture);


        //
        // iVars
        // References.
        this.boardRef = boardRef;
        // HouseKeeping.
        this.blockId      = _S_BLOCK_OBJECT_ID++;
        this.coordInBoard = pw_Vector_Create(0, 0);
        this.colorIndex   = colorIndex;
        this.isDestroying = false;

        this.width  = this.boardRef.blockSize.x;
        this.height = this.boardRef.blockSize.y;

        this.default_texture = texture;
        this.mask            = this.boardRef.board_mask_sprite;

        // Debug.
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
        const position = pw_Vector_Copy(this.position);
        const target   = pw_Vector_Create(position.x, targetCoord.y * this.boardRef.blockSize.y);

        // debugger;
        const tween = new TWEEN.Tween(position, this.boardRef.fallTweenGroup)
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
        const tween = pw_Tween_CreateBasic(
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
            const texture = (!tween._reversed)
                ? this.default_texture
                : _GRAY_BLOCK_TEXTURE;

            this.texture = texture;
        })
        .onComplete(()=>{
            const squash = this._CreateSquashAnimation();
            Apply_BlockSquashEffect(this, squash);
            squash.start();
        });

        return tween;
    } // _CreateBlinkAnimation
}; // class Block
