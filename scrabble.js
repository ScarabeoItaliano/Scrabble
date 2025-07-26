// Esempio struttura delle lettere (puoi modificarla come vuoi)
const LETTERE = {
    A: { quantità: 14, punteggio: 1 },
    B: { quantità: 3, punteggio: 5 },
    C: { quantità: 6, punteggio: 2 },
    D: { quantità: 3, punteggio: 5 },
    E: { quantità: 11, punteggio: 1 },
    F: { quantità: 3, punteggio: 5 },
    G: { quantità: 2, punteggio: 8 },
    H: { quantità: 1, punteggio: 8 },
    I: { quantità: 12, punteggio: 1 },
    L: { quantità: 5, punteggio: 3 },
    M: { quantità: 5, punteggio: 3 },
    N: { quantità: 5, punteggio: 3 },
    O: { quantità: 15, punteggio: 1 },
    P: { quantità: 3, punteggio: 5 },
    Q: { quantità: 1, punteggio: 9 },
    R: { quantità: 6, punteggio: 2 },
    S: { quantità: 6, punteggio: 2 },
    T: { quantità: 6, punteggio: 2 },
    U: { quantità: 5, punteggio: 3 },
    V: { quantità: 3, punteggio: 5 },
    Z: { quantità: 2, punteggio: 8 },
};

let sacchetto = [];
let tessereDisponibili = [];
let parolaCostruita = new Array(10).fill(null);
let punteggioTotale = 0;
let punteggioRound = 0;
let turniRimasti = 7;
let turniUsatiQuestoRound = 0;
let roundPassati = 0;
const obiettivoIniziale = 1;
let obiettivo = obiettivoIniziale;
let lettereUsateQuestoLivello = 0;
let scarti = [];
let parolePerRound = []; // array di array, ogni elemento contiene parole+punti per un round
let parolaPunteggioMassimo = { parola: "", punteggio: 0 };
let rimescolaUsato = 0;
const rimescolaMax = 3;
let sogliaProssimoTurnoBonus = 5000;
let turniPerRound = 7; // Numero di turni per round



function aggiornaInfoGioco() {
    document.getElementById("score-display").textContent = `Punteggio: ${punteggioTotale}`;
    document.getElementById("goal-display").textContent = `Punteggio da raggiungere: ${punteggioRound} / ${obiettivo}`;
    document.getElementById("turns-display").textContent = `Turni: ${turniRimasti}`;

    const progressPercent = Math.min(100, (punteggioRound / obiettivo) * 100);
    document.getElementById("progress-bar").style.width = `${progressPercent}%`;
}

function reintegraScarti() {
    if (sacchetto.length < 40 && scarti.length > 0) {
        sacchetto.push(...scarti);
        scarti = [];
        console.log("♻️ Scarti reintegrati nel sacchetto.");
    }
}

function generaSacchetto() {
    sacchetto = [];
    for (const lettera in LETTERE) {
        for (let i = 0; i < LETTERE[lettera].quantità; i++) {
            sacchetto.push(lettera);
        }
    }
}

const bonusLettera = {
    3: "+2",
    5: "*3",
    7: "+5",
    9: "x2"
};

function mostraSlot() {
    const container = document.getElementById("word-slots");
    container.innerHTML = "";

    for (let i = 0; i < 10; i++) {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.dataset.index = i;

        const bonusSpan = document.createElement("span");
        bonusSpan.className = "bonus";
        bonusSpan.textContent = bonusLettera[i] || "";

        slot.appendChild(bonusSpan);
        container.appendChild(slot);
    }
}


function contaDistribuzione(tessere) {
    const vocali = ["A", "E", "I", "O", "U"];
    let contaVocali = 0;
    let contaConsonanti = 0;

    tessere.forEach(tessera => {
        const lettera = typeof tessera === "string" ? tessera : tessera.lettera;
        if (!lettera) return;

        if (vocali.includes(lettera)) {
            contaVocali++;
        } else {
            contaConsonanti++;
        }
    });

    return { vocali: contaVocali, consonanti: contaConsonanti };
}


function pescaTessere(isAutomatic = false) {
    if (!isAutomatic) reintegraScarti();

    tessereDisponibili = [];

    for (let i = 0; i < 16 && sacchetto.length > 0; i++) {
        const index = Math.floor(Math.random() * sacchetto.length);
        const lettera = sacchetto.splice(index, 1)[0];
        tessereDisponibili.push(lettera);
    }

    console.log("🎲 Nuove tessere pescate:", tessereDisponibili.map(t => typeof t === "string" ? t : t.lettera).join(", "));
}


function pescaSoloVuotiConControllo() {
    const nuoveTessere = [...tessereDisponibili]; // copia per simulazione

    parolaCostruita.forEach(item => {
        if (item && sacchetto.length > 0) {
            const nuovaIndex = Math.floor(Math.random() * sacchetto.length);
            nuoveTessere[item.indiceTessera] = sacchetto[nuovaIndex];
        }
    });

    const { vocali, consonanti } = contaDistribuzione(nuoveTessere);
    console.log("Tentativo unico:", nuoveTessere.map(t => typeof t === "string" ? t : t.lettera).join(", "));
    console.log(`→ Vocali: ${vocali}, Consonanti: ${consonanti}`);

    if (vocali > 1 && consonanti > 1) {
        console.log("✅ Set valido trovato. Applico le modifiche.");
        // Applica davvero le nuove tessere
        parolaCostruita.forEach(item => {
            if (item && sacchetto.length > 0) {
                const nuovaIndex = Math.floor(Math.random() * sacchetto.length);
                tessereDisponibili[item.indiceTessera] = sacchetto.splice(nuovaIndex, 1)[0];
            }
        });
    } else {
        console.warn("❌ Set non valido. Attivazione rimescolo automatico.");
        alert(`⚠️ Combinazione sfortunata: solo ${vocali} vocale/i e ${consonanti} consonante/i. Le tessere verranno rimescolate.`);
        rimescolaTessereAutomatico();
    }
}


function mostraTessere() {
    const griglia = document.getElementById("tiles-grid");
    griglia.innerHTML = "";

    tessereDisponibili.forEach((tessera, index) => {
        const div = document.createElement("div");
        div.className = "tile";

        // Se tessera è un oggetto con bonus
        if (typeof tessera === 'object' && tessera !== null) {
            div.textContent = tessera.lettera;

            // Imposta dati punti (valore attuale della tessera)
            div.dataset.punti = tessera.valore;

            // Applica classi bonus se presenti
            if (tessera.tipoBonus === 'additivo') {
                div.classList.add("bonus-additivo");
                div.dataset.punti = tessera.valore; // es. 7
            } else if (tessera.tipoBonus === 'moltiplicatore') {
                div.classList.add("bonus-moltiplicatore");
                div.dataset.punti = `x${tessera.moltiplicatore}`;
            }

            // Event listener per inserire la lettera
            const giàUsata = parolaCostruita.some(p => p?.indiceTessera === index);
            if (!giàUsata) {
                div.addEventListener("click", () => inserisciLettera(tessera.lettera, index, div));
            } else {
                div.classList.add("usata");
            }

        } else {
            // Se tessera è solo la lettera (stringa), caso precedente
            div.textContent = tessera;
            div.dataset.punti = LETTERE[tessera]?.punteggio || 0;

            const giàUsata = parolaCostruita.some(p => p?.indiceTessera === index);
            if (!giàUsata) {
                div.addEventListener("click", () => inserisciLettera(tessera, index, div));
            } else {
                div.classList.add("usata");
            }
        }

        griglia.appendChild(div);
    });
}

function inserisciLettera(lettera, indiceTessera, elementoDiv) {
    if (parolaCostruita.some(p => p?.indiceTessera === indiceTessera)) return;

    const indexSlot = parolaCostruita.findIndex(el => el === null);
    if (indexSlot !== -1) {
        parolaCostruita[indexSlot] = { lettera, indiceTessera };
        const slot = document.querySelector(`.slot[data-index='${indexSlot}']`);
        slot.textContent = lettera;
        elementoDiv.classList.add("usata");
    }
}

function getParolaDaSlot() {
    return parolaCostruita.map(obj => obj ? obj.lettera : "").join("");
}

function calcolaPunteggio() {
    let sommaLettere = 0;
    let lettereUsate = 0;
    let sommaMoltiplicatori = 1;

    parolaCostruita.forEach((elem, i) => {
        if (!elem) return;

        lettereUsate++;

        const { lettera, indiceTessera } = elem;
        let punti = 0;
        const tessera = tessereDisponibili[indiceTessera];

        if (typeof tessera === 'object' && tessera !== null) {
            punti = LETTERE[lettera]?.punteggio || 0;

            if (tessera.tipoBonus === 'moltiplicatore') {
                sommaMoltiplicatori += tessera.moltiplicatore-1 || 1;
            } else if (tessera.tipoBonus === 'additivo') {
                punti = tessera.valore || punti;
            }
        } else {
            punti = LETTERE[lettera]?.punteggio || 0;
        }

        // Bonus posizionali
        if (i === 3) punti += 2;
        if (i === 5) punti *= 3;
        if (i === 7) punti += 5;
        if (i === 9) sommaMoltiplicatori += 2; // slot 9 raddoppia come bonus

        sommaLettere += punti;
    });

    // Bonus se tutte le 10 lettere sono usate
    if (lettereUsate === 10) {
        sommaMoltiplicatori += 10;
    }

    const moltiplicatoreTotale = lettereUsate * sommaMoltiplicatori;

    return sommaLettere * moltiplicatoreTotale;
}


function controllaParola() {
    const parola = getParolaDaSlot();
    const risultato = document.getElementById("result");

    if (parola.trim() === "") {
        risultato.textContent = "❗ Nessuna parola composta.";
        risultato.className = "error";
        return;
    }

    if (parole.includes(parola.toLowerCase())) {
        const punteggio = calcolaPunteggio(parola);
        salvaParolaAlta(parola, punteggio); // Salva parola con punteggio massimo)
        lettereUsateQuestoLivello += parola.length;
        punteggioTotale += punteggio;
        punteggioRound += punteggio;
        turniUsatiQuestoRound++;
        turniRimasti--;

        risultato.innerHTML = `✅ Parola valida: <strong>${parola}</strong> - Punti ottenuti: <strong>${punteggio}</strong>`;
        risultato.className = "success";

        // Aggiorna parola con punteggio massimo se serve
        if (punteggio > parolaPunteggioMassimo.punteggio) {
            parolaPunteggioMassimo.parola = parola;
            parolaPunteggioMassimo.punteggio = punteggio;
        }

        // Salva la parola e il punteggio nel round attuale
        if (!parolePerRound[roundPassati]) {
            parolePerRound[roundPassati] = [];
        }
        parolePerRound[roundPassati].push({ parola: parola, punteggio: punteggio });

        parolaCostruita.forEach(item => {
            if (item) scarti.push(tessereDisponibili[item.indiceTessera]);
        });

        if (punteggioRound >= obiettivo) {
            roundPassati++;

            const bonusGrezzo = lettereUsateQuestoLivello / ((turniUsatiQuestoRound / 2) + 0.5);
            const bonus = Math.round(bonusGrezzo * turniRimasti * (roundPassati * 0.5 + 0.5));

            punteggioTotale += bonus;

            // 🔁 Ogni 5000 punti totali, aggiungi un turno permanente per i round futuri
            // 🔁 Controlla se hai guadagnato almeno un turno extra in questo round
            const turniPrima = turniPerRound;
            while (punteggioTotale >= sogliaProssimoTurnoBonus) {
                turniPerRound++;

                const incremento = 5000 + (turniPerRound - 8) * 1000;
                sogliaProssimoTurnoBonus += incremento;
            }

            const turnoBonusSbloccato = turniPerRound > turniPrima;

            // Nuovo obiettivo per il round successivo
            obiettivo = obiettivo + (roundPassati * 15);

            // Apri la modale bonus con il messaggio aggiornato
            apriBonusModal(bonus, obiettivo, turnoBonusSbloccato);


            reintegraScarti();

            pescaSoloVuotiConControllo();


            // ⏱ Imposta i turni per il nuovo round in base ai bonus guadagnati
            turniRimasti = turniPerRound;
            punteggioRound = 0;
            lettereUsateQuestoLivello = 0;
            turniUsatiQuestoRound = 0;

            aggiornaInfoGioco();

            parolaCostruita = new Array(10).fill(null);
            mostraSlot();
            mostraTessere();
            return;
        }


        if (turniRimasti === 0) {
            risultato.innerHTML += punteggioRound >= obiettivo
                ? "<br>🎉 Obiettivo del round raggiunto! Hai vinto!"
                : "<br>❌ Obiettivo non raggiunto. Ritenta!";
            disabilitaGioco();
            mostraRiepilogoPartita();
        }

        aggiornaInfoGioco();

        reintegraScarti();
        pescaSoloVuotiConControllo();


        parolaCostruita = new Array(10).fill(null);
        mostraTessere();
        mostraSlot();
    } else {
        risultato.innerHTML = `❌ <strong>${parola}</strong> non è una parola valida.`;
        risultato.className = "error";
    }

    console.log(`📦 Sacchetto attuale: ${sacchetto.length} lettere`);
}


function mostraRiepilogoPartita() {
    salvaPartitaInClassifica(punteggioTotale);
    salvaPunteggioMassimo();
    const puntiTotali = punteggioTotale;
    const rounds = roundPassati;
    const parolaMax = parolaPunteggioMassimo.parola || "-";
    const punteggioMax = parolaPunteggioMassimo.punteggio || 0;

    let riepilogoHTML = `
        <p><strong>Punti totali:</strong> ${puntiTotali}</p>
        <p><strong>Round superati:</strong> ${rounds}</p>
        <p><strong>Parola con punteggio più alto:</strong> ${parolaMax} (${punteggioMax} punti)</p>
        <hr>
        <h3>Dettaglio round:</h3>
    `;

    parolePerRound.forEach((paroleRound, index) => {
        riepilogoHTML += `<p><strong>Round ${index + 1}:</strong></p><ul>`;
        paroleRound.forEach(({ parola, punteggio }) => {
            riepilogoHTML += `<li>${parola} - ${punteggio} punti</li>`;
        });
        riepilogoHTML += `</ul>`;
    });

    document.getElementById("summary").innerHTML = riepilogoHTML;
    document.getElementById("game-over-modal").style.display = "flex";
    document.getElementById("leaderboard").style.display = "none";
}




function disabilitaGioco() {
    document.querySelectorAll(".tile").forEach(t => t.replaceWith(t.cloneNode(true)));
    document.getElementById("check-word").disabled = true;
    document.getElementById("backspace").disabled = true;
    document.getElementById("rimescola").disabled = true;
}

function rimuoviUltimaLettera() {
    const lastIndex = parolaCostruita
        .map((el, idx) => ({ el, idx }))
        .filter(obj => obj.el !== null)
        .map(obj => obj.idx)
        .pop();

    if (lastIndex !== undefined) {
        parolaCostruita[lastIndex] = null;
        const slot = document.querySelector(`.slot[data-index='${lastIndex}']`);
        if (slot) slot.textContent = "";
        mostraTessere();
    }
}

function rimescolaTessere() {
    if (rimescolaUsato >= rimescolaMax) return;

    sacchetto.push(...tessereDisponibili);
    sacchetto.push(...scarti);
    tessereDisponibili = [];
    scarti = [];

    pescaTessere();
    mostraTessere();

    rimescolaUsato++;
    document.getElementById("rimescola-counter").textContent = rimescolaMax - rimescolaUsato;

    if (rimescolaUsato >= rimescolaMax) {
        document.getElementById("rimescola").disabled = true;
    }
}
function rimescolaTessereAutomatico() {
    // Rimetti solo le tessere attuali nel sacchetto
    sacchetto.push(...tessereDisponibili);
    tessereDisponibili = [];

    // NON reintegra gli scarti!

    pescaTessere(true); // passiamo un flag per dire che è automatico
    mostraTessere();
}

function salvaParolaAlta(parola, punteggio) {
    let paroleSalvate = JSON.parse(localStorage.getItem("paroleTop")) || [];

    const bonusUsati = parolaCostruita.map((slot, i) => {
        if (!slot) return null;
        const tessera = tessereDisponibili[slot.indiceTessera];
        if (typeof tessera === 'object' && tessera !== null) {
            if (tessera.tipoBonus === 'additivo') {
                return `+${tessera.valore}`;
            } else if (tessera.tipoBonus === 'moltiplicatore') {
                return `x${tessera.moltiplicatore}`;
            }
        }
        return null;
    }).filter(b => b !== null);

    paroleSalvate.push({
        parola: parola,
        punteggio: punteggio,
        bonus: bonusUsati.length > 0 ? bonusUsati : ["No Bonus"]
    });

    // Ordina per punteggio decrescente e tieni solo le top 15
    paroleSalvate.sort((a, b) => b.punteggio - a.punteggio);
    paroleSalvate = paroleSalvate.slice(0, 50);

    localStorage.setItem("paroleTop", JSON.stringify(paroleSalvate));
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function salvaPartitaInClassifica(punteggioTotale) {
    let classifica = JSON.parse(localStorage.getItem("classificaPartite")) || [];

    // Salva la data in formato ISO ma senza tempo (solo YYYY-MM-DD)
    const dataSoloGiorno = new Date().toISOString().split('T')[0];

    classifica.push({
        punteggio: punteggioTotale,
        data: dataSoloGiorno
    });

    classifica.sort((a, b) => b.punteggio - a.punteggio);
    classifica = classifica.slice(0, 15);

    localStorage.setItem("classificaPartite", JSON.stringify(classifica));
}

function mostraClassifica() {
    const classifica = JSON.parse(localStorage.getItem("classificaPartite")) || [];
    const paroleTop = JSON.parse(localStorage.getItem("paroleTop")) || [];

    let html = `<h3>📊 Migliori 15 Partite</h3><ol>`;
    classifica.forEach(({ punteggio, data }) => {
        const dataLocale = new Date(data).toLocaleDateString();
        html += `<li><strong>${punteggio}</strong> punti - ${dataLocale}</li>`;
    });
    html += `</ol>`;

    html += `<hr><h3>🔠 Top 50 Parole</h3><ol>`;
    paroleTop.forEach(({ parola, punteggio, bonus }) => {
        const bonusText = bonus ? `(${bonus.join(", ")})` : "No Bonus";
        html += `<li><strong>${parola}</strong> - ${punteggio} punti ${bonusText}</li>`;
    });
    html += `</ol>`;

    document.getElementById("leaderboard-content").innerHTML = html;
    document.getElementById("leaderboard-modal").style.display = "flex";
}




function salvaPunteggioMassimo() {
    const punteggioMaxSalvato = localStorage.getItem("punteggioMassimo") || 0;
    if (punteggioTotale > punteggioMaxSalvato) {
        localStorage.setItem("punteggioMassimo", punteggioTotale);
    }
}

function generaTesseraBonus() {
    const lettere = Object.keys(LETTERE);
    const lettera = lettere[Math.floor(Math.random() * lettere.length)];
    const valoreBase = LETTERE[lettera].punteggio;

    const tipoCasuale = Math.random();

    if (tipoCasuale < 0.85) {
        const bonus = Math.floor(Math.random() * 5) + 1;
        return {
            lettera,
            valore: valoreBase + bonus,
            tipoBonus: 'additivo',
        };
    } else {
        const moltiplicatore = tipoCasuale < 0.95 ? 2 : 3;
        return {
            lettera,
            valore: valoreBase, // non moltiplicato qui!
            tipoBonus: 'moltiplicatore',
            moltiplicatore: moltiplicatore,
        };
    }
}




function apriBonusModal(bonus, obiettivo, turnoBonusSbloccato = false) {
    const modal = document.getElementById("bonus-modal");
    const messaggio = document.getElementById("bonus-message");

    let html = `🎯 Obiettivo del round raggiunto!<br>Bonus: <strong>${bonus}</strong> punti<br>🚀 Prossimo obiettivo: <strong>${obiettivo}</strong>`;

    if (turnoBonusSbloccato) {
        html += `<br>➕ Hai guadagnato un <strong>turno extra</strong> per ogni round! 🎁`;
    }

    html += `<br>📈 Prossimo turno bonus a <strong>${sogliaProssimoTurnoBonus}</strong> punti totali`;

    messaggio.innerHTML = html;
    modal.style.display = "flex";

    riempiGrigliaBonus();
    mostraRiepilogoSacchetto(); // ✅ nuova chiamata
}



function riempiGrigliaBonus() {
    const caselle = document.querySelectorAll("#bonus-triplette-container .bonus-tile-slot");

    caselle.forEach(slot => {
        slot.innerHTML = "";             // pulisco contenuto precedente
        slot.classList.remove("bonus-additivo", "bonus-moltiplicatore");  // pulisco classi bonus

        const tesseraBonus = generaTesseraBonus();

        // Aggiungo la classe in base al tipo bonus
        if (tesseraBonus.tipoBonus === "additivo") {
            slot.classList.add("bonus-additivo");
        } else if (tesseraBonus.tipoBonus === "moltiplicatore") {
            slot.classList.add("bonus-moltiplicatore");
        }

        const letteraSpan = document.createElement("span");
        letteraSpan.textContent = tesseraBonus.lettera;
        letteraSpan.style.fontWeight = "bold";

        const bonusSpan = document.createElement("span");
        bonusSpan.style.fontSize = "0.8em";
        bonusSpan.style.marginLeft = "4px";
        bonusSpan.style.color = "inherit"; // lascia il colore ereditato dal background

        if (tesseraBonus.tipoBonus === "additivo") {
            bonusSpan.textContent = `+${tesseraBonus.valore}`;
        } else if (tesseraBonus.tipoBonus === "moltiplicatore") {
            bonusSpan.textContent = `x${tesseraBonus.moltiplicatore}`;
        }

        slot.appendChild(letteraSpan);
        slot.appendChild(bonusSpan);
    });
}

function mostraRiepilogoSacchetto() {
    const container = document.getElementById("sacchetto-stats");
    if (!container) return;

    // Conta le lettere nel sacchetto
    const conteggio = {};
    sacchetto.forEach(lettera => {
        const simbolo = typeof lettera === "string" ? lettera : lettera.lettera;
        conteggio[simbolo] = (conteggio[simbolo] || 0) + 1;
    });

    const vocali = ['A', 'E', 'I', 'O', 'U'];
    const vocaliPresenti = vocali.filter(v => conteggio[v]);
    const consonantiPresenti = Object.keys(conteggio).filter(l => !vocali.includes(l));

    const sommaVocali = vocali.reduce((acc, v) => acc + (conteggio[v] || 0), 0);
    const sommaConsonanti = consonantiPresenti.reduce((acc, c) => acc + conteggio[c], 0);

    // Funzione per suddividere un array in chunks di max n elementi
    function chunkArray(arr, size) {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    // Divido le consonanti in 2 gruppi
    const consonantiChunked = chunkArray(consonantiPresenti.sort(), Math.ceil(consonantiPresenti.length / 2));

    let html = `<div class="sacchetto-colonna">`;
    html += `<h4>🔤 Vocali (${sommaVocali})</h4><ul>`;
    vocali.forEach(v => {
        if (conteggio[v]) html += `<li>${v}: ${conteggio[v]}</li>`;
    });
    html += `</ul></div>`;

    html += `<div class="sacchetto-colonna consonanti-container">`;
    html += `<h4>🧱 Consonanti (${sommaConsonanti})</h4>`;
    html += `<div class="consonanti-lists">`;  // wrapper per colonne
    consonantiChunked.forEach(chunk => {
        html += `<ul>`;
        chunk.forEach(c => {
            html += `<li>${c}: ${conteggio[c]}</li>`;
        });
        html += `</ul>`;
    });
    html += `</div>`;
    html += `</div>`;

    container.innerHTML = `<div class="sacchetto-riepilogo">${html}</div>`;
}



// Delegazione: intercetta click ovunque nel container delle triplette
document.getElementById('bonus-triplette-container').addEventListener('click', (event) => {
    // Risali fino al contenitore .triplette-group cliccato
    let group = event.target;

    while (group && !group.classList.contains('triplette-group')) {
        group = group.parentElement;
    }

    if (!group) return; // se non trovato, esci

    const tessereBonus = Array.from(group.querySelectorAll('.bonus-tile-slot'))
        .map(slot => {
            const letteraSpan = slot.querySelector('span:nth-child(1)');
            if (!letteraSpan || letteraSpan.textContent.trim().length === 0) return null;

            const lettera = letteraSpan.textContent.trim();
            const tipoBonus = slot.classList.contains('bonus-additivo') ? 'additivo' :
                slot.classList.contains('bonus-moltiplicatore') ? 'moltiplicatore' : null;

            let valore = 0;
            let moltiplicatore = 1;

            const bonusSpan = slot.querySelector('span:nth-child(2)');
            const bonusSpanText = bonusSpan ? bonusSpan.textContent.trim() : "";

            if (tipoBonus === 'additivo') {
                valore = parseInt(bonusSpanText.replace('+', ''), 10);
            } else if (tipoBonus === 'moltiplicatore') {
                moltiplicatore = parseInt(bonusSpanText.replace('x', ''), 10);
            }

            return {
                lettera,
                tipoBonus,
                valore,
                moltiplicatore
            };
        })
        .filter(tessera => tessera !== null);

    if (tessereBonus.length > 0) {
        tessereBonus.forEach(tessera => sacchetto.push(tessera));
    }

    document.getElementById('bonus-modal').style.display = 'none';

    // Pulisce eventuali selezioni
    document.querySelectorAll('.bonus-tile-slot').forEach(slot => slot.classList.remove('selected'));
});




document.getElementById("check-word").addEventListener("click", controllaParola);
document.getElementById("backspace").addEventListener("click", rimuoviUltimaLettera);
document.getElementById("rimescola").addEventListener("click", rimescolaTessere);
document.getElementById("restart-game").addEventListener("click", () => {
    // Reset variabili di gioco
    punteggioTotale = 0;
    punteggioRound = 0;
    turniRimasti = 7;
    turniUsatiQuestoRound = 0;
    roundPassati = 0;
    obiettivo = obiettivoIniziale;
    lettereUsateQuestoLivello = 0;
    scarti = [];
    parolePerRound = [];
    parolaPunteggioMassimo = { parola: "", punteggio: 0 };
    parolaCostruita = new Array(10).fill(null);

    // Reset rimescolamenti
    rimescolaUsato = 0;
    document.getElementById("rimescola-counter").textContent = rimescolaMax;
    document.getElementById("rimescola").disabled = false;

    // *** RESET UI E LOGICA DI GIOCO ***
    generaSacchetto();
    mostraSlot();
    pescaTessere();
    mostraTessere();
    aggiornaInfoGioco();

    // Nascondi modale Game Over
    document.getElementById("game-over-modal").style.display = "none";

    // Riabilita pulsanti di gioco
    document.getElementById("check-word").disabled = false;
    document.getElementById("backspace").disabled = false;
    document.getElementById("rimescola").disabled = false;

    // Eventuale pulizia slot parola visiva
    document.querySelectorAll("#word-slots .slot").forEach(slot => {
        slot.textContent = ""; // svuota visivamente gli slot
        slot.classList.remove("selected"); // se usi classi selezione
    });

    // Pulisci messaggi risultato o altri elementi UI
    document.getElementById("result").textContent = "";
});


document.getElementById("show-leaderboard").addEventListener("click", () => {
    mostraClassifica(); // mostra la modale separata
});

document.getElementById("show-leaderboard-summary").addEventListener("click", () => {
    const classifica = JSON.parse(localStorage.getItem("classificaPartite")) || [];
    const paroleTop = JSON.parse(localStorage.getItem("paroleTop")) || [];

    let html = `<h3>📊 Migliori 15 Partite</h3><ol>`;
    classifica.forEach(({ punteggio, data }) => {
        const dataLocale = new Date(data).toLocaleDateString();
        html += `<li><strong>${punteggio}</strong> punti - ${dataLocale}</li>`;
    });
    html += `</ol>`;

    html += `<hr><h3>🔠 Top 50 Parole</h3><ol>`;
    paroleTop.forEach(({ parola, punteggio, bonus }) => {
        const bonusText = bonus ? `(${bonus.join(", ")})` : "";
        html += `<li><strong>${parola}</strong> - ${punteggio} punti ${bonusText}</li>`;
    });
    html += `</ol>`;

    document.getElementById("leaderboard").innerHTML = html;
    document.getElementById("leaderboard").style.display = "block";
});


document.getElementById("chiudi").addEventListener("click", () => {
    document.getElementById("game-over-modal").style.display = "none";
});
document.getElementById("close-leaderboard").addEventListener("click", () => {
    document.getElementById("leaderboard-modal").style.display = "none";
});

document.getElementById("reset-leaderboard").addEventListener("click", () => {
    if (confirm("Sei sicuro di voler azzerare la classifica?")) {
        localStorage.removeItem("classificaPartite");
        localStorage.removeItem("paroleTop");
        mostraClassifica(); // ricarica contenuto vuoto
    }
});



generaSacchetto();
mostraSlot();
pescaTessere();
mostraTessere();
aggiornaInfoGioco();

function stampaSacchetto() {
    console.log("Contenuto sacchetto:");
    sacchetto.forEach((tessera, index) => {
        console.log(`Tessera ${index + 1}: Letter: ${tessera.lettera}, Valore: ${tessera.valore}`);
    });
}
