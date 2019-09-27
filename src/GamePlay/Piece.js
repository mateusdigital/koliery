//----------------------------------------------------------------------------//
//                       __      __                  __   __                  //
//               .-----.|  |_.--|  |.--------.---.-.|  |_|  |_                //
//               |__ --||   _|  _  ||        |  _  ||   _|   _|               //
//               |_____||____|_____||__|__|__|___._||____|____|               //
//                                                                            //
//  File      : Piece.js                                                      //
//  Project   : columns                                                       //
//  Date      : Sep 25, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//----------------------------------------------------------------------------//


/// @XXX(stdmatt): Read the documentation of graphics. that there's some stuff
//  that we need to do to remove the graphics without a leak...

//----------------------------------------------------------------------------//
// Block                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
const BLOCK_COLOR_INDEX_COUNT = 7;
//------------------------------------------------------------------------------
let S_BLOCK_OBJECT_ID = 0;

//------------------------------------------------------------------------------
function Create_Random_Block(boardRef)
{
    let color_index = Math_RandomInt(0, BLOCK_COLOR_INDEX_COUNT);
    let block = new Block(boardRef, color_index);
    return block;
} // Create_Random_Block

//------------------------------------------------------------------------------
class Block
    extends PIXI.Container
{
    //--------------------------------------------------------------------------
    constructor(boardRef, colorIndex)
    {
        super();

        //
        // iVars
        // References.
        this.boardRef = boardRef;
        // HouseKeeping.
        this.objectId     = S_BLOCK_OBJECT_ID++;
        this.coordInBoard = Create_Point(0, 0);
        this.colorIndex   = colorIndex;
        this.isDestroying = false;
        this.destroyValue = 0;

        // Drawing.
        this.graphics = new PIXI.Graphics();
        this._DrawGraphics();
        this.addChild(this.graphics);

        // Debug.
        // let text = new PIXI.Text(this.colorIndex,{fontFamily : 'Arial', fontSize: 24, fill : 0xFFFFFF, align : 'left'});
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
        this.destroyValue = 0;
    } // StartDestroyAnimation

    //--------------------------------------------------------------------------
    SetDestroyAnimationValue(value)
    {
        this.destroyValue = value;
        this._DrawGraphics();
    } // SetDestroyAnimationValue

    //--------------------------------------------------------------------------
    _DrawGraphics()
    {
        const size  = this.boardRef.blockSize;
        const color = gPalette.GetBlockColor(this.colorIndex);

        this.graphics.clear();

        const x = 0;
        const y = size.y * (this.destroyValue / 2);
        const w = size.x;
        const h = size.y - (y * 2);

        this.graphics.beginFill(color, 1);
            // this.graphics.drawRoundedRect(x, y, w, h, 4 * (1 - this.destroyValue));
            this.graphics.drawRect(x +2, y+2, w-2, h-2);
        this.graphics.endFill();
    }
}; // class Block


//----------------------------------------------------------------------------//
// Piece                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
const PIECE_ANCHOR       = 0.5;
const PIECE_BLOCKS_COUNT = 3;
const PIECE_ROTATE_COOLDOWN_DURATION = 0.5;

//------------------------------------------------------------------------------
class Piece
    extends PIXI.Container
{
    //--------------------------------------------------------------------------
    constructor(boardRef)
    {
        super();

        //
        // iVars
        // Refs.
        this.boardRef = boardRef;
        // Properties
        this.blocks = [];
        this._InitializeBlocks();

        this.rotateTimer = new BaseTimer(PIECE_ROTATE_COOLDOWN_DURATION);
        this.rotateTimer.Start();

        this.coord = Create_Point(0, 0);
    } // ctor

    //--------------------------------------------------------------------------
    Update(dt)
    {
        this.rotateTimer.Update(dt);

        this.coord.x = Math_Int(this.x                    / this.boardRef.blockSize.x);
        this.coord.y = Math_Int(this.GetBottomPositionY() / this.boardRef.blockSize.y);
    }

    //--------------------------------------------------------------------------
    Rotate()
    {
        // Not enough time between rotations.
        // if(!this.rotateTimer.isDone) {
        //     return;
        // }

        // @XXX(stdmatt): How js handles the assignments???
        let new_arr = []
        for(let i = 0; i < PIECE_BLOCKS_COUNT; ++i) {
            let ni = (i+1) % PIECE_BLOCKS_COUNT;
            new_arr.push(this.blocks[ni]);
        }

        this.blocks = new_arr;
        this._FixBlocksPositions();

        this.rotateTimer.Start();
    }

    //--------------------------------------------------------------------------
    SetBottomPositionY(y)
    {
        this.y = (y - this.height);
    } // GetBottomPositionY

    //--------------------------------------------------------------------------
    GetBottomPositionY()
    {
        return this.y + this.height;
    } // GetBottomPositionY

    //--------------------------------------------------------------------------
    _InitializeBlocks()
    {
        for(let i = 0; i < PIECE_BLOCKS_COUNT; ++i) {
            let block = Create_Random_Block(this.boardRef);
            this.addChild(block);
            this.blocks.push(block);
        }

        this._FixBlocksPositions();
    } // _InitializeBlocks

    //--------------------------------------------------------------------------
    _FixBlocksPositions()
    {
        for(let i = 0; i < PIECE_BLOCKS_COUNT; ++i) {
            let block = this.blocks[i];
            block.y = this.boardRef.blockSize.y * (PIECE_BLOCKS_COUNT - i -1);
        }
    }
}; // class Piece
