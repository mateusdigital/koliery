//----------------------------------------------------------------------------//
//                       __      __                  __   __                  //
//               .-----.|  |_.--|  |.--------.---.-.|  |_|  |_                //
//               |__ --||   _|  _  ||        |  _  ||   _|   _|               //
//               |_____||____|_____||__|__|__|___._||____|____|               //
//                                                                            //
//  File      : main.js                                                       //
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
// Constants                                                                  //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
const GAME_DESIGN_WIDTH  = 500;
const GAME_DESIGN_HEIGHT = 700;

//----------------------------------------------------------------------------//
// Globals                                                                    //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
let gPalette     = null;
let gStarfield   = null;
// let gBoard       = null;
// let gBoardBorder = null;
// let gGameHud     = null;


// let editorMode    = false;
// let MousePosition = null;
// let editorBlock   = null;

let game = null;

//------------------------------------------------------------------------------
function PreInit()
{
    Application_Create(GAME_DESIGN_WIDTH, GAME_DESIGN_HEIGHT);
}


//------------------------------------------------------------------------------
async function Preload()
{
    await Font_Load(
        "Commodore 64 Rounded",
        "./res/fonts/Commodore64Rounded.woff"
    );
    await Font_Load(
        "PixelForce",
        "./res/fonts/PixelForce.ttf"
    );

    Texture_SetBasePath("res/textures/");
    PIXI_LOADER.add([
        "res/textures/mask_0.png",
        "res/textures/mask_1.png",
        "res/textures/mask_2.png",
        "res/textures/mask_3.png",

        "src/FX/Shaders/Debug.frag",
        "src/FX/Shaders/TextUncover.frag",
        "src/FX/Shaders/TextGradient.frag",
        "src/FX/Shaders/BoardBorder.frag",
    ]).load(Setup);
}


//------------------------------------------------------------------------------
function Setup()
{
    // Install the Input Handlers.
    Install_MouseHandlers   ();
    Install_KeyboardHandlers();
    g_App.stage.interactive = true;
    g_App.stage.buttonMode  = true;


    // //
    gPalette = new Palette();
    const screen_size = Get_Screen_Size();

    // Star field
    gStarfield = new Starfield(new PIXI.Rectangle(
        0, 0, screen_size.x, screen_size.y
    ));

    g_App.stage.addChild(gStarfield);
    game = new Base_Game();
    // game.PushScene(new SceneHighScore());
    // game.PushScene(new SceneSplash());

    game.PushScene(new SceneMenu());
    // game.PushScene(new SceneGame(0));
    Application_Start(GameLoop);
}


//------------------------------------------------------------------------------
function GameLoop(delta)
{
    gStarfield.Update(delta);

    // if(!editorMode) {
    //     gBoard    .Update(delta);

    // } else {
    //     Update_Editor(delta);
    // }


    // if(IsKeyPress(KEY_E)) {
    //     if(editorMode) {
    //         ExitEditor();
    //     } else {
    //         EnterEditor();
    //     }
    // }
    // // gLevel.update(delta);

    game.Update(delta);
}

function EnterEditor()
{
    editorMode = true;
}

function ExitEditor()
{
    editorMode = false;
}

function Update_Editor(dt)
{
    let new_block = null;
    if(IsKeyPress(KEY_1)) {
        new_block = Create_Random_Block(gBoard, 0);
    } else if(IsKeyPress(KEY_2)) {
        new_block = Create_Random_Block(gBoard, 1);
    } else if(IsKeyPress(KEY_3)) {
        new_block = Create_Random_Block(gBoard, 2);
    } else if(IsKeyPress(KEY_4)) {
        new_block = Create_Random_Block(gBoard, 3);
    } else if(IsKeyPress(KEY_5)) {
        new_block = Create_Random_Block(gBoard, 4);
    } else if(IsKeyPress(KEY_6)) {
        new_block = Create_Random_Block(gBoard, 5);
    } else if(IsKeyPress(KEY_6)) {
        new_block = Create_Random_Block(gBoard, 6);
    }

    if(new_block != null) {
        if(editorBlock != null) {
            editorBlock.parent.removeChild(editorBlock);
        }
        editorBlock = new_block;
        gBoard.addChild(editorBlock);
    }

    if(editorBlock != null) {
        console.log("Editor");
        editorBlock.x = Math_Int(MousePosition.x / gBoard.blockSize.x) *gBoard.blockSize.x ;
        editorBlock.y = Math_Int(MousePosition.y / gBoard.blockSize.y) *gBoard.blockSize.y ;
    }
}


//----------------------------------------------------------------------------//
// Input Handlers                                                             //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function MouseMove(e)
{
    console.log(e.getLocalPosition(g_App.stage));
    // MousePosition = e.data.getLocalPosition(gBoard);
}

//------------------------------------------------------------------------------
function MouseClick(e)
{
    // if(editorMode && editorBlock != null) {
    //     editorBlock.x = Math_Int(MousePosition.x / gBoard.blockSize.x) *gBoard.blockSize.x ;
    //     editorBlock.y = Math_Int(MousePosition.y / gBoard.blockSize.y) *gBoard.blockSize.y ;
    //     gBoard._SetBlockAt(
    //         editorBlock,
    //         Math_Int(MousePosition.x / gBoard.blockSize.x),
    //         Math_Int(MousePosition.y / gBoard.blockSize.y)
    //     );

    //     editorBlock = null;
    // }
}

//------------------------------------------------------------------------------
function KeyboardDown(e)
{
}

//------------------------------------------------------------------------------
function KeyboardUp(e)
{
}

//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
PreInit();
Preload();
