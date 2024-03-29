//----------------------------------------------------------------------------//
//                       __      __                  __   __                  //
//               .-----.|  |_.--|  |.--------.---.-.|  |_|  |_                //
//               |__ --||   _|  _  ||        |  _  ||   _|   _|               //
//               |_____||____|_____||__|__|__|___._||____|____|               //
//                                                                            //
//  File      : HighScoreManager.js                                           //
//  Project   : columns                                                       //
//  Date      : Oct 16, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//    CHEESY AS HELL                                                          //
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// HighscoreManager                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
// const HIGHSCORE_MANAGER_ENDPOINT        = "http://localhost:3000/api";
const HIGHSCORE_MANAGER_ENDPOINT        = "https://koliery-server.vercel.app/api";
const HIGHSCORE_MANAGER_ENDPOINT_FETCH  = "/fetch";
const HIGHSCORE_MANAGER_ENDPOINT_INSERT = "/save";

const HIGHSCORE_MAX_DIGITS   = 5;
const HIGHSCORE_MAX_ENTRIES = 10;

const HIGHSCORE_MOCK_SCORE_MIN =  100;
const HIGHSCORE_MOCK_SCORE_MAX = 5000;

const HIGHSCORE_SCORE_POSITION_OUT_OF_RANK = -1;


//------------------------------------------------------------------------------
function
_Create_MockScores()
{
    data = [];
    const names = ["std", "ale", "sol", "don", "pin", "gmm"];
    // std: me,
    // ale: alex - wife
    // sol: solange  - mom,
    // don: donizete - dad
    // pin: pingo
    // gmm: guilherme marques mesquita - brother
    // edu: eduardo pimenta
    // Those are the ppl that I most love and that I miss badly!
    // It's being already 2 years that I don't see my mother,
    // I think in her all the day, every day.
    // Pingo as well, I wish that I could hug that motherfucker so
    // hard now... I really miss to play with him.
    //a
    // Sometimes is quite bad to be that far,  and now with this covid situation
    // i can't get there  no way... I hope that this don't last long.
    // But to be honest, I'm ok  compared with ppl that are rally bad...
    // I'm quite fortunate - stdmatt Aug 11, 2020.
    //--------------------------------------------------------------------------
    //
    // Today is March 15, 2024... covid went away, I'm with Pingo and Mom back
    // in Brasil and life has changed so much. New problems, new challenges,
    // so much has changed...
    //
    // Marla is almost two years now, but unfortunately family isn't together
    // anymore - I miss to stay all day with them, I feel so much for the
    // miss opportunity that we had... it was so great and we just threw away.
    //
    // I love my daughter - time doesn't come back, but we can try to make
    // things better in the future.
    for(let i = 1; i <= HIGHSCORE_MAX_ENTRIES; ++i) {
        const name  = names[pw_Random_Int(0, names.length)];
        const score = pw_Random_Int(HIGHSCORE_MOCK_SCORE_MIN, HIGHSCORE_MOCK_SCORE_MAX);
        data.push({
            name  : name,
            score : score
        });
    }

    data.sort((d1, d2)=>{
        return d2.score - d1.score;
    });

    return data;
}

//------------------------------------------------------------------------------
async function
_Fetch_Async(url)
{
    try {
        const response = await fetch(url);
        const result   = await response.json();
        return { data: result, fake: false };
    } catch (e) {
        dlog("Failed to get scores... Mocking it...");
        const result = _Create_MockScores();
        return { data: result, fake: true };
    }
}

//------------------------------------------------------------------------------
async function
_Insert_Async(url, options)
{
    fetch(url, options)
        .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
        .then(data => {
            console.log('Response from server:', data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

//------------------------------------------------------------------------------
class
HighscoreManager
{
    //--------------------------------------------------------------------------
    constructor()
    {
        this.scores       = null;
        this.highestScore = 0;
        this.currScore    = 0;

        this.is_initialized = false;
        this.is_faked       = false;
    } // ctor

    //--------------------------------------------------------------------------
    async FetchScores()
    {
        const url    = pw_String_Cat(HIGHSCORE_MANAGER_ENDPOINT, HIGHSCORE_MANAGER_ENDPOINT_FETCH);
        const result = await _Fetch_Async(url);

        this.scores       = this._SortedScores(result.data)
        this.is_faked     = result.is_faked;
        this.highestScore = this.scores[0].score;
    } // FetchScores

    //--------------------------------------------------------------------------
    _SortedScores(scores)
    {
        return scores.sort((s1, s2)=>{ return s2.score - s1.score });
    }

    //--------------------------------------------------------------------------
    FetchScoresWithCallback(callback)
    {
        const url = pw_String_Cat(
            HIGHSCORE_MANAGER_ENDPOINT,
            HIGHSCORE_MANAGER_ENDPOINT_FETCH
        );

        _Fetch_Async(url).then((result, error)=>{
            this.scores         = this._SortedScores(result.data);
            this.is_faked       = result.is_faked;
            this.is_initialized = true;
            this.highestScore   = this.scores[0].score;

            callback();
        });
    } // FetchScoresWithCallback

    //--------------------------------------------------------------------------
    async UploadScore(name)
    {
        if(this.GetCurrentScorePosition() == HIGHSCORE_SCORE_POSITION_OUT_OF_RANK) {
            return;
        }

        const url = pw_String_Cat(
            HIGHSCORE_MANAGER_ENDPOINT,
            HIGHSCORE_MANAGER_ENDPOINT_INSERT,
        );

        const jsonData = {
            name:  name,
            score: this.currScore
        };

        let options = {
            method: 'POST',
            body: JSON.stringify(jsonData)
        };

        await _Insert_Async(url, options);
        await this.FetchScores();
    } // UploadScore

    //--------------------------------------------------------------------------
    UpdateCurrentScoreValue(score)
    {
        this.currScore = score;
        if(this.currScore > this.highestScore) {
            this.highestScore = this.currScore;
        }

        return this.highestScore;
    } // UpdateCurrentScoreValue

    //--------------------------------------------------------------------------
    GetCurrentScorePosition()
    {
        for(let i = 0; i < this.scores.length; ++i) {
            const item = this.scores[i];
            if(this.currScore >= item.score) {
                return i;
            }
        }
        return HIGHSCORE_SCORE_POSITION_OUT_OF_RANK;
    }

    //--------------------------------------------------------------------------
    GetHighScoreValue()
    {
        return this.highestScore;
    } // GetHighScoreValue

    GetCurrentScoreValue()
    {
        return this.currScore;
    }

    //--------------------------------------------------------------------------
    GetScores()
    {
        return this.scores;
    } // GetScores

} // class HighscoreManager

//------------------------------------------------------------------------------
const HIGHSCORE_MANAGER = new HighscoreManager();
