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
const obiettivoIniziale = 100;
let obiettivo = obiettivoIniziale;
let lettereUsateQuestoLivello = 0;
let scarti = [];
let parolePerRound = []; // array di array, ogni elemento contiene parole+punti per un round
let parolaPunteggioMassimo = {
    parola: "",
    punteggio: 0
};
let rimescolaUsato = 0;
const rimescolaMax = 3;
let numeroBonusTurno = 0;
let sogliaProssimoTurnoBonus = 50;
let turniPerRound = 7; // Numero di turni per round
let difficolta = "facile";
let incrementoSogliaTurno = 10;
let base = 50;
let soglieBonus;
let livelloBonusCorrente = 0;


window.addEventListener("load", () => {
    const statoSalvato = localStorage.getItem("statoPartita");
    if (statoSalvato && confirm("È stata trovata una partita salvata. Vuoi caricarla?")) {
        caricaStatoPartita();
    } else {
        // Mostra selezione difficoltà SOLO se non carichi la partita
        mostraSelezioneDifficolta();
    }
});

function avviaNuovaPartita() {
    roundPassati = 0;
    punteggioTotale = 0;
    parolePerRound = [];
    parolaPunteggioMassimo = {parola: "", punteggio: 0};
    sacchetto = []; // poi riempito da generaSacchetto
    tessereDisponibili = [];
    parolaCostruita = new Array(10).fill(null);
    punteggioRound = 0;
    turniUsatiQuestoRound = 0;
    turniRimasti = turniPerRound = 7;
    obiettivo = obiettivoIniziale;
    lettereUsateQuestoLivello = 0;
    scarti = [];
    rimescolaUsato = 0;
    numeroBonusTurno = 0;
    soglieBonus = generaSoglieBonus(difficolta);
    livelloBonusCorrente = 0;

    generaSacchetto();
    mostraSlot();
    pescaTessere();
    mostraTessere();
    aggiornaInfoGioco();
    aggiornaRimescolaBtn();
}

function impostaDifficolta(d) {
    difficolta = d;

    switch (difficolta) {
        case "medio":
            base = 6000;
            sogliaProssimoTurnoBonus = 5500;
            incrementoSogliaTurno = 1500;
            break;
        case "difficile":
            base = 7000;
            sogliaProssimoTurnoBonus = 6000;
            incrementoSogliaTurno = 2000;
            break;
        case "facile":
        default:
            base = 5000;
            sogliaProssimoTurnoBonus = 5000;
            incrementoSogliaTurno = 1000;
            break;
    }

    numeroBonusTurno = 0; // Reset bonus turno
    // 👇 Nascondi la modale
    document.getElementById("difficulty-modal").style.display = "none";

    // 👇 Avvia nuova partita
    avviaNuovaPartita();
}



function getIncrementoObiettivo(round) {
    switch (difficolta) {
        case "medio": return round * 20;
        case "difficile": return round * 25;
        default: return round * 15;
    }
}

function aggiornaInfoGioco() {
    const turnsDisplay = document.getElementById("turns-display");
    const goalDisplay = document.getElementById("goal-display");
    const scoreDisplay = document.getElementById("score-display");
    const progressBar = document.getElementById("progress-bar");

    turnsDisplay.textContent = `Turni rimanenti: ${turniRimasti}`;
    goalDisplay.textContent = `Round ${roundPassati + 1}: ${punteggioRound} / ${obiettivo}`;
    scoreDisplay.textContent = `Punteggio totale: ${punteggioTotale}`;

    const progressPercent = Math.min(100, (punteggioRound / obiettivo) * 100);
    progressBar.style.width = `${progressPercent}%`;
}


function aggiornaRimescolaBtn() {
    const rimescolaBtn = document.getElementById("rimescola");
    let counterSpan = document.getElementById("rimescola-counter");

    if (!counterSpan) {
        counterSpan = document.createElement("span");
        counterSpan.id = "rimescola-counter";
        rimescolaBtn.appendChild(counterSpan);
    }

    counterSpan.textContent = rimescolaMax - rimescolaUsato;
    rimescolaBtn.disabled = rimescolaUsato >= rimescolaMax;
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
    9: "x3"
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
    // Sostituisci le tessere usate con lettere dal sacchetto
    parolaCostruita.forEach(item => {
        if (item && sacchetto.length > 0) {
            const nuovaIndex = Math.floor(Math.random() * sacchetto.length);
            tessereDisponibili[item.indiceTessera] = sacchetto.splice(nuovaIndex, 1)[0];
        }
    });

    // Ora che le tessere sono state effettivamente sostituite, controlla tutta la distribuzione
    const { vocali, consonanti } = contaDistribuzione(tessereDisponibili);
    console.log("Set attuale:", tessereDisponibili.map(t => typeof t === "string" ? t : t.lettera).join(", "));
    console.log(`→ Vocali: ${vocali}, Consonanti: ${consonanti}`);

    // Verifica se la combinazione è bilanciata (almeno 3 vocali e 3 consonanti)
    if (vocali < 3 || consonanti < 3) {
        console.warn("❌ Distribuzione non valida. Attivazione rimescolo automatico.");
        alert(`⚠️ Combinazione sfortunata: solo ${vocali} vocale/i e ${consonanti} consonante/i. Le tessere verranno rimescolate.`);
        rimescolaTessereAutomatico();
    } else {
        console.log("✅ Distribuzione valida. Nessun rimescolo necessario.");
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
    aggiornaPunteggioLive();
}

function getParolaDaSlot() {
    return parolaCostruita.map(obj => obj ? obj.lettera : "").join("");
}
function aggiornaPunteggioLive() {
    const risultato = document.getElementById("result");
    const parola = getParolaDaSlot().trim().toLowerCase(); // Minuscolo per il confronto
    const parolaMaiuscola = parola.toUpperCase(); // Per la visualizzazione


    const { punteggio: punteggioDettagliato, formula } = calcolaPunteggioConDettagli();

   // document.getElementById("punteggio-live").textContent = `Punteggio: ${punteggioDettagliato}`;
 document.getElementById("formula-live").innerHTML = `
 ${formula}<br>
 <strong>Formula:</strong> (Punti lettere) × Lunghezza parola × (Bonus lettere)`;

    if (parola === "") {
        risultato.textContent = "📝 Componi una parola...";
        risultato.className = "info";
        return;
    }

    const punteggio = calcolaPunteggio(); // questa serve solo per validazione visiva

    if (parole.includes(parola)) {
        risultato.innerHTML = `✅ Parola valida: <strong>${parolaMaiuscola}</strong> - Punteggio: <strong>${punteggio}</strong>`;
        risultato.className = "success";
    } else {
        risultato.innerHTML = `❌ Parola non valida: <strong>${parolaMaiuscola}</strong> - Punteggio: <strong>${punteggio}</strong>`;
        risultato.className = "error";
    }
}

function calcolaPunteggio() {
    let sommaLettere = 0;
    let moltiplicatoreLettere = 0;
    let lettereUsate = 0;
    let bonus10Lettere = 1;

    parolaCostruita.forEach((elem, i) => {
        if (!elem) return;

        lettereUsate++;

        const { lettera, indiceTessera } = elem;
        let punti = LETTERE[lettera]?.punteggio || 0;
        const tessera = tessereDisponibili[indiceTessera];

        // Applica bonus dalla tessera
        if (typeof tessera === 'object' && tessera !== null) {
            if (tessera.tipoBonus === 'additivo') {
                punti = tessera.valore || punti;
            } else if (tessera.tipoBonus === 'moltiplicatore') {
                moltiplicatoreLettere += tessera.moltiplicatore;
            }
        }

        // Bonus posizionali
        if (i === 3) punti += 2;     // slot 4
        if (i === 5) punti *= 3;     // slot 6
        if (i === 7) punti += 5;     // slot 8

        sommaLettere += punti;
    });

    // Se nessuna lettera ha bonus moltiplicatore, usiamo 1 come default
    if (moltiplicatoreLettere === 0) moltiplicatoreLettere = 1;

    // Bonus per parola di 10 lettere
    if (lettereUsate === 10) bonus10Lettere = 3;

    // Formula finale
    const punteggioFinale = sommaLettere * lettereUsate * moltiplicatoreLettere * bonus10Lettere;
    return punteggioFinale;
}


function calcolaPunteggioConDettagli() {
    let sommaLettere = 0;
    let lettereUsate = 0;
    let bonusLettere = [];
    let bonus10Lettere = 1;

    let dettagliLettere = []; // Per costruire la stringa (5 + 8 ...)
    let dettagliBonus = [];   // Per costruire la stringa *(x2 + x3 ...)

    parolaCostruita.forEach((elem, i) => {
        if (!elem) return;

        const { lettera, indiceTessera } = elem;
        lettereUsate++;

        let punti = LETTERE[lettera]?.punteggio || 0;
        const tessera = tessereDisponibili[indiceTessera];

        // Bonus posizionali
        if (i === 3) punti += 2;
        if (i === 5) punti *= 3;
        if (i === 7) punti += 5;

        // Bonus da tessere
        if (typeof tessera === 'object' && tessera !== null) {
            if (tessera.tipoBonus === 'additivo') {
                punti = tessera.valore || punti;
            } else if (tessera.tipoBonus === 'moltiplicatore') {
                const moltiplicatore = tessera.moltiplicatore || 1;
                bonusLettere.push(moltiplicatore);
                dettagliBonus.push(`x${moltiplicatore}`);
            }
        }

        dettagliLettere.push(punti);
        sommaLettere += punti;

        // Slot 9 → bonus su tutta la parola
        if (i === 9) bonus10Lettere = 3;
    });

    // Nessun bonus lettera → default 1
    const sommaMoltiplicatori = bonusLettere.length > 0
        ? bonusLettere.reduce((a, b) => a + b, 0)
        : 1;

    const punteggioFinale = sommaLettere * lettereUsate * sommaMoltiplicatori * bonus10Lettere;

    // Costruzione della stringa formula
    let formula = `(${dettagliLettere.join(" + ")}) x ${lettereUsate}`;
    if (dettagliBonus.length > 0) {
        formula += ` x (${dettagliBonus.join(" + ")})`;
    }
    if (bonus10Lettere === 3) {
        formula += ` x 3`;
    }

    return {
        punteggio: punteggioFinale,
        formula: formula
    };
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

            const turniPrima = turniPerRound;

            const { turni: nuoviTurni, livello: nuovoLivelloBonus } = calcolaTurniDaSoglie(punteggioTotale, soglieBonus);

            if (nuovoLivelloBonus > livelloBonusCorrente) {
                // Hai superato una nuova soglia bonus: assegna i turni extra
                turniPerRound = nuoviTurni;
                sogliaProssimoTurnoBonus = calcolaSogliaProssima(punteggioTotale, soglieBonus);
                livelloBonusCorrente = nuovoLivelloBonus;
            }

            const turnoBonusSbloccato = turniPerRound > turniPrima;

            // Nuovo obiettivo per il round successivo
            obiettivo += getIncrementoObiettivo(roundPassati);

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
    salvaStatoPartita();
    console.log(`📦 Sacchetto attuale: ${sacchetto.length} lettere`);
    logStatoBonus(punteggioTotale, soglieBonus);
}
function mostraRiepilogoPartita() {
    salvaPartitaInClassifica(punteggioTotale, difficolta);
    const puntiTotali = punteggioTotale;
    const rounds = roundPassati;
    const parolaMax = parolaPunteggioMassimo.parola || "-";
    const punteggioMax = parolaPunteggioMassimo.punteggio || 0;

    // ⏺️ Prepara dati da salvare
    const partita = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        punteggioTotale: puntiTotali,
        roundSuperati: rounds,
        parolaTop: parolaMax,
        puntiTop: punteggioMax,
        difficolta: difficolta, // 👈 aggiunto qui
        dettagliRound: parolePerRound.map((parole, i) => ({
            round: i + 1,
            parole: parole.map(p => ({ parola: p.parola, punti: p.punteggio }))
        }))
    };
    // Mostra riepilogo visivamente nel modal
    let riepilogoHTML = `
        <p><strong>Punti totali:</strong> ${puntiTotali}</p>
        <p><strong>Round superati:</strong> ${rounds}</p>
        <p><strong>Parola con punteggio più alto:</strong> ${parolaMax} (${punteggioMax} punti)</p>
        <hr>
        <h3>Dettaglio round:</h3>
    `;

    partita.dettagliRound.forEach((r, i) => {
        riepilogoHTML += `<p><strong>Round ${r.round}:</strong></p><ul>`;
        r.parole.forEach(p => {
            riepilogoHTML += `<li>${p.parola} - ${p.punti} punti</li>`;
        });
        riepilogoHTML += `</ul>`;
    });

    document.getElementById("summary").innerHTML = riepilogoHTML;
    document.getElementById("game-over-modal").style.display = "flex";
}
function salvaPartitaInClassifica(punteggioTotale, difficolta) {
    let classifica = JSON.parse(localStorage.getItem("classificaPartite")) || [];

    const dataSoloGiorno = new Date().toISOString().split('T')[0];

    const nuovaPartita = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: dataSoloGiorno,
        punteggioTotale,
        roundSuperati: roundPassati,
        parolaTop: parolaPunteggioMassimo.parola || "-",
        puntiTop: parolaPunteggioMassimo.punteggio || 0,
        difficolta,
        dettagliRound: parolePerRound.map((parole, i) => ({
            round: i + 1,
            parole: parole.map(p => ({ parola: p.parola, punti: p.punteggio }))
        }))
    };

    classifica.push(nuovaPartita);

    classifica.sort((a, b) => b.punteggioTotale - a.punteggioTotale);
    classifica = classifica.slice(0, 15);

    localStorage.setItem("classificaPartite", JSON.stringify(classifica));
}


function mostraClassifica() {
    let classifica = JSON.parse(localStorage.getItem("classificaPartite")) || [];

    let modificato = false;
    classifica.forEach(p => {
        if (!p.hasOwnProperty("id")) {
            p.id = Date.now() + Math.floor(Math.random() * 10000);
            modificato = true;
        }
        if (!p.hasOwnProperty("punteggioTotale") && p.punteggio !== undefined) {
            p.punteggioTotale = p.punteggio;
            modificato = true;
        }
        if (!p.hasOwnProperty("parolaTop")) {
            p.parolaTop = "-";
            p.puntiTop = 0;
            modificato = true;
        }
    });

    if (modificato) {
        localStorage.setItem("classificaPartite", JSON.stringify(classifica));
    }

    // Filtro solo partite con difficoltà valida
    const difficoltaValide = ["facile", "medio", "difficile"];
    classifica = classifica.filter(p => difficoltaValide.includes(p.difficolta));

    const classificaFacile = classifica
        .filter(p => p.difficolta === "facile")
        .sort((a, b) => b.punteggioTotale - a.punteggioTotale)
        .slice(0, 10);

    const classificaMedia = classifica
        .filter(p => p.difficolta === "medio")
        .sort((a, b) => b.punteggioTotale - a.punteggioTotale)
        .slice(0, 10);

    const classificaDifficile = classifica
        .filter(p => p.difficolta === "difficile")
        .sort((a, b) => b.punteggioTotale - a.punteggioTotale)
        .slice(0, 10);

    let html = `<h3>📊 Classifica Facile - Top 10</h3><ol id="classifica-facile">`;
    classificaFacile.forEach(({ id, punteggioTotale, timestamp, roundSuperati }) => {
        const dataPartita = timestamp ? new Date(timestamp).toLocaleDateString() : "-";
        const roundTesto = roundSuperati !== undefined ? `round:${roundSuperati}` : "";
        html += `<li data-id="${id}" class="classifica-voce" style="cursor:pointer;">
                <strong>${punteggioTotale}</strong> punti - ${dataPartita} - ${roundTesto}
             </li>`;
    });
    html += `</ol>`;

    html += `<h3>📊 Classifica Medio - Top 10</h3><ol id="classifica-medio">`;
    classificaMedia.forEach(({ id, punteggioTotale, timestamp, roundSuperati }) => {
        const dataPartita = timestamp ? new Date(timestamp).toLocaleDateString() : "-";
        const roundTesto = roundSuperati !== undefined ? `round:${roundSuperati}` : "";
        html += `<li data-id="${id}" class="classifica-voce" style="cursor:pointer;">
                <strong>${punteggioTotale}</strong> punti - ${dataPartita} - ${roundTesto}
             </li>`;
    });
    html += `</ol>`;

    html += `<h3>📊 Classifica Difficile - Top 10</h3><ol id="classifica-difficile">`;
    classificaDifficile.forEach(({ id, punteggioTotale, timestamp, roundSuperati }) => {
        const dataPartita = timestamp ? new Date(timestamp).toLocaleDateString() : "-";
        const roundTesto = roundSuperati !== undefined ? `round:${roundSuperati}` : "";
        html += `<li data-id="${id}" class="classifica-voce" style="cursor:pointer;">
                <strong>${punteggioTotale}</strong> punti - ${dataPartita} - ${roundTesto}
             </li>`;
    });
    html += `</ol>`;

    // Sezione parole top (solo prime 10 inizialmente)
    const paroleTop = JSON.parse(localStorage.getItem("paroleTop")) || [];
    let paroleLimitate = paroleTop.slice(0, 10);

    html += `<hr><h3>🔠 Top parole</h3><ol id="paroleTop-list">`;
    paroleLimitate.forEach(({ parola, punteggio, bonus }) => {
        const bonusText = bonus ? `(${bonus.join(", ")})` : "No Bonus";
        html += `<li><strong>${parola}</strong> - ${punteggio} punti ${bonusText}</li>`;
    });
    html += `</ol>`;

    // Pulsante per mostrare più parole
    if (paroleTop.length > 10) {
        html += `<button id="mostra-piu-parole" class="game-button">Più parole</button>`;
    }

    html += `<div id="dettaglio-partita" style="margin-top:20px;"></div>`;

    document.getElementById("leaderboard-content").innerHTML = html;
    document.getElementById("leaderboard-modal").style.display = "flex";

    document.querySelectorAll(".classifica-voce").forEach(li => {
        li.addEventListener("click", () => {
            const id = li.getAttribute("data-id");
            const partita = classifica.find(p => p.id == id);
            if (partita) {
                mostraDettaglioPartita(partita);
            }
        });
    });
    // Listener sul pulsante "Più parole"
    const btnPiuParole = document.getElementById("mostra-piu-parole");
    if (btnPiuParole) {
        btnPiuParole.addEventListener("click", () => {
            let htmlParole = "";
            paroleTop.slice(0, 50).forEach(({ parola, punteggio, bonus }) => {
                const bonusText = bonus ? `(${bonus.join(", ")})` : "No Bonus";
                htmlParole += `<li><strong>${parola}</strong> - ${punteggio} punti ${bonusText}</li>`;
            });
            document.getElementById("paroleTop-list").innerHTML = htmlParole;
            btnPiuParole.style.display = "none"; // Nascondi il bottone dopo il click
        });
    }

    document.getElementById("leaderboard-modal").style.display = "flex";
}

function mostraClassificaFiltrata(difficolta) {
    const classifica = JSON.parse(localStorage.getItem("classificaPartite")) || [];
    const filtrata = classifica.filter(p => p.difficolta === difficolta);
    const contenitore = document.getElementById("classifica-filtrata");

    let html = `<h4>🎯 Difficoltà: ${difficolta}</h4><ol class="classifica-voce">`;

    filtrata.forEach(partita => {
        html += `<li data-id="${partita.id}" style="cursor:pointer;">
            <strong>${partita.punteggioTotale}</strong> punti - ${partita.data}
        </li>`;
    });

    html += `</ol>`;
    contenitore.innerHTML = html;

    document.querySelectorAll(".classifica-voce li").forEach(li => {
        li.addEventListener("click", () => {
            const id = parseInt(li.getAttribute("data-id"));
            const partita = classifica.find(p => p.id === id);
            if (!partita) return;
            mostraDettaglioPartita(partita);
        });
    });
}


    function mostraDettaglioPartita(partita) {
        const container = document.getElementById("dettaglio-partita");
        if (!container || !partita) return;

        let html = `
        <hr><h4>📋 Dettagli partita</h4>
        <p><strong>Punteggio totale:</strong> ${partita.punteggioTotale}</p>
        <p><strong>Round superati:</strong> ${partita.roundSuperati}</p>
        <p><strong>Parola migliore:</strong> ${partita.parolaTop} (${partita.puntiTop} punti)</p>
        <h5>🧩 Dettagli per round:</h5>
    `;

        partita.dettagliRound.forEach(r => {
            html += `<p><strong>Round ${r.round}:</strong></p><ul>`;
            r.parole.forEach(p => {
                html += `<li>${p.parola} - ${p.punti} punti</li>`;
            });
            html += `</ul>`;
        });

        container.innerHTML = html;
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
    aggiornaPunteggioLive();
}

function rimescolaTessere() {
    if (rimescolaUsato >= rimescolaMax) return;

    sacchetto.push(...tessereDisponibili);
    sacchetto.push(...scarti);
    tessereDisponibili = [];
    scarti = [];

    shuffleArray(sacchetto);
    pescaTessere();
    mostraTessere();

    rimescolaUsato++;
    const counterSpan = document.getElementById("rimescola-counter");
    if (counterSpan) {
        counterSpan.textContent = rimescolaMax - rimescolaUsato;
    }

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


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
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

    const htmlSacchetto = generaRiepilogoLettere(sacchetto, "Sacchetto");
    const htmlScarti = generaRiepilogoLettere(scarti, "Scarti");

    container.innerHTML = `<div class="sacchetto-riepilogo">${htmlSacchetto}${htmlScarti}</div>`;
}

function generaRiepilogoLettere(lista, titolo) {
    const conteggio = {};
    lista.forEach(lettera => {
        const simbolo = typeof lettera === "string" ? lettera : lettera.lettera;
        conteggio[simbolo] = (conteggio[simbolo] || 0) + 1;
    });

    const vocali = ['A', 'E', 'I', 'O', 'U'];
    const vocaliPresenti = vocali.filter(v => conteggio[v]);
    const consonantiPresenti = Object.keys(conteggio).filter(l => !vocali.includes(l));

    const sommaVocali = vocali.reduce((acc, v) => acc + (conteggio[v] || 0), 0);
    const sommaConsonanti = consonantiPresenti.reduce((acc, c) => acc + conteggio[c], 0);

    // Funzione per suddividere array in colonne
    function chunkArray(arr, size) {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    const consonantiChunked = chunkArray(consonantiPresenti.sort(), Math.ceil(consonantiPresenti.length / 2));

    let html = `<div class="sacchetto-colonna">`;
    html += `<h4>🔤 Vocali (${sommaVocali})</h4><ul>`;
    vocali.forEach(v => {
        if (conteggio[v]) html += `<li>${v}: ${conteggio[v]}</li>`;
    });
    html += `</ul></div>`;

    html += `<div class="sacchetto-colonna consonanti-container">`;
    html += `<h4>🧱 Consonanti (${sommaConsonanti})</h4>`;
    html += `<div class="consonanti-lists">`;
    consonantiChunked.forEach(chunk => {
        html += `<ul>`;
        chunk.forEach(c => {
            html += `<li>${c}: ${conteggio[c]}</li>`;
        });
        html += `</ul>`;
    });
    html += `</div>`;
    html += `</div>`;

    return `<div class="riepilogo-blocco"><h3>${titolo}</h3><div class="riepilogo-contenuto">${html}</div></div>`;
}


function mostraSelezioneDifficolta() {
    document.getElementById("difficulty-modal").style.display = "flex";
}

function selezionaDifficolta(livello) {
    impostaDifficolta(livello); // <-- già definita come da messaggi precedenti
    document.getElementById("difficulty-modal").style.display = "none";
    avviaNuovaPartita(); // <-- la tua funzione per inizializzare/ripartire
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
window.addEventListener("DOMContentLoaded", () => {
    const rimescolaBtn = document.getElementById("rimescola");

    // Container interno per impaginare meglio numero + icona
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    // Numero
    const counterSpan = document.createElement("span");
    counterSpan.id = "rimescola-counter";
    counterSpan.textContent = rimescolaMax;
    counterSpan.style.fontSize = "16px";
    counterSpan.style.fontWeight = "bold";

    // Freccia
    const iconSpan = document.createElement("span");
    iconSpan.classList.add("rimescola-icon");
    iconSpan.textContent = "⟳";
    iconSpan.style.fontSize = "18px";
    iconSpan.style.marginTop = "2px";

    // Aggiungi entrambi
    container.appendChild(counterSpan);
    container.appendChild(iconSpan);
    rimescolaBtn.appendChild(container);

    // Click handler
    rimescolaBtn.addEventListener("click", rimescolaTessere);
});

document.getElementById("restart-game-header").addEventListener("click", mostraSelezioneDifficolta);
document.getElementById("restart-game").addEventListener("click", () => {
    document.getElementById("game-over-modal").style.display = "none"; // Chiude la modale di fine partita
    mostraSelezioneDifficolta(); // Apre la scelta della difficoltà
});document.getElementById("show-leaderboard").addEventListener("click", () => {
    mostraClassifica(); // mostra la modale separata
});

document.getElementById("close-leaderboard").addEventListener("click", () => {
    document.getElementById("game-over-modal").style.display = "none";
});
document.getElementById("close-leaderboard").addEventListener("click", () => {
    document.getElementById("leaderboard-modal").style.display = "none";
});

document.getElementById("reset-leaderboard").addEventListener("click", () => {
    if (confirm("Sei sicuro di voler azzerare la classifica?")) {
        localStorage.removeItem("classificaPartite");
        localStorage.removeItem("classifica");       // ✅ aggiornata
        localStorage.removeItem("paroleTop");
        mostraClassifica(); // ricarica contenuto vuoto
    }
});
document.getElementById("chiudi-difficulty-modal").addEventListener("click", () => {
    document.getElementById("difficulty-modal").style.display = "none";
});


function stampaSacchetto() {
    console.log("Contenuto sacchetto:");
    sacchetto.forEach((tessera, index) => {
        console.log(`Tessera ${index + 1}: Letter: ${tessera.lettera}, Valore: ${tessera.valore}`);
    });
}

function salvaStatoPartita() {
    const stato = {
        roundPassati,
        punteggioTotale,
        parolePerRound,
        parolaPunteggioMassimo,
        sacchetto,
        tessereDisponibili,       // <-- aggiungi questa riga
        parolaCostruita,
        punteggioRound,
        turniRimasti,
        turniUsatiQuestoRound,
        obiettivo,
        lettereUsateQuestoLivello,
        scarti,
        rimescolaUsato,
        sogliaProssimoTurnoBonus,
        turniPerRound,
        difficolta,
        livelloBonusCorrente,
    };
    localStorage.setItem("statoPartita", JSON.stringify(stato));
}

function caricaStatoPartita() {
    const statoJSON = localStorage.getItem("statoPartita");
    if (!statoJSON) return false; // niente partita salvata

    const stato = JSON.parse(statoJSON);

    roundPassati = stato.roundPassati;
    punteggioTotale = stato.punteggioTotale;
    parolePerRound = stato.parolePerRound;
    parolaPunteggioMassimo = stato.parolaPunteggioMassimo;
    sacchetto = stato.sacchetto;
    tessereDisponibili = stato.tessereDisponibili || [];
    parolaCostruita = stato.parolaCostruita || new Array(10).fill(null);
    punteggioRound = stato.punteggioRound || 0;
    turniRimasti = stato.turniRimasti || 0;
    turniUsatiQuestoRound = stato.turniUsatiQuestoRound || 0;
    obiettivo = stato.obiettivo || obiettivoIniziale;
    lettereUsateQuestoLivello = stato.lettereUsateQuestoLivello || 0;
    scarti = stato.scarti || [];
    rimescolaUsato = stato.rimescolaUsato || 0;
    sogliaProssimoTurnoBonus = stato.sogliaProssimoTurnoBonus || 5000;
    turniPerRound = stato.turniPerRound || 7;
    difficolta = stato.difficolta || "facile"; // imposta difficoltà di default se non presente
    soglieBonus = generaSoglieBonus(difficolta); // rigenera le soglie in base alla difficoltà
    livelloBonusCorrente = stato.livelloBonusCorrente || 0;
    aggiornaInterfacciaDaStato();

    return true;
}

function aggiornaInterfacciaDaStato() {
    mostraSlot();
    mostraTessere();
    aggiornaInfoGioco();
    aggiornaRimescolaBtn();
}



window.addEventListener("DOMContentLoaded", () => {
    const caricata = caricaStatoPartita(); // prova a caricare
    if (!caricata) {
        mostraSelezioneDifficolta(); // solo se non c'è partita salvata
    }
});

function generaSoglieBonus(difficolta) {
    let base, incrementoBase, turniIniziali;

    switch (difficolta) {
        case "medio":
            base = 5500; incrementoBase = 1500; turniIniziali = 7; break;
        case "difficile":
            base = 6000; incrementoBase = 2000; turniIniziali = 7; break;
        case "facile":
        default:
            base = 5000; incrementoBase = 1000; turniIniziali = 7; break;
    }

    let soglie = [];
    let sogliaCorrente = base;
    let turni = turniIniziali;

    for (let i = 1; i <= 10; i++) {
        turni++;
        soglie.push({ soglia: sogliaCorrente, turni: turni });
        const incremento = base + (turni - turniIniziali) * incrementoBase;
        sogliaCorrente += incremento;
    }

    return soglie;
}

function calcolaTurniDaSoglie(punteggioTotale, soglie) {
    let turniAssegnati = soglie[0].turni; // almeno quelli iniziali
    let livelloSuperato = 0;

    for (let i = 0; i < soglie.length; i++) {
        if (punteggioTotale >= soglie[i].soglia) {
            turniAssegnati = soglie[i].turni;
            livelloSuperato = i + 1; // i parte da 0, quindi +1 per conteggio livelli
        } else {
            break;
        }
    }

    return { turni: turniAssegnati, livello: livelloSuperato };
}


function calcolaSogliaProssima(punteggioTotale, soglieBonus) {
    for (let i = 0; i < soglieBonus.length; i++) {
        if (punteggioTotale < soglieBonus[i].soglia) {
            return soglieBonus[i].soglia;
        }
    }
    // Se hai superato tutte le soglie, ritorna l'ultima o un valore alto
    return soglieBonus[soglieBonus.length - 1].soglia;
}

function logStatoBonus(punteggioTotale, soglieBonus) {
    // Trova la soglia "corrente" da superare e i turni corrispondenti
    let sogliaCorrente = null;
    let turniCorrenti = null;
    let sogliaSuccessiva = null;
    let turniSuccessivi = null;

    for (let i = 0; i < soglieBonus.length; i++) {
        if (punteggioTotale < soglieBonus[i].soglia) {
            sogliaSuccessiva = soglieBonus[i].soglia;
            turniSuccessivi = soglieBonus[i].turni;
            break;
        }
        sogliaCorrente = soglieBonus[i].soglia;
        turniCorrenti = soglieBonus[i].turni;
    }

    console.log("=== Stato bonus ===");
    console.log("Punteggio totale:", punteggioTotale);
    console.log("Soglia corrente superata:", sogliaCorrente);
    console.log("Turni attuali associati:", turniCorrenti);
    console.log("Prossima soglia da superare:", sogliaSuccessiva);
    console.log("Turni al prossimo bonus:", turniSuccessivi);
    console.log("==================");
}
