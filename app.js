
function calculateDose(){
  const pain = painSel.value;
  const cur = Number(currentDose.value);
  const bt = Number(btCount.value);
  const renal = renalSel.value;

  let regular;
  if(cur===0){
    regular = pain==="moderate"?20:30;
  } else {
    regular = cur + (bt*cur/6);
  }

  let renalWarn = renal==="yes"
    ? "<br><b>⚠ Renal impairment:</b> consider dose reduction / use fentanyl"
    : "";

  doseResult.innerHTML =
    `Regular ≈ <b>${regular.toFixed(1)}</b> mg/day<br>
     Breakthrough ≈ <b>${(regular/6).toFixed(1)}</b> mg<br>
     <small>Reassess 48–72 hr · Give laxative · Stop weak opioid</small>${renalWarn}`;
}

function checkSedation(){
  const s = Number(sed.value);
  const r = Number(rr.value);

  let msg = "";
  if(s>=2){
    msg = "Reduce opioid dose 25–50%";
  }
  if(s===3 && r<8){
    msg = "<b>Give Naloxone:</b> 0.4–2 mg IV q2–3 min (max 10 mg)";
  }
  sedResult.innerHTML = msg || "Continue current dose and monitor";
}

function convertOpioid(){
  const d = Number(inputDose.value);
  let morphine = 0;

  if(inputDrug.value==="morphine") morphine=d;
  if(inputDrug.value==="oxycodone") morphine=d*1.5;
  if(inputDrug.value==="tramadol") morphine=d*0.1;
  if(inputDrug.value==="fentanyl") morphine=d*2.4;
  if(inputDrug.value==="methadone") morphine=d*4;

  convertResult.innerHTML =
  `Morphine equivalent ≈ <b>${morphine.toFixed(1)}</b> mg/day<br><hr>
   Oxycodone ≈ ${(morphine*0.67).toFixed(1)} mg/day<br>
   Tramadol ≈ ${(morphine*10).toFixed(0)} mg/day<br>
   Fentanyl ≈ ${(morphine/2.4).toFixed(1)} mcg/hr<br>
   <small>Opioid rotation: reduce 25–50%</small>`;
}
