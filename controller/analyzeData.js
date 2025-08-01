
function analyzeData(patients) {
    const alerts = {
        high_risk_patients: [],
        fever_patients: [],
        data_quality_issues: [],
    };

    const dataQualityIssuesSet = new Set();

    patients.forEach(patient => {
        let bpScore = 0;
        let tempScore = 0;
        let ageScore = 0;

        // 1. Blood Pressure Risk
        const bp = patient.blood_pressure;
        let bpIsValid = false;
        //  "systolic/diastolic"
        if (typeof bp === 'string') {
            const parts = bp.split('/');
            if (parts.length === 2) {
                const systolic = parseInt(parts[0], 10);
                const diastolic = parseInt(parts[1], 10);
                if (!isNaN(systolic) && !isNaN(diastolic)) {
                    bpIsValid = true;
                    if (systolic >= 140 || diastolic >= 90) {
                        bpScore = 3; // Stage 2
                    } else if (systolic >= 130 || diastolic >= 80) {
                        bpScore = 2; // Stage 1
                    } else if (systolic >= 120 && diastolic < 80) {
                        bpScore = 1; // Elevated
                    }
                }
            }
        }
        if (!bpIsValid) {
            dataQualityIssuesSet.add(patient.patient_id);
        }

        // 2. Temperature Risk
        const temp = patient.temperature;
        if (typeof temp === 'number') {
            if (temp >= 101.0) {
                tempScore = 2; // High Fever
            } else if (temp >= 99.6) {
                tempScore = 1; // Low Fever
            }
            if (temp >= 99.6) {
                alerts.fever_patients.push(patient.patient_id);
            }
        } else {
            dataQualityIssuesSet.add(patient.patient_id);
        }

        // 3. Age Risk
        const age = patient.age;
        if (typeof age === 'number') {
            if (age > 65) {
                ageScore = 2; // Over 65
            } else if (age >= 40) { // 40-65 inclusive
                ageScore = 1;
            }
        } else {
            dataQualityIssuesSet.add(patient.patient_id);
        }

        // total risk score
        const totalRiskScore = bpScore + tempScore + ageScore;

        // check high risk
        if (totalRiskScore >= 4) {
            alerts.high_risk_patients.push(patient.patient_id);
        }
    });

    alerts.data_quality_issues = Array.from(dataQualityIssuesSet);

    for (const key in alerts) {
        alerts[key].sort();
    }

    return alerts;
}

module.exports = { analyzeData };
