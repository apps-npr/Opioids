// Tab Switching Logic
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Pain Score Slider UI Update
function updateRangeVal(val) {
    let text = "";
    if(val <= 3) text = "Mild (1-3)";
    else if(val <= 6) text = "Moderate (4-6)";
    else text = "Severe (7-10)";
    document.getElementById('painScoreVal').innerText = `${val} - ${text}`;
}

// Show/Hide Input for Previous User
document.querySelectorAll('input[name="history"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        document.getElementById('currentOpioidSection').style.display = e.target.value === 'user' ? 'block' : 'none';
    });
});

// ==========================================
// LOGIC 1: Conversion Calculator
// ==========================================
function calculateConversion() {
    const drug = document.getElementById('sourceDrug').value;
    const dose = parseFloat(document.getElementById('sourceDose').value);
    const resultDiv = document.getElementById('conversionResult');
    const tbody = document.getElementById('conversionTableBody');

    if (isNaN(dose) || dose <= 0) {
        resultDiv.style.display = 'none';
        return;
    }

    // 1. Convert everything to Oral Morphine Equivalent (OME) first
    let ome = 0;
    
    // Ratios based on user images:
    // Tramadol -> MO = dose / 10
    // Codeine -> MO = dose / 10
    // MO IV -> MO PO = dose * 3 (Image says MO PO / 3 = IV, so IV is 3x stronger)
    // Fentanyl Patch -> MO PO = patch_dose * 2.4 (Image says MO PO / 2.4 = Patch)

    switch(drug) {
        case 'tramadol': ome = dose / 10; break; 
        case 'codeine': ome = dose / 10; break;
        case 'morphine_po': ome = dose; break;
        case 'morphine_iv': ome = dose * 3; break;
        case 'fentanyl': ome = dose * 2.4; break; 
    }

    // 2. Calculate equivalents from OME
    const tramadol = ome * 10;
    const codeine = ome * 10;
    const mo_iv = ome / 3;
    const fentanyl_patch = ome / 2.4;

    // 3. Render Table
    let html = `
        <tr style="${drug === 'morphine_po' ? 'background:#fff5e6;' : ''}">
            <td><strong>Morphine (Oral)</strong></td>
            <td><strong>${ome.toFixed(1)}</strong> mg/day</td>
            <td>MST ${Math.round(ome/2)} mg q 12 hr</td>
        </tr>
        <tr style="${drug === 'fentanyl' ? 'background:#fff5e6;' : ''}">
            <td>Fentanyl Patch</td>
            <td><strong>${fentanyl_patch.toFixed(1)}</strong> mcg/hr</td>
            <td>แปะทุก 72 ชม. (ใกล้เคียง: ${getClosestFentanyl(fentanyl_patch)})</td>
        </tr>
        <tr style="${drug === 'morphine_iv' ? 'background:#fff5e6;' : ''}">
            <td>Morphine (IV/SC)</td>
            <td>${mo_iv.toFixed(1)} mg/day</td>
            <td>Continuous / Divided dose</td>
        </tr>
        <tr style="${drug === 'tramadol' ? 'background:#fff5e6;' : ''}">
            <td>Tramadol</td>
            <td>${tramadol.toFixed(0)} mg/day</td>
            <td>Max 400 mg/day</td>
        </tr>
    `;

    tbody.innerHTML = html;
    resultDiv.style.display = 'block';
}

function getClosestFentanyl(val) {
    const patches = [12, 25, 50, 75, 100];
    const closest = patches.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
    return closest + " mcg/hr";
}

// ==========================================
// LOGIC 2: Pain Management Plan
// ==========================================
function generatePlan() {
    const score = parseInt(document.getElementById('painScore').value);
    const type = document.querySelector('input[name="history"]:checked').value;
    const planDiv = document.getElementById('planResult');
    
    let title = "";
    let content = "";
    let color = "";

    // Case 1: Moderate Pain (4-6)
    if (score >= 4 && score <= 6) {
        title = "🟠 Step 2: Moderate Pain Management";
        color = "#ffe0b2"; // Orange pastel
        
        if (type === 'naive') {
            content = `
                <p><strong>แนะนำเริ่ม Weak Opioids ร่วมกับ Non-opioids:</strong></p>
                <ul>
                    <li><strong>Tramadol:</strong> 50-100 mg oral q 4-6 hr (Max 400/day)</li>
                    <li><strong>Codeine:</strong> 30-60 mg oral q 4-6 hr</li>
                    <li><em>Add-on:</em> Paracetamol 500mg q 4-6 hr หรือ NSAIDs (ถ้าไม่มีข้อห้าม)</li>
                </ul>
            `;
        } else {
            content = `
                <p><strong>ผู้ป่วยได้รับยาอยู่แล้วแต่ยังปวด (Uncontrolled):</strong></p>
                <ul>
                    <li>ปรับเพิ่มขนาดยาเดิมขึ้น <strong>30-50%</strong></li>
                    <li>หรือเปลี่ยนเป็น Strong Opioid (Low dose Morphine)</li>
                    <li>ควรมี Breakthrough pain dose (1/6 ของยาทั้งวัน)</li>
                </ul>
            `;
        }
    } 
    // Case 2: Severe Pain (7-10)
    else if (score >= 7) {
        title = "🔴 Step 3: Severe Pain Management";
        color = "#ffcdd2"; // Red pastel

        if (type === 'naive') {
            content = `
                <p><strong>เริ่ม Strong Opioids (Morphine):</strong></p>
                <div class="result-box">
                    <strong>สูตรเริ่มยามาตรฐาน (Opioid Naive):</strong><br>
                    MO ~30 mg/day
                    <br><br>
                    👉 <strong>MST (10):</strong> 1 tab oral q 12 hr<br>
                    ➕ <strong>MO IR (10) for prn:</strong> 0.5-1 tab q 2-4 hr (เมื่อปวด)
                </div>
                <p><small>*ต้องจ่ายยาระบาย (Senokot/Bisacodyl) คู่กันเสมอ</small></p>
            `;
        } else {
            const currentDose = parseFloat(document.getElementById('currentDose').value) || 0;
            const newDoseLow = currentDose * 1.5;
            const newDoseHigh = currentDose * 2.0;
            
            content = `
                <p><strong>ปรับยา Strong Opioids (Titration):</strong></p>
                <ul>
                    <li>กรณี Severe Pain ให้เพิ่มขนาดยา <strong>50-100%</strong> จากเดิม</li>
                    <li><strong>คำนวณ:</strong> จากเดิม ${currentDose} mg/day <br> 
                        👉 แนะนำปรับเป็น: <strong>${newDoseLow.toFixed(0)} - ${newDoseHigh.toFixed(0)} mg/day</strong></li>
                    <li><strong>Rescue Dose (prn):</strong> ใช้ 1/6 ของขนาดยาใหม่ (${(newDoseLow/6).toFixed(0)} mg)</li>
                </ul>
            `;
        }
    } 
    // Case 3: Mild Pain
    else {
        title = "🟢 Step 1: Mild Pain";
        color = "#c8e6c9";
        content = "<p>ให้ Paracetamol หรือ NSAIDs ประเมินอาการซ้ำ</p>";
    }

    planDiv.style.display = 'block';
    planDiv.style.backgroundColor = color;
    planDiv.innerHTML = `<h3>${title}</h3>${content}`;
}

