import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    addDoc,
    getDocs,
    collection, 
    query,
    where,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyC5s4q5zK7UJFcTGdQCRGa9TObgh5Zhup8",
    authDomain: "farewise-ng.firebaseapp.com",
    projectId: "farewise-ng",
    storageBucket: "farewise-ng.firebasestorage.app",
    messagingSenderId: "932665649086",
    appId: "1:932665649086:web:ad49564d488ea76e1f3bef"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
document.addEventListener("DOMContentLoaded", function () {
    const regPassword = document.getElementById("regPassword");
    const toggleRegPassword = document.getElementById("toggleRegPassword");

    if (regPassword && toggleRegPassword) {
        toggleRegPassword.addEventListener("click", function () {
            const hidden = regPassword.type === "password";
            regPassword.type = hidden ? "text" : "password";
            toggleRegPassword.textContent = hidden ? "🙈" : "👁";
        });
    }
        const loginPassword = document.getElementById("loginPassword");
    const toggleLoginPassword = document.getElementById("toggleLoginPassword");

    if (loginPassword && toggleLoginPassword) {
        toggleLoginPassword.addEventListener("click", function () {
            const hidden = loginPassword.type === "password";
            loginPassword.type = hidden ? "text" : "password";
            toggleLoginPassword.textContent = hidden ? "🙈" : "👁";
        });
    }
    const stateSelect = document.getElementById("state");
    const areaSelect = document.getElementById("area");
    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");
    const transportSelect = document.getElementById("transport");
    const searchBtn = document.getElementById("searchBtn");
    const result = document.getElementById("result");
const submitFareButton = document.getElementById("submitFareButton");
const fareUpdateForm = document.getElementById("fareUpdateForm");

if (submitFareButton && fareUpdateForm) {
    submitFareButton.addEventListener("click", function () {
        fareUpdateForm.hidden = !fareUpdateForm.hidden;
    });
    // FORGOT PASSWORD
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", async function () {
        const email = document.getElementById("loginEmail").value.trim();

        if (!email) {
            alert("Please enter your email address first.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent. Please check your inbox.");
        } catch (error) {
            alert("Password reset failed: " + error.message);
        }
    });
}
}
   // LOAD SAVED FARE UPDATES
async function loadFareUpdates() {
    const list = document.getElementById("fareUpdatesList");

    if (!list) return;

    try {
        list.textContent = "Loading fare updates...";

       const snapshot = await getDocs(
    query(
        collection(db, "fareUpdates"),
        where("status", "==", "approved")
    )
);

        list.innerHTML = "";

       const approvedUpdates = snapshot.docs.filter(
    (fareDoc) => fareDoc.data().status === "approved"
);

if (approvedUpdates.length === 0) {
    list.textContent = "No approved fare updates available yet.";
    return;
}

        approvedUpdates.forEach((fareDoc) => {
            const data = fareDoc.data();

            const item = document.createElement("div");
            const heading = document.createElement("h4");
            const details = document.createElement("p");
            const note = document.createElement("p");

            heading.textContent = data.from + " to " + data.to;

            details.textContent =
                data.transport + " | ₦" + data.fare;

            note.textContent = data.note || "No additional information";

const status = document.createElement("p");
status.textContent = "Status: " + (
    data.status === "pending" ? "Pending Approval" : (data.status || "Pending")
);

  const date = document.createElement("p");

date.textContent =
    data.createdAt && typeof data.createdAt.toDate === "function"
        ? "Submitted: " + data.createdAt.toDate().toLocaleString()
        : "Submitted: Date unavailable";          item.appendChild(heading);
            item.appendChild(details);
            item.appendChild(note);

item.appendChild(status);

item.appendChild(date);
            list.appendChild(item);
        });

    } catch (error) {
    console.error("Error loading fare updates:", error);
    list.textContent = "Loading error: " + error.message;
}
}
async function loadAdminFareUpdates() {
    const list = document.getElementById("adminFareUpdatesList");
    if (!list) return;

    try {
        list.textContent = "Loading pending approvals...";

        const pendingQuery = query(
            collection(db, "fareUpdates"),
            where("status", "==", "pending")
        );

        const snapshot = await getDocs(pendingQuery);
        list.innerHTML = "";

        if (snapshot.empty) {
            list.textContent = "No pending fare updates.";
            return;
        }

        snapshot.forEach((fareDoc) => {
            const data = fareDoc.data();

            const item = document.createElement("div");
            const heading = document.createElement("h4");
            const details = document.createElement("p");
            const note = document.createElement("p");
            const approveBtn = document.createElement("button");
            const rejectBtn = document.createElement("button");

            heading.textContent = data.from + " to " + data.to;
            details.textContent = data.transport + " | ₦" + data.fare;
            note.textContent = data.note || "No additional information";

            approveBtn.textContent = "Approve";
            rejectBtn.textContent = "Reject";

            approveBtn.addEventListener("click", async function () {
                try {
                    await updateDoc(doc(db, "fareUpdates", fareDoc.id), {
                        status: "approved"
                    });
                    await loadAdminFareUpdates();
                } catch (error) {
                    alert("Approval failed: " + error.message);
                }
            });

            rejectBtn.addEventListener("click", async function () {
                try {
                    await updateDoc(doc(db, "fareUpdates", fareDoc.id), {
                        status: "rejected"
                    });
                    await loadAdminFareUpdates();
                } catch (error) {
                    alert("Rejection failed: " + error.message);
                }
            });

            item.appendChild(heading);
            item.appendChild(details);
            item.appendChild(note);
            item.appendChild(approveBtn);
            item.appendChild(rejectBtn);

            list.appendChild(item);
        });

    } catch (error) {
        console.error("Admin loading error:", error);
        list.textContent = "Unable to load pending approvals: " + error.message;
    }
}
onAuthStateChanged(auth, async (user) => {
    const adminPanel = document.getElementById("adminPanel");

    if (adminPanel) {
        adminPanel.hidden = true;
    }

    if (!user) return;

    try {
      
        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        if (
    userDoc.exists() &&
    userDoc.data().role === "admin"
) {
    if (adminPanel) {
        adminPanel.hidden = false;
    }

    await loadAdminFareUpdates();
}

} catch (error) {
        console.error("Authentication check failed:", error);
    }
});
if (fareUpdateForm) {
    fareUpdateForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const from = document.getElementById("updateFrom").value.trim();
        const to = document.getElementById("updateTo").value.trim();
        const transport = document.getElementById("updateTransport").value;
        const fare = Number(document.getElementById("updateFare").value);
        const note = document.getElementById("updateNote").value.trim();

        if (!from || !to || !transport || !fare || fare <= 0) {
            alert("Please complete all required fare details.");
            return;
        }

        try {
            await addDoc(collection(db, "fareUpdates"), {
                from: from,
                to: to,
                transport: transport,
                fare: fare,
                note: note,
                status: "pending",
                createdAt: serverTimestamp()
            });

            alert("Fare update submitted successfully!");
 await loadFareUpdates();           fareUpdateForm.reset();
            fareUpdateForm.hidden = true;

        } catch (error) {
            console.error("Fare submission error:", error);
            alert("Could not submit fare update: " + error.message);
        }
    });
}

const logoutBtn = document.getElementById("customerLogout");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
        try {
            await signOut(auth);
            alert("You have logged out successfully.");
            document.getElementById("customerDashboard").hidden = true;
            document.getElementById("account").hidden = false;
        } catch (error) {
            alert("Logout failed: " + error.message);
        }
    });
}
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
    if (!stateSelect || !areaSelect || !fromInput ||
        !toInput || !transportSelect || !searchBtn || !result) {
        console.error("Farewise NG: A required HTML element is missing.");
        return;
    }

    const locations = {
        Abuja: [
            "AMAC", "Bwari", "Gwagwalada",
            "Kuje", "Abaji", "Kwali"
        ],
        Nasarawa: [
            "Akwanga", "Awe", "Doma", "Karu",
            "Keana", "Keffi", "Kokona", "Lafia",
            "Nasarawa", "Nasarawa Eggon", "Obi",
            "Toto", "Wamba"
        ]
    };

const towns = {
    Abuja: [
        "Wuse", "Garki", "Maitama", "Utako",
        "Gwarinpa", "Jabi", "Asokoro", "Central Area",
        "Bwari", "Kubwa", "Dutse", "Ushafa",
        "Gwagwalada", "Zuba", "Kuje", "Chibiri",
        "Abaji", "Yaba", "Kwali", "Yangoji"
    ],

    Nasarawa: [
        "Akwanga", "Andaha", "Nunku",
        "Awe", "Azara", "Doma", "Rukubi",
        "Karu", "New Karu", "Mararaba", "New Nyanya",
        "Keana", "Keffi", "Garaku", "Kokona",
        "Lafia", "Shabu", "Nasarawa", "Loko",
        "Nasarawa Eggon", "Wakama", "Obi",
        "Toto", "Umaisha", "Wamba"
    ]
};

    function getState() {
        const selected = stateSelect.value.toLowerCase();

        if (selected.includes("nasarawa")) return "Nasarawa";
        if (selected.includes("abuja") || selected.includes("fct")) return "Abuja";

        return "";
    }

    
function updateAreas() {
    const state = getState();

    areaSelect.innerHTML = '<option value="">Select Area Council / LGA</option>';
    fromInput.innerHTML = '<option value="">Select starting point</option>';
    toInput.innerHTML = '<option value="">Select destination</option>';

    if (state && locations[state]) {
        locations[state].forEach(function (area) {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    }

    if (state && towns[state]) {
        towns[state].forEach(function (town) {
            [fromInput, toInput].forEach(function (dropdown) {
                const option = document.createElement("option");
                option.value = town;
                option.textContent = town;
                dropdown.appendChild(option);
            });
        });
    }
}

stateSelect.addEventListener("change", updateAreas);
updateAreas();


    // Fare records: minimum and maximum BUS fares in naira.
    const fares = [
        // ABUJA FCT
        { state: "Abuja", from: "Wuse", to: "Garki", min: 1500, max: 2000 },
        { state: "Abuja", from: "Wuse", to: "Utako", min: 2000, max: 2300 },
        { state: "Abuja", from: "Maitama", to: "Wuse", min: 800, max: 1000 },
        { state: "Abuja", from: "Kubwa", to: "Wuse", min: 2500, max: 3000 },
        { state: "Abuja", from: "Gwagwalada", to: "Zuba", min: 500, max: 700 },
        { state: "Abuja", from: "Kuje", to: "Gwagwalada", min: 700, max: 1000 },

        // NASARAWA STATE
        { state: "Nasarawa", from: "Keffi", to: "Mararaba", min: 2000, max: 2500 },
        { state: "Nasarawa", from: "Keffi", to: "Akwanga", min: 2000, max: 2500 },
        { state: "Nasarawa", from: "Lafia", to: "Akwanga", min: 4000, max: 4500 },
        { state: "Nasarawa", from: "Lafia", to: "Keffi", min: 6000, max: 6500 },
        { state: "Nasarawa", from: "New Karu", to: "Mararaba", min: 1000, max: 1500 },
        { state: "Nasarawa", from: "Garaku", to: "Keffi", min: 1000, max: 1300 }
    ];

    function findFare(state, from, to) {
        return fares.find(function (fare) {
            return fare.state === state &&
                (
                    (fare.from.toLowerCase() === from.toLowerCase() &&
                     fare.to.toLowerCase() === to.toLowerCase()) ||
                    (fare.from.toLowerCase() === to.toLowerCase() &&
                     fare.to.toLowerCase() === from.toLowerCase())
                );
        });
    }

    function formatNaira(amount) {
        return "₦" + amount.toLocaleString("en-NG");
    }
    
searchBtn.addEventListener("click", async function () {
    const state = getState();
    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    const transport = transportSelect.value;

    if (!state || !from || !to || !transport) {
        result.innerHTML = "Please select your state, enter your route and choose a transport type.";
        return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
        result.innerHTML = "Starting point and destination cannot be the same.";
        return;
    }

    if (!["bus", "taxi", "keke"].includes(transport.toLowerCase())) {
        result.innerHTML = "Please select Bus, Taxi or Keke.";
        return;
    }

    try {
        result.textContent = "Checking approved fares...";
console.log("Logged-in user:", auth.currentUser?.uid);
console.log("Firebase project:", auth.app.options.projectId);
        const snapshot = await getDocs(collection(db, "fareUpdates"));

        const approvedFares = snapshot.docs
            .map(fareDoc => fareDoc.data())
            .filter(data =>
                data.status === "approved" &&
                data.transport.toLowerCase() === transport.toLowerCase() &&
                (
                    (data.from.toLowerCase() === from.toLowerCase() &&
                     data.to.toLowerCase() === to.toLowerCase()) ||
                    (data.from.toLowerCase() === to.toLowerCase() &&
                     data.to.toLowerCase() === from.toLowerCase())
                )
            );

        if (approvedFares.length > 0) {
            const prices = approvedFares.map(data => Number(data.fare));

            const minFare = Math.min(...prices);
            const maxFare = Math.max(...prices);

            result.innerHTML =
                "<h3>APPROVED FARE</h3>" +
                "<p><strong>Route:</strong> " + from + " to " + to + "</p>" +
                "<p><strong>State:</strong> " + state + "</p>" +
                "<p><strong>Transport:</strong> " + transport + "</p>" +
                "<p><strong>Date Checked:</strong> " + new Date().toLocaleDateString("en-GB") + "</p>" +
                "<h2>" + formatNaira(minFare) + " – " + formatNaira(maxFare) + "</h2>" +
                "<p>Based on approved fare updates.</p>";

            return;
        }

        const fare = findFare(state, from, to);

        if (!fare) {
            result.innerHTML = "Fare information is not yet available for this route.";
            return;
        }

        let minFare = fare.min;
        let maxFare = fare.max;

        if (transport.toLowerCase() === "taxi") {
            minFare += state === "Nasarawa" ? 500 : 400;
            maxFare += state === "Nasarawa" ? 500 : 400;
        } else if (transport.toLowerCase() === "keke") {
            minFare -= 300;
            maxFare -= 300;
        }

        result.innerHTML =
            "<h3>ESTIMATED FARE</h3>" +
            "<p><strong>Route:</strong> " + from + " to " + to + "</p>" +
            "<p><strong>State:</strong> " + state + "</p>" +
            "<p><strong>Transport:</strong> " + transport + "</p>" +
            "<p><strong>Date Checked:</strong> " + new Date().toLocaleDateString("en-GB") + "</p>" +
            "<h2>" + formatNaira(minFare) + " – " + formatNaira(maxFare) + "</h2>" +
            "<p>Estimated fare. Actual prices may vary.</p>";

    } catch (error) {
        console.error("Fare search error:", error);
        result.textContent = "Unable to check approved fares: " + error.message;
    }
});

// FAREWISE NG USER REGISTRATION
if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const role = document.getElementById("regRole").value;

        if (!name || !email || !password || !role) {
            alert("Please complete all registration fields.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, email, password
            );

            await updateProfile(userCredential.user, {
                displayName: name
            });

            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: name,
                email: email,
                role: role,
                createdAt: serverTimestamp()
            });

            alert("Account created successfully! Welcome to Farewise NG.");
            registerForm.reset();

        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed: " + error.message);
        }
    });
}
    // FAREWISE NG USER LOGIN
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            const userDoc = await getDoc(
                doc(db, "users", user.uid)
            );

            if (!userDoc.exists()) {
                alert("Your account information could not be found.");
                return;
            }

            const userData = userDoc.data();

           
