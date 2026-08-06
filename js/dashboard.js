import {
    auth,
    db,
    onAuthStateChanged,
    collection,
    query,
    where,
    getDocs,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword
} from "./firebase.js";

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

const cachedCitizen = sessionStorage.getItem("citizen");

if (cachedCitizen) {

    const citizen = JSON.parse(cachedCitizen);

    populateDashboard(citizen);

    return;

}

const citizensRef = collection(db, "Citizens");

const q = query(
    citizensRef,
    where("uid", "==", user.uid)
);

const snapshot = await getDocs(q);

if (snapshot.empty) {

    console.error("Citizen record not found.");

sessionStorage.removeItem("citizen");

await signOut(auth);

window.location.href = "login.html";

    return;

}

const citizenDoc = snapshot.docs[0];

const citizenData = citizenDoc.data();

const dob = citizenData.dateOfBirth.toDate();

const formattedDob = dob.toLocaleDateString("en-GB",{

    day:"2-digit",

    month:"short",

    year:"numeric"

});

const citizen = {

    uid: user.uid,

    borderNumber: citizenDoc.id,

    civilStatus: "Citizen",

    fullName: citizenData.fullName,

    civilId: citizenData.civilId,

    email: citizenData.email,

    dateOfBirth: formattedDob

};

sessionStorage.setItem(
    "citizen",
    JSON.stringify(citizen)
);

populateDashboard(citizen);

});

function populateDashboard(citizen){

    document.getElementById("welcomeName").textContent = citizen.fullName;

    document.getElementById("detailName").textContent = citizen.fullName;

    document.getElementById("detailCivilId").textContent = citizen.civilId;

    document.getElementById("detailDob").textContent = citizen.dateOfBirth;

    document.getElementById("detailEmail").textContent = citizen.email;

    document.getElementById("detailBorder").textContent = citizen.borderNumber;

    document.getElementById("detailStatus").textContent = citizen.civilStatus;

const loadingScreen =
    document.getElementById("loadingScreen");

document
    .getElementById("dashboardContent")
    .classList.remove("hidden");

requestAnimationFrame(() => {

    loadingScreen.style.opacity = "0";

});

setTimeout(() => {

    loadingScreen.remove();

},300);

}

const detailsTab = document.getElementById("detailsTab");
const passwordTab = document.getElementById("passwordTab");

const detailsCard = document.getElementById("detailsCard");
const passwordCard = document.getElementById("passwordCard");

detailsTab.addEventListener("click", () => {

    detailsTab.classList.add("active");
    passwordTab.classList.remove("active");

    detailsCard.classList.remove("hidden");
    passwordCard.classList.add("hidden");

});

passwordTab.addEventListener("click", () => {

    passwordTab.classList.add("active");
    detailsTab.classList.remove("active");

    passwordCard.classList.remove("hidden");
    detailsCard.classList.add("hidden");

});

const signOutBtn = document.getElementById("signOutBtn");

signOutBtn.addEventListener("click", async () => {

sessionStorage.removeItem("citizen");

await signOut(auth);

window.location.href = "login.html";

});

const currentPasswordInput = document.getElementById("currentPassword");

const newPasswordInput = document.getElementById("newPassword");

const confirmPasswordInput = document.getElementById("confirmPassword");

const updatePasswordBtn = document.getElementById("updatePasswordBtn");

const passwordMessage = document.getElementById("passwordMessage");

updatePasswordBtn.addEventListener("click", async () => {

passwordMessage.textContent = "";
passwordMessage.className = "message-box";

const currentPassword = currentPasswordInput.value.trim();

const newPassword = newPasswordInput.value.trim();

const confirmPassword = confirmPasswordInput.value.trim();

if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
) {

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ Please complete all fields.";

    return;

}

if (newPassword !== confirmPassword) {

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ New passwords do not match.";

    return;

}

if (currentPassword === newPassword) {

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ Your new password must be different from your current password.";

    return;

}

const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

if (!passwordRegex.test(newPassword)) {

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ Password must be at least 12 characters long and include an uppercase letter, lowercase letter, number and special character.";

    return;

}

try {

    const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
    );

    await reauthenticateWithCredential(
        auth.currentUser,
        credential
    );

    await updatePassword(
        auth.currentUser,
        newPassword
    );

currentPasswordInput.value = "";
newPasswordInput.value = "";
confirmPasswordInput.value = "";

passwordMessage.className = "message-box success";

passwordMessage.textContent =
"✅ Password updated successfully.";

}
catch (error) {

if (

    error.code === "auth/invalid-credential" ||

    error.code === "auth/wrong-password"

) {

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ Your current password is incorrect.";

}
else if (

    error.code === "auth/weak-password"

) {

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ Your new password does not meet Firebase's security requirements.";

}
else if (

    error.code === "auth/requires-recent-login"

) {

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ For security reasons, please sign in again and then change your password.";

}
else {

    console.error(error);

passwordMessage.className = "message-box error";

passwordMessage.textContent =
"❌ Unable to update your password. Please try again.";

}

}

});
