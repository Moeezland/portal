import {

    db,

    auth,

    createUserWithEmailAndPassword,

    deleteUser,

    collection,

    query,

    where,

    getDocs,

    runTransaction,

    serverTimestamp

} from "./firebase.js";

const messageBox = document.getElementById("messageBox");

function showMessage(type, message){

    const icons = {

        error: "❌",

        warning: "⚠",

        success: "✔"

    };

    messageBox.className = `message-box ${type}`;

    messageBox.innerHTML = `${icons[type]} ${message}`;

    messageBox.style.display = "block";

}

function hideMessage(){

clearInputErrors();

    messageBox.style.opacity = "0";

    setTimeout(() => {

        messageBox.style.display = "none";

        messageBox.style.opacity = "1";

    },200);

}

const inputs = document.querySelectorAll("input");

function setInputError(input){

    input.classList.add("input-error");

}

function clearInputErrors(){

    inputs.forEach(input=>{

        input.classList.remove("input-error");

    });

}

inputs.forEach(input => {

    input.addEventListener("input", hideMessage);

    input.addEventListener("change", hideMessage);

});

const form = document.getElementById("registerForm");
const registerButton = document.getElementById("registerButton");

const civilIdInput = document.getElementById("civilId");
const fullNameInput = document.getElementById("fullName");
const dateOfBirthInput = document.getElementById("dateOfBirth");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsInput = document.getElementById("terms");
const loginLink = document.getElementById("loginLink");

let isRegistering = false;

form.addEventListener("submit", function(event){

    event.preventDefault();

    if (isRegistering) {
        return;
    }

    validateForm();

});

function disableForm(){

    inputs.forEach(input => {

        input.disabled = true;

    });

    registerButton.disabled = true;

registerButton.style.pointerEvents = "none";

loginLink.style.pointerEvents = "none";
loginLink.style.opacity = "0.5";
loginLink.style.cursor = "not-allowed";

registerButton.innerHTML =
    '<div class="spinner"></div>';

}

function enableForm(){

    isRegistering = false;

    inputs.forEach(input => {

        input.disabled = false;

    });

    registerButton.disabled = false;

registerButton.style.pointerEvents = "auto";

loginLink.style.pointerEvents = "auto";
loginLink.style.opacity = "1";
loginLink.style.cursor = "pointer";

    registerButton.innerHTML = "Register Account";

}

function validateForm(){

const civilId = civilIdInput
    .value
    .trim();

    if(!/^729\d{7}$/.test(civilId)){

setInputError(civilIdInput);

        showMessage(
            "error",
            "Civil ID must be exactly 10 digits and begin with 729."
        );

        enableForm();

        return;

    }

const fullName = fullNameInput
    .value
    .trim()
    .replace(/\s+/g, " ");

if(fullName.length === 0){

setInputError(fullNameInput);

    showMessage(
        "error",
        "Please enter your full name."
    );

    enableForm();

    return;

}

const dateOfBirth = dateOfBirthInput
    .value;

if(dateOfBirth === ""){

setInputError(dateOfBirthInput);

    showMessage(
        "error",
        "Please select your date of birth."
    );

    enableForm();

    return;

}

const email = emailInput
    .value
    .trim();

const emailRegex =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailRegex.test(email)){

setInputError(emailInput);

    showMessage(
        "error",
        "Please enter a valid email address."
    );

    enableForm();

    return;

}

const password = passwordInput
    .value;

const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

if(!passwordRegex.test(password)){

setInputError(passwordInput);

    showMessage(
        "error",
        "Password must be at least 12 characters long and include an uppercase letter, lowercase letter, number and special character."
    );

    enableForm();

    return;

}

const confirmPassword = confirmPasswordInput
    .value;

if(password !== confirmPassword){

setInputError(confirmPasswordInput);

    showMessage(
        "error",
        "Passwords do not match."
    );

    enableForm();

    return;

}

if(!termsInput.checked){

    showMessage(
        "warning",
        "You must agree to the Terms & Conditions."
    );

    enableForm();

    return;

}

isRegistering = true;

disableForm();

verifyCitizen(
    civilId,
    fullName,
    dateOfBirth,
    email,
    password
);

}

async function createAuthAccount(email, password){

    try{

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        return userCredential;

    }

catch(error){

    if(error.code === "auth/email-already-in-use"){

        showMessage(
            "error",
            "This email address is already registered."
        );

    }
    else{

        showMessage(
            "error",
            "Unable to create your account. Please try again."
        );

    }

    console.error(error);

return null;

}

}

async function activateCitizen(
    citizenDoc,
    email,
    uid
){

    await runTransaction(
        db,
        async (transaction) => {

const freshCitizen =
    await transaction.get(
        citizenDoc.ref
    );

if (!freshCitizen.exists()) {

    throw new Error(
        "Citizen record no longer exists."
    );

}

const freshData = freshCitizen.data();

if (freshData.status !== "Available") {

    throw new Error(
        "This Civil ID has already been registered."
    );

}

if (freshData.uid) {

    throw new Error(
        "This Civil ID is already linked to an account."
    );

}

transaction.update(
    citizenDoc.ref,
    {

        status: "Active",

        uid: uid,

        email: email,

        emailLower: email.toLowerCase(),

        registeredAt: serverTimestamp(),

        lastLogin: serverTimestamp()

    }
);

        }
    );

}

async function verifyCitizen(
    civilId,
    fullName,
    dateOfBirth,
    email,
    password
){

    const citizensRef = collection(
        db,
        "Citizens"
    );

    const q = query(
        citizensRef,
        where("civilId", "==", Number(civilId))
    );

    const snapshot = await getDocs(q);

    if(snapshot.empty){

    showMessage(
        "error",
        "Civil ID not found."
    );

    enableForm();

    return;

}

const citizenDoc = snapshot.docs[0];

const citizenData = citizenDoc.data();

const enteredName = fullName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

if (enteredName !== citizenData.fullNameLower) {

    setInputError(fullNameInput);

    showMessage(
        "error",
        "Full name does not match our records."
    );

    enableForm();

    return;

}

const firestoreDob = citizenData.dateOfBirth.toDate();

const year = firestoreDob.getFullYear();
const month = String(firestoreDob.getMonth() + 1).padStart(2, "0");
const day = String(firestoreDob.getDate()).padStart(2, "0");

const firestoreDate = `${year}-${month}-${day}`;

if (dateOfBirth !== firestoreDate) {

    setInputError(dateOfBirthInput);

    showMessage(
        "error",
        "Date of birth does not match our records."
    );

    enableForm();

    return;

}

if (citizenData.status !== "Available") {

    showMessage(
        "error",
        "This Civil ID has already been registered."
    );

    enableForm();

    return;

}

const userCredential =
    await createAuthAccount(
        email,
        password
    );

if (!userCredential) {

    enableForm();

    return;

}

try {

    await activateCitizen(
        citizenDoc,
        email,
        userCredential.user.uid
    );

window.location.href = "login.html";

}

catch(error){

    console.error(error);

    if (auth.currentUser) {
        try {
            await deleteUser(auth.currentUser);
        }
        catch(deleteError){
            console.error(deleteError);
        }
    }

    showMessage(
        "error",
        "Unable to activate your citizen account. Registration has been rolled back."
    );

    enableForm();

}

}