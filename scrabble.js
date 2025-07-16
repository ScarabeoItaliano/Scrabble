// Esempio struttura delle lettere (puoi modificarla come vuoi)
const LETTERE = {
    A: { quantità: 15, punteggio: 1 },
    B: { quantità: 2, punteggio: 6 },
    C: { quantità: 4, punteggio: 3 },
    D: { quantità: 4, punteggio: 3 },
    E: { quantità: 15, punteggio: 1 },
    F: { quantità: 2, punteggio: 6 },
    G: { quantità: 3, punteggio: 5 },
    H: { quantità: 1, punteggio: 6 },
    I: { quantità: 15, punteggio: 1 },
    L: { quantità: 6, punteggio: 1 },
    M: { quantità: 3, punteggio: 4 },
    N: { quantità: 6, punteggio: 1 },
    O: { quantità: 10, punteggio: 2 },
    P: { quantità: 3, punteggio: 4 },
    Q: { quantità: 1, punteggio: 7 },
    R: { quantità: 6, punteggio: 1 },
    S: { quantità: 5, punteggio: 2 },
    T: { quantità: 5, punteggio: 2 },
    U: { quantità: 5, punteggio: 4 },
    V: { quantità: 3, punteggio: 5 },
    Z: { quantità: 1, punteggio: 7 },
};

let sacchetto = [];
let tessereDisponibili = [];
let parolaCostruita = new Array(12).fill(null);
let punteggioTotale = 0;
let punteggioRound = 0;
let turniRimasti = 7;
let roundPassati = 0;
const obiettivoIniziale = 100;
let obiettivo = obiettivoIniziale;
let lettereUsateQuestoLivello = 0;
let scarti = [];

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
    2: "+2",
    5: "+5",
    8: "x2",
    11: "x5"
};

function mostraSlot() {
    const container = document.getElementById("parola-container");
    container.innerHTML = "";

    for (let i = 0; i < 12; i++) {
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

function pescaTessere() {
    reintegraScarti();

    tessereDisponibili = [];
    for (let i = 0; i < 16; i++) {
        if (sacchetto.length === 0) break;

        const index = Math.floor(Math.random() * sacchetto.length);
        const lettera = sacchetto.splice(index, 1)[0];
        tessereDisponibili.push(lettera);
    }
}

function mostraTessere() {
    const griglia = document.getElementById("tiles-grid");
    griglia.innerHTML = "";

    tessereDisponibili.forEach((lettera, index) => {
        const div = document.createElement("div");
        div.className = "tile";
        div.textContent = lettera;
        div.dataset.punti = LETTERE[lettera]?.punteggio || 0;

        const giàUsata = parolaCostruita.some(p => p?.indiceTessera === index);
        if (!giàUsata) {
            div.addEventListener("click", () => inserisciLettera(lettera, index, div));
        } else {
            div.classList.add("usata");
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

function calcolaPunteggio(parola) {
    const lettere = [...parola];
    let sommaLettere = 0;

    lettere.forEach((l, i) => {
        let punti = LETTERE[l]?.punteggio || 0;
        if (i === 2) punti += 2;
        else if (i === 5) punti += 5;
        sommaLettere += punti;
    });

    let moltiplicatore = 1;
    if (lettere.length > 8) moltiplicatore *= 2;
    if (lettere.length > 11) moltiplicatore *= 5;

    return sommaLettere * lettere.length * moltiplicatore;
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
        lettereUsateQuestoLivello += parola.length;
        punteggioTotale += punteggio;
        punteggioRound += punteggio;
        turniRimasti--;

        risultato.innerHTML = `✅ Parola valida: <strong>${parola}</strong> - Punti ottenuti: <strong>${punteggio}</strong>`;
        risultato.className = "success";

        parolaCostruita.forEach(item => {
            if (item) scarti.push(tessereDisponibili[item.indiceTessera]);
        });

        if (punteggioRound >= obiettivo) {
            roundPassati++;

            const bonusGrezzo = (5 + lettereUsateQuestoLivello) / ((roundPassati / 2) + 0.5);
            const bonus = Math.round(bonusGrezzo * turniRimasti);
            punteggioTotale += bonus;

            risultato.innerHTML += `<br>🎯 Obiettivo del round raggiunto!<br>
Bonus: <strong>${bonus}</strong> punti<br>
🚀 Prossimo obiettivo: <strong>${obiettivo + 50}</strong>`;

            reintegraScarti();
            parolaCostruita.forEach(item => {
                if (item && sacchetto.length > 0) {
                    const nuovaIndex = Math.floor(Math.random() * sacchetto.length);
                    tessereDisponibili[item.indiceTessera] = sacchetto.splice(nuovaIndex, 1)[0];
                }
            });

            obiettivo += 50;
            turniRimasti = 7;
            punteggioRound = 0;
            lettereUsateQuestoLivello = 0;

            aggiornaInfoGioco();

            parolaCostruita = new Array(12).fill(null);
            document.querySelectorAll(".slot").forEach(slot => {
                const bonus = slot.querySelector(".bonus");
                slot.innerHTML = "";
                if (bonus) slot.appendChild(bonus);
            });

            mostraTessere();
            return;
        }

        if (turniRimasti === 0) {
            risultato.innerHTML += punteggioRound >= obiettivo
                ? "<br>🎉 Obiettivo del round raggiunto! Hai vinto!"
                : "<br>❌ Obiettivo non raggiunto. Ritenta!";
            disabilitaGioco();
        }

        aggiornaInfoGioco();

        // 🔁 Anche qui: reintegro scarti e sostituzione tessere
        reintegraScarti();
        parolaCostruita.forEach(item => {
            if (item && sacchetto.length > 0) {
                const nuovaIndex = Math.floor(Math.random() * sacchetto.length);
                tessereDisponibili[item.indiceTessera] = sacchetto.splice(nuovaIndex, 1)[0];
            }
        });

        parolaCostruita = new Array(12).fill(null);
        document.querySelectorAll(".slot").forEach(slot => slot.textContent = "");
        mostraTessere();
    } else {
        risultato.innerHTML = `❌ <strong>${parola}</strong> non è una parola valida.`;
        risultato.className = "error";
    }

    console.log(`📦 Sacchetto attuale: ${sacchetto.length} lettere`);
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
    sacchetto.push(...tessereDisponibili);
    pescaTessere();
    mostraTessere();
}

document.getElementById("check-word").addEventListener("click", controllaParola);
document.getElementById("backspace").addEventListener("click", rimuoviUltimaLettera);
document.getElementById("rimescola").addEventListener("click", rimescolaTessere);

generaSacchetto();
pescaTessere();
mostraTessere();
aggiornaInfoGioco();
