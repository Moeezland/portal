import {

    auth,

    db,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged,

    collection,

    query,

    where,

    getDocs,

    updateDoc,

    serverTimestamp

} from "./firebase.js";

const form = document.getElementById("loginForm");

const loginButton = document.getElementById("loginButton");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const registerLink = document.getElementById("registerLink");

const forgotPasswordLink =
    document.getElementById("forgotPasswordLink");

const messageBox =
    document.getElementById("messageBox");

function showMessage(type, message){

    const icons = {

        error: "❌",

        warning: "⚠",

        success: "✔"

    };

    messageBox.className =
        `message-box ${type}`;

    messageBox.innerHTML =
        `${icons[type]} ${message}`;

    messageBox.style.display = "block";

}

function hideMessage(){

    messageBox.style.opacity = "0";

    setTimeout(() => {

        messageBox.style.display = "none";

        messageBox.style.opacity = "1";

    }, 200);

}

const inputs =
    document.querySelectorAll("input");

inputs.forEach(input => {

    input.addEventListener(
        "input",
        hideMessage
    );

    input.addEventListener(
        "change",
        hideMessage
    );

});

let isLoggingIn = false;

function disableForm(){

    isLoggingIn = true;

    inputs.forEach(input => {

        input.disabled = true;

    });

    loginButton.disabled = true;

    loginButton.innerHTML =
        '<div class="spinner"></div>';

    registerLink.style.pointerEvents = "none";
    registerLink.style.opacity = "0.5";
    registerLink.style.cursor = "not-allowed";

    forgotPasswordLink.style.pointerEvents = "none";
    forgotPasswordLink.style.opacity = "0.5";
    forgotPasswordLink.style.cursor = "not-allowed";

}

function enableForm(){

    isLoggingIn = false;

    inputs.forEach(input => {

        input.disabled = false;

    });

    loginButton.disabled = false;

    loginButton.innerHTML = "Sign In";

    registerLink.style.pointerEvents = "auto";
    registerLink.style.opacity = "1";
    registerLink.style.cursor = "pointer";

    forgotPasswordLink.style.pointerEvents = "auto";
    forgotPasswordLink.style.opacity = "1";
    forgotPasswordLink.style.cursor = "pointer";

}

form.addEventListener("submit", function(event){

    event.preventDefault();

    if(isLoggingIn){

        return;

    }

    validateForm();

});

function validateForm(){

    const email = emailInput
        .value
        .trim();

    const password = passwordInput
        .value;

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)){

        showMessage(
            "error",
            "Please enter a valid email address."
        );

        return;

    }

    if(password.length === 0){

        showMessage(
            "error",
            "Please enter your password."
        );

        return;

    }

    disableForm();

    loginCitizen(
        email,
        password
    );

}

async function loginCitizen(
    email,
    password
){

    try{

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

const uid = userCredential.user.uid;

const citizensRef = collection(db, "Citizens");

const q = query(
    citizensRef,
    where("uid", "==", uid)
);

const snapshot = await getDocs(q);

if (snapshot.empty) {

    showMessage(
        "error",
        "Citizen record not found."
    );

    await signOut(auth);

    enableForm();

    return;
}

const citizen = snapshot.docs[0];

const citizenData = citizen.data();

if (citizenData.status !== "Active") {

    showMessage(
        "error",
        "Your account is inactive."
    );

    await signOut(auth);

    enableForm();

    return;
}

await updateDoc(
    citizen.ref,
    {
        lastLogin: serverTimestamp()
    }
);

window.location.href = "dashboard.html";

    }

catch(error){

    console.error(error);

    if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-email"
    ) {

        showMessage(
            "error",
            "Invalid email or password."
        );

    } else {

        showMessage(
            "error",
            "Something went wrong. Please try again."
        );

    }

    enableForm();

}

}