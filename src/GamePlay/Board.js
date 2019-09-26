//----------------------------------------------------------------------------//
//                       __      __                  __   __                  //
//               .-----.|  |_.--|  |.--------.---.-.|  |_|  |_                //
//               |__ --||   _|  _  ||        |  _  ||   _|   _|               //
//               |_____||____|_____||__|__|__|___._||____|____|               //
//                                                                            //
//  File      : Board.js                                                      //
//  Project   : columns                                                       //
//  Date      : Sep 25, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//----------------------------------------------------------------------------//


//----------------------------------------------------------------------------//
// Board                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
const BOARD_FIELD_COLUMNS = 8;
const BOARD_FIELD_ROWS    = 22;
const BLOCK_SIZE = 32
// Tweens
const BOARD_DESTROY_PIECES_TWEEN_TIME_MS = 500;
const BOARD_FALL_PIECES_TWEEN_TIME_MS    = 500;
// States : Playing
const BOARD_STATE_PLAYING = "BOARD_STATE_PLAYING";
// States : Generating Piece
const BOARD_STATE_GENERATING_PIECE          = "BOARD_STATE_GENERATING_PIECE";
const BOARD_STATE_GENERATING_PIECE_FINISHED = "BOARD_STATE_GENERATING_PIECE_FINISHED";
// States : Destroying Blocks.
const BOARD_STATE_DESTROYING_PIECES          = "BOARD_STATE_DESTROYING_PIECES";
const BOARD_STATE_DESTROYING_PIECES_FINISHED = "BOARD_STATE_DESTROYING_PIECES_FINISHED";
// States : Falling Blocks.
const BOARD_STATE_FALLING_PIECES          = "BOARD_STATE_FALLING_PIECES";
const BOARD_STATE_FALLING_PIECES_FINISHED = "BOARD_STATE_FALLING_PIECES_FINISHED";

//------------------------------------------------------------------------------
class Board
    extends PIXI.Container
{
    //--------------------------------------------------------------------------
    constructor(board)
    {
        super();

        const screen_size = Get_Screen_Size();
        var bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.tint = 0xff0000;
        bg.alpha = 0.2;
        bg.x = 0;
        bg.y = 0;
        bg.width  = BLOCK_SIZE * BOARD_FIELD_COLUMNS;
        bg.height = BLOCK_SIZE * BOARD_FIELD_ROWS;
        this.addChild(bg);

        //
        // iVars
        // State
        this.prevState = null;
        this.currState = BOARD_STATE_PLAYING;

        // Field.
        this.field     = Array_Create2D(BOARD_FIELD_ROWS, BOARD_FIELD_COLUMNS);
        this.blockSize = Create_Point(BLOCK_SIZE, BLOCK_SIZE);

        // Infos.
        this.matchInfo = new MatchInfo(this);
        this.fallInfo  = new FallInfo (this);

        // Piece.
        this.currPiece = null;
        this.nextPiece = null;
        this._GeneratePiece();
        this.pieceSpeed = 100;

        // Tweens.
        this.destroyTweenGroup = new TWEEN.Group();
        this.fallTweenGroup    = new TWEEN.Group();

        // this._PlacePiece(this.currPiece, 0, 22);

        // this._GeneratePiece();
        // this.currPiece.Rotate();
        // this._PlacePiece(this.currPiece, 1, 22);

        // this._GeneratePiece();
        // this.currPiece.Rotate();
        // this._PlacePiece(this.currPiece, 2, 22);

        // let coord = Create_Point(2, 21);
        // this.matchInfo.FindMatches(coord);

        // if(this.matchInfo.hasMatches) {
        //     this._ChangeState(BOARD_STATE_DESTROYING_PIECES);
        //     this._DestroyBlocks();
        // }





        // Drawing.
        // this.width  = (BOARD_FIELD_COLUMNS * this.blockSize.x);
        // this.height = (BOARD_FIELD_ROWS    * this.blockSize.y)
    } // ctor


    //--------------------------------------------------------------------------
    Update(dt)
    {
        if(IsKeyDown(KEY_ENTER)) {
            this.pieceSpeed = 900;
        } else {
            this.pieceSpeed = 100;
        }

        // if(IsKeyPress(KEY_SPACE)) {
        //     this._CreateDestroyBlockAnimation(this.currPiece.blocks[0]);
        // }
        // this.pieceSpeed = 0;

        this.destroyTweenGroup.update();
        this.fallTweenGroup   .update();

        // State : Playing
        if(this.currState == BOARD_STATE_PLAYING) {
            this._UpdateState_Playing(dt);
        }
        // State : Generating Piece
        else if(this.currState == BOARD_STATE_GENERATING_PIECE_FINISHED) {
            this._ChangeState(BOARD_STATE_PLAYING);
        }
        // State : Destroying Pieces
        else if(this.currState == BOARD_STATE_DESTROYING_PIECES_FINISHED) {
            this.fallInfo.FindAllBlocksToFall(this.matchInfo.allMatchedBlocks);
            if(this.fallInfo.hasBlocksToFall) {
                this._ChangeState(BOARD_STATE_FALLING_PIECES);
                this._FallBlocks();
            } else {
                this._ChangeState(BOARD_STATE_GENERATING_PIECE);
                this._GeneratePiece();
            }
        }
        // State : Falling Pieces
        else if(this.currState == BOARD_STATE_FALLING_PIECES_FINISHED) {
            this._ChangeState(BOARD_STATE_GENERATING_PIECE);
            this._GeneratePiece();
        }
    } // Update

    //--------------------------------------------------------------------------
    _UpdateState_Playing(dt)
    {
        this.currPiece.Update(dt);
        if(IsKeyPress(KEY_SPACE)) {
            this.currPiece.Rotate();
        }

        let dir_x = 0;
        if(IsKeyPress(KEY_ARROW_LEFT)) {
            dir_x = -1;
        } else if(IsKeyPress(KEY_ARROW_RIGHT)) {
            dir_x = +1;
        }

        const curr_coord = this.currPiece.coord;
        let   new_coord  = Copy_Point(curr_coord);

        //
        // Try to move horizontally.
        //   Horizontal movement is block based - So we just check if there's
        //   room to move and set the new coord to that position.
        if(dir_x != 0                                 &&
           this.IsCoordXValid (curr_coord.x + dir_x)  &&
           this.IsBoardEmptyAt(curr_coord.x + dir_x, curr_coord.y))
        {
            new_coord.x = (curr_coord.x + dir_x)
        }

        //
        // Try to move vertically.
        //   Vertical movement is "pixel" based - So we need to move the piece
        //   by that amount of pixels and check if the resulting coord is valid.
        let new_position_y = this.currPiece.GetBottomPositionY() + (this.pieceSpeed * dt);
        new_coord.y = Math_Int(new_position_y / this.blockSize.y);

        if(new_coord.y >= BOARD_FIELD_ROWS ||
           !this.IsBoardEmptyAt(new_coord.x, new_coord.y) )
        {
            this._PlacePiece(this.currPiece, new_coord.x, new_coord.y);

            new_coord.y -= 1;
            this.matchInfo.FindMatches(new_coord);

            if(this.matchInfo.hasMatches) {
                this._ChangeState(BOARD_STATE_DESTROYING_PIECES);
                this._DestroyBlocks();
            } else if(this._CheckGameOver()) {
                this._ChangeState(BOARD_STATE_GAME_OVER);
                // @todo(stdmatt): ????
            } else {
                this._ChangeState(BOARD_STATE_GENERATING_PIECE);
                this._GeneratePiece();
            }
        } else {
            this.currPiece.x = (new_coord.x * this.blockSize.x);
            this.currPiece.SetBottomPositionY(new_position_y);
        }
    } // _UpdateState_Playing


    //--------------------------------------------------------------------------
    IsBoardEmptyAt(indexX, indexY)
    {
        return this.GetBlockAt(indexX, indexY) == null;
    } // IsBoardEmptyAt

    //--------------------------------------------------------------------------
    IsCoordXValid(indexX)
    {
        return indexX >= 0 && indexX < BOARD_FIELD_COLUMNS;
    } // IsCoordXValid

    //--------------------------------------------------------------------------
    IsCoordYValid(indexY)
    {
        return indexY >= 0 && indexY < BOARD_FIELD_ROWS;
    } // IsCoordYValid

    //--------------------------------------------------------------------------
    IsCoordValid(indexX, indexY)
    {
        return this.IsCoordXValid(indexX) && this.IsCoordYValid(indexY);
    } // IsValidCoord


    //--------------------------------------------------------------------------
    _GeneratePiece()
    {
        let piece = new Piece(this);
        this.addChild(piece);

        const x = (BOARD_FIELD_COLUMNS / 2) * this.blockSize.x;
        const y = (3) * this.blockSize.x;

        piece.x = x
        piece.SetBottomPositionY(y)

        this.currPiece = piece;
        this._ChangeState(BOARD_STATE_GENERATING_PIECE_FINISHED);
    } // _GeneratePiece

    //--------------------------------------------------------------------------
    _PlacePiece(piece, indexX, indexY)
    {
        for(let i = 0; i < PIECE_BLOCKS_COUNT; ++i) {
            let block = piece.blocks[i];
            this._SetBlockAt(block, indexX, (indexY - i -1));
        }
        this.currPiece = null;
    } // _PlacePiece

    //--------------------------------------------------------------------------
    _DestroyBlocks()
    {
        if(!this.matchInfo.hasMatches) {
            this._ChangeState(BOARD_STATE_DESTROYING_PIECES_FINISHED);
            return;
        }

        for(let i = 0; i < this.matchInfo.allMatchedBlocks.length; ++i) {
            let block = this.matchInfo.allMatchedBlocks[i];
            this._CreateDestroyBlockAnimation(block);
        }

        this.destroyTweenGroup.onComplete(()=>{
            this._ChangeState(BOARD_STATE_DESTROYING_PIECES_FINISHED);
        });
    } // _DestroyBlocks

    //--------------------------------------------------------------------------
    _FallBlocks()
    {
        if(!this.fallInfo.allFallingBlocks) {
            this._ChangeState(BOARD_STATE_FALLING_PIECES_FINISHED);
            return;
        }

        for(let i = 0; i < this.fallInfo.allFallingBlocks.length; ++i) {
            let block = this.fallInfo.allFallingBlocks[i];
            let coord = this.fallInfo.allTargetCoords [i];

            this._CreateFallBlockAnimation(block, coord);
        }

        this.fallTweenGroup.onComplete(()=>{
            this._ChangeState(BOARD_STATE_FALLING_PIECES_FINISHED);
        });
    } // _FallBlocks


    //--------------------------------------------------------------------------
    GetBlockAt(indexX, indexY)
    {
        if(!this.IsCoordValid(indexX, indexY)) {
            return null;
        }
        return this.field[indexY][indexX];
    } // GetBlockAt

    //--------------------------------------------------------------------------
    _RemoveBlockAt(indexX, indexY)
    {
        let block = this.field[indexY][indexX];
        if(block != null && block.parent != null) {
            block.parent.removeChild(block);
        }

        this.field[indexY][indexX] = null;

        this.ascii();
    } // _RemoveBlockAt

    //--------------------------------------------------------------------------
    _SetBlockAt(block, indexX, indexY)
    {
        if(block.parent != null) {
            block.parent.removeChild(block);
        }
        this.addChild(block);

        block.x = (this.blockSize.x * indexX);
        block.y = (this.blockSize.y * indexY);

        block.coordInBoard = Create_Point(indexX, indexY);
        this.field[indexY][indexX] = block;

        this.ascii();
    } // _SetBlockAt


    //--------------------------------------------------------------------------
    _CheckGameOver()
    {
        return false;
    }

    //--------------------------------------------------------------------------
    _ChangeState(newState)
    {
        // debugger;
        this.prevState = this.currState;
        this.currState = newState;
    } // _ChangeState


    //--------------------------------------------------------------------------
    _CreateDestroyBlockAnimation(block)
    {
        let curr = {value: 0};
        let end  = {value: 1};

        block.StartDestroyAnimation();
        let tween = new TWEEN.Tween(curr, this.destroyTweenGroup)
            .to(end, BOARD_DESTROY_PIECES_TWEEN_TIME_MS)
            .onUpdate(()=>{
                block.SetDestroyAnimationValue(curr.value);
            })
            .onComplete(()=>{
                // @XXX(stdmatt): Destroy piece....
                this._RemoveBlockAt(block.coordInBoard.x, block.coordInBoard.y);
            })
            .start();
    } // _CreateDestroyBlockAnimation

    //--------------------------------------------------------------------------
    _CreateFallBlockAnimation(block, targetCoord)
    {
        let position = Copy_Point(block.position);
        let target   = Create_Point(position.x, targetCoord.y * this.blockSize.y);

        let tween = new TWEEN.Tween(position, this.fallTweenGroup)
            .to(target, BOARD_FALL_PIECES_TWEEN_TIME_MS)
            .onUpdate(()=>{
                block.x = position.x;
                block.y = position.y;
            })
            .onComplete(()=>{
               this._RemoveBlockAt(block.coordInBoard.x, block.coordInBoard.y);
               this._SetBlockAt(block, targetCoord.x, targetCoord.y);
            })
            .start();
    } // _CreateFallBlockAnimation


    //--------------------------------------------------------------------------
    ascii()
    {
        let s = "";
        for(let i = 0; i < BOARD_FIELD_ROWS; ++i) {
            if(i < 10) {
                s += " ";
            }

            s += String_Cat(" (", i, ") ");
            for(let j = 0; j < BOARD_FIELD_COLUMNS; ++j) {
                let p = this.GetBlockAt(j, i);
                if(p == null) {
                    s += ". ";
                } else {
                    // let v = p.objectId;
                    let v = p.colorIndex;
                    s += v;
                    if(v < 10) s += " ";
                }
                s += " ";
            }
            s += String_Cat(" (", i, ")\n")
        }
        console.log(s);
    }
}; // class Board
