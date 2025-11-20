const pokeNoArr = [152, 153, 154,498,499,500,158,159,160,661,662,663,659,660,664,665,666,13,14,15,16,17,18,179,180,181,504,505,406,315,407,129,130,688,689,120,121,669,670,671,672,673,677,678,667,668,674,675,568,569,702,172,25,26,173,35,36,167,168,23,24,63,64,65,92,93,94,543,544,545,679,680,681,69,70,71,511,512,513,514,515,516,307,308,309,310,280,281,282,475,228,229,333,334,531,682,683,684,685,133,134,135,136,196,197,470,471,700,427,428,353,354,582,583,584,322,323,449,450,529,530,551,552,553,66,67,68,443,444,445,703,302,303,359,447,448,79,80,199,318,319,602,603,604,147,148,149,1,2,3,4,5,6,7,8,9,618,676,686,687,690,691,692,693,704,705,706,225,361,362,478,459,460,712,713,123,212,127,214,587,701,708,709,559,560,714,715,707,607,608,609,142,696,697,698,699,95,208,304,305,306,694,695,710,711,246,247,248,656,657,658,870,650,651,652,227,653,654,655,371,372,373,115,780,374,375,376,716,717,718,719];
const pokemonContainer = document.getElementById('pokemon-container');
const dynamicText = document.getElementById('dynamic-text');


function countShinyPokemon(){
    let count = 0;
    for(let i=0;i<localStorage.length;i++){
        const key = localStorage.key(i);
        if (key.startsWith('pokemon_')){
            count++;
        }
    }

    return count;
}

function updateShinyCount(){
// 色違いの所持数を表示
count = countShinyPokemon();
dynamicText.textContent = `${count}/` + pokeNoArr.length;
}
// ポケモンの日本語名を取得する関数
async function getPokemonName(data) {
    const pokemonName = data.names.find((val) => val.language.name === "ja");
    return pokemonName ? pokemonName.name : '名前不明';
}

// ポケモンの日本語タイプを取得する関数
async function getPokemonType(data) {
    let types = [];
    for (let i = 0; i < data.length; i++) {
        const getTypes = await getAPI(data[i].type.url);
        const getType = getTypes.names.find((val) => val.language.name === "ja");
        if (getType) {
            types.push(getType.name);
        }
    }
    return types.join(', ');
}

// APIからデータを取得する共通関数
async function getAPI(url) {
    const data = await fetch(url).then((res) => res.json());
    return data;
}

// ランダムな色を生成する関数
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function gotoTop(){
    //ボタンを押すと先頭に戻る
    window.scrollTo({top:0,behavior:"smooth"});
}



// ポケモンカードを生成してページに追加する関数
async function createPokemonCard(pokeNo) {
    try {
        const pokeAPI = `https://pokeapi.co/api/v2/pokemon/${pokeNo}`;
        const dataAPI = await getAPI(pokeAPI);
        if (!dataAPI) return null;

        const nameData = await getAPI(dataAPI.species.url);
        const name = await getPokemonName(nameData);
        const type = await getPokemonType(dataAPI.types);
        const imageUrl = dataAPI.sprites.front_default;
        const imageUrlShiny = dataAPI.sprites.front_shiny; // シャイニー画像URLを取得

        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.style.border = '1px solid #ccc'; // 初期状態のborderを設定

        const pokeNoElement = document.createElement('p');
        pokeNoElement.className = 'poke-no';
        pokeNoElement.textContent = `No.${pokeNoArr.indexOf(pokeNo)+1}`;

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = name;
        imgElement.loading = 'lazy';
        imgElement.dataset.isShiny = 'false'; // カスタムデータ属性を追加

        const nameElement = document.createElement('p');
        nameElement.className = 'poke-name';
        nameElement.textContent = name;

        const typeElement = document.createElement('p');
        typeElement.className = 'poke-type';
        typeElement.textContent = type;

        card.appendChild(pokeNoElement);
        card.appendChild(imgElement);
        card.appendChild(nameElement);
        card.appendChild(typeElement);

        // localStorageから状態を読み込んで適用
        const shinyState = localStorage.getItem(`pokemon_${pokeNo}`);
        if (shinyState === 'shiny') {
            imgElement.src = imageUrlShiny;
            imgElement.dataset.isShiny = 'true';
            card.style.borderColor = getRandomColor(); // ランダムな色を適用
            card.style.borderStyle = 'double'; // 二重線にする
            card.style.borderWidth = '3px'; // 太さを変更
            card.classList.add('is-shiny-card');
        }

        // カード全体にイベントリスナーを追加
        card.addEventListener('click', () => {
            if (imgElement.dataset.isShiny === 'false') {
                imgElement.src = imageUrlShiny;
                imgElement.dataset.isShiny = 'true';
                card.style.borderColor = getRandomColor(); // ランダムな色を適用
                card.style.borderStyle = 'double'; // 二重線にする
                card.style.borderWidth = '3px'; // 太さを変更
                card.classList.add('is-shiny-card');
                localStorage.setItem(`pokemon_${pokeNo}`, 'shiny'); // localStorageに保存
                updateShinyCount();
            } else {
                imgElement.src = imageUrl;
                imgElement.dataset.isShiny = 'false';
                card.style.borderColor = '#ccc'; // 元の色に戻す
                card.style.borderStyle = 'solid'; // 実線に戻す
                card.style.borderWidth = '1px'; // 太さを元に戻す
                card.classList.remove('is-shiny-card');
                localStorage.removeItem(`pokemon_${pokeNo}`); // localStorageから削除
                updateShinyCount();
            }
            console.log(`Clicked Pokemon No.${pokeNo}, Image switched to ${imgElement.dataset.isShiny === 'true' ? 'Shiny' : 'Normal'}`);
        });

        return card;
    } catch (error) {
        console.error(`Failed to create card for Pokemon No.${pokeNo}:`, error);
        return null;
    }
}

function searchPokemon(pokename){
    //入力文字列に(部分)一致するカードだけ表示
    const cards = document.querySelectorAll('.pokemon-card');
    const searchTerm = pokename.replace( /[\u3042-\u3093]/g, 
        m => String.fromCharCode(m.charCodeAt(0) + 96)
    );

    cards.forEach(card => {
        const nameElement = card.querySelector('.poke-name');
        const pokemonName = nameElement ? nameElement.textContent : ''; // Get name as is
        
        // Check if the search term is present in the Pokémon name
        if (pokemonName.includes(searchTerm)) {
            card.classList.remove('is-hidden-by-search'); // Show the card
        } else {
            card.classList.add('is-hidden-by-search'); // Hide the card
        }
    });
}

function clearSearch() {
    // Clear the search filter
    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach(card => {
        card.classList.remove('is-hidden-by-search');
    });
    // Clear the search box value
    document.getElementById('search-box').value = '';
}

// メイン処理
async function main() {

    updateShinyCount();

    // 1. 最初にすべてのカードを生成して表示
    pokemonContainer.innerHTML = ''; // 表示をクリア
    const cardPromises = pokeNoArr.map(pokeNo => createPokemonCard(pokeNo));
    const cards = await Promise.all(cardPromises);
    cards.forEach(card => {
        if (card) pokemonContainer.appendChild(card);
    });

    //検索ボックスのイベントリスナーを設定
    const text_form = document.getElementById('search-box');
    text_form.addEventListener('keydown',(e) => {
        if(e.key === "Enter"){
            searchPokemon(text_form.value);
        }
    });

    // リセットボタンのイベントリスナーを設定
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', () => {
        clearSearch();
    });

    // 2. ボタンのイベントリスナーを設定
    const displayToggleButton = document.getElementById('btn1');
    
    displayToggleButton.addEventListener('click', () => {
        // pokemon-containerのクラスをトグルしてCSSで表示を制御
        pokemonContainer.classList.toggle('show-not-acquired-only');

        // ボタンのテキストを切り替え
        if (pokemonContainer.classList.contains('show-not-acquired-only')) {
            displayToggleButton.textContent = "すべて表示";
        } else {
            displayToggleButton.textContent = "未獲得のみ表示";
        }

        
    });
}

main();
