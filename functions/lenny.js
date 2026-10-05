// Random Lenny face generator, ported from the defunct api.lenny.today
// (https://github.com/LennyToday/RESTful-lenny, ISC license).
// Each part is [left, right], or [both] when the two sides are the same.

const ears = [
    ['( ͡°( ͡° ͜ʖ( ', ' )ʖ ͡°) ͡°)'],
    ['༼ ºل͟º ༼ ºل͟º ༼ ', ' ༽ ºل͟º ༽ ºل͟º ༽'],
    ['┬─┬ノ( ', 'ノ)'],
    ['̿̿ ̿̿ ̿̿ ̿\'̿\'\\͇̿̿\\= ( ', ' ) =ε/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿'],
    ['(ノ', ')ノ彡┻━┻'],
    ['q', 'p'],
    ['(ง', ')ง'],
    ['ʢ', 'ʡ'],
    ['⸮', '?'],
    ['ʕ', 'ʔ'],
    ['ᖗ', 'ᖘ'],
    ['ᕦ', 'ᕥ'],
    ['ᕦ(', ')ᕥ'],
    ['ᕙ(', ')ᕗ'],
    ['ᘳ', 'ᘰ'],
    ['ᕮ', 'ᕭ'],
    ['ᕳ', 'ᕲ'],
    ['(', ')'],
    ['[', ']'],
    ['¯\\_', '_/¯'],
    ['୧', '୨'],
    ['୨', '୧'],
    ['⤜(', ')⤏'],
    ['☞', '☞'],
    ['ᑫ', 'ᑷ'],
    ['ᑴ', 'ᑷ'],
    ['ヽ(', ')ﾉ'],
    ['\\(', ')/'],
    ['乁(', ')ㄏ'],
    ['└[', ']┘'],
    ['(づ', ')づ'],
    ['⎝', '⎠'],
    ['ლ(', 'ლ)'],
    ['ლ,ᔑ', 'ᔐ.ლ'],
    ['ᕕ(', ')ᕗ'],
    ['(∩', ')⊃━☆ﾟ.*'],
    ['|'],
];

const eyes = [
    ['⌐■', '■'],
    [' ͠°', ' °'],
    ['⇀', '↼'],
    ['´• ', ' •`'],
    ['´', '`'],
    ['`', '´'],
    ['ó', 'ò'],
    ['ò', 'ó'],
    ['⸌', '⸍'],
    ['>', '<'],
    ['Ƹ̵̡', 'Ʒ'],
    ['ᗒ', 'ᗕ'],
    ['⟃', '⟄'],
    ['⪧', '⪦'],
    ['⪦', '⪧'],
    ['⪩', '⪨'],
    ['⪨', '⪩'],
    ['⪰', '⪯'],
    ['⫑', '⫒'],
    ['⨴', '⨵'],
    ['⩿', '⪀'],
    ['⩾', '⩽'],
    ['⩺', '⩹'],
    ['⩹', '⩺'],
    ['◥▶', '◀◤'],
    ['◍', '◎'],
    ['/͠-', '┐͡-\\'],
    ['⌣', '⌣”'],
    [' ͡⎚', ' ͡⎚'],
    ['≋'],
    ['૦ઁ'],
    ['  ͯ'],
    ['  ͌'],
    ['ළ'],
    ['◉'],
    ['☉'],
    ['・'],
    ['▰'],
    ['ᵔ'],
    [' ﾟ'],
    ['□'],
    ['☼'],
    ['*'],
    ['`'],
    ['⚆'],
    ['⊜'],
    ['>'],
    ['❍'],
    ['￣'],
    ['─'],
    ['✿'],
    ['•'],
    ['T'],
    ['^'],
    ['ⱺ'],
    ['@'],
    ['ȍ'],
    ['x'],
    ['-'],
    ['$'],
    ['Ȍ'],
    ['ʘ'],
    ['Ꝋ'],
    ['⸟'],
    ['๏'],
    ['ⴲ'],
    ['◕'],
    ['◔'],
    ['✧'],
    ['■'],
    ['♥'],
    [' ͡°'],
    ['¬'],
    [' º '],
    ['⨶'],
    ['⨱'],
    ['⏓'],
    ['⏒'],
    ['⍜'],
    ['⍤'],
    ['ᚖ'],
    ['ᴗ'],
    ['ಠ'],
    ['σ'],
    ['☯'],
];

const mouths = [
    'v', 'ᴥ', 'ᗝ', 'Ѡ', 'ᗜ', 'Ꮂ', 'ᨓ', 'ᨎ', 'ヮ', '╭͜ʖ╮', ' ͟ل͜', ' ͜ʖ', ' ͟ʖ', ' ʖ̯',
    'ω', ' ³', ' ε ', '﹏', '□', 'ل͜', '‿', '╭╮', '‿‿', '▾', '‸', 'Д', '∀', '!', '人',
    '.', 'ロ', '_', '෴', 'ѽ', 'ഌ', '⏠', '⏏', '⍊', '⍘', 'ツ', '益', '╭∩╮', 'Ĺ̯', '◡',
    ' ͜つ', 'ﺪ͟͠',
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Builds a random face. Any part given in `options` (leftear, rightear, ears,
// lefteye, righteye, eyes, mouth) replaces the random one; `ears` and `eyes`
// override their left/right variants, as in the original API.
function randomLenny(options = {}) {
    const [randLeftEar, randRightEar = randLeftEar] = pick(ears);
    const [randLeftEye, randRightEye = randLeftEye] = pick(eyes);

    const leftEar = options.ears ?? options.leftear ?? randLeftEar;
    const rightEar = options.ears ?? options.rightear ?? randRightEar;
    const leftEye = options.eyes ?? options.lefteye ?? randLeftEye;
    const rightEye = options.eyes ?? options.righteye ?? randRightEye;
    const mouth = options.mouth ?? pick(mouths);

    return leftEar + leftEye + mouth + rightEye + rightEar;
}

module.exports = { randomLenny };
