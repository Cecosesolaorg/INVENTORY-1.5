// ============================================
// FIREBASE CONFIGURATION - Shared module
// ============================================

function initFirebaseSync() {
    try {
        const firebaseConfig = {
            databaseURL: "https://cecosesola-inventario-default-rtdb.firebaseio.com/"
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const database = firebase.database();

        // Sync staff assignments from Firebase
        const aisleTitle = document.querySelector('.aisle-title')?.innerText.toUpperCase() || "";
        database.ref('publishedStaff').on('value', (snapshot) => {
            const publishedStaff = snapshot.val() || {};
            const clean = s => s.replace(/[^A-Z0-9]/g, "");
            const cleanAisle = clean(aisleTitle);

            for (const area in publishedStaff) {
                if (cleanAisle.includes(clean(area)) || clean(area).includes(cleanAisle)) {
                    const names = publishedStaff[area].split(" / ");
                    const resp1 = document.getElementById('team1-resp1');
                    const resp2 = document.getElementById('team1-resp2');
                    if (resp1) resp1.innerText = names[0] || "---";
                    if (resp2) resp2.innerText = names[1] || "---";
                    break;
                }
            }
        });

        return database;
    } catch (e) {
        console.error("Error Firebase:", e);
        return null;
    }
}
