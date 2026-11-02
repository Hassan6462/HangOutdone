package com.example.hangout

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import java.util.concurrent.TimeUnit
import com.google.firebase.firestore.FirebaseFirestore

class LoginActivity : AppCompatActivity() {

    private lateinit var identifierInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var continueButton: Button
    private lateinit var googleSignInButton: Button
    private lateinit var loadingSpinner: ProgressBar



    private lateinit var auth: FirebaseAuth

    private val db = FirebaseFirestore.getInstance()

    private var storedVerificationId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        auth = FirebaseAuth.getInstance()

        identifierInput = findViewById(R.id.identifierInput)
        passwordInput = findViewById(R.id.passwordInput)
        continueButton = findViewById(R.id.continueButton)
        googleSignInButton = findViewById(R.id.googleSignInButton)
        loadingSpinner = findViewById(R.id.loadingSpinner)

        continueButton.setOnClickListener {
            val input = identifierInput.text.toString().trim()

            if (input.isEmpty()) {
                Toast.makeText(this, "Please enter your phone number or email", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val isEmail = input.contains("@")

            if (isEmail) {
                if (passwordInput.visibility != View.VISIBLE) {
                    passwordInput.visibility = View.VISIBLE
                    Toast.makeText(this, "Enter your password to continue", Toast.LENGTH_SHORT).show()
                } else {
                    val password = passwordInput.text.toString().trim()
                    if (password.isEmpty()) {
                        Toast.makeText(this, "Please enter your password", Toast.LENGTH_SHORT).show()
                        return@setOnClickListener
                    }
                    signInOrSignUpWithEmail(input, password)
                }
            } else {
                sendOtp(input)
            }
        }

        googleSignInButton.setOnClickListener {
            // TODO: Day 5 - Google Sign-In logic goes here
            Toast.makeText(this, "Google sign-in coming next", Toast.LENGTH_SHORT).show()
        }
        // Check if user is already signed in
        checkExistingSession()
    }


    private fun sendOtp(phoneNumber: String) {
        loadingSpinner.visibility = View.VISIBLE
        continueButton.isEnabled = false

        val options = PhoneAuthOptions.newBuilder(auth)
            .setPhoneNumber(phoneNumber)
            .setTimeout(60L, TimeUnit.SECONDS)
            .setActivity(this)
            .setCallbacks(object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {

                override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                    // Auto-verification happened (rare, usually only on the same device as the SIM)
                    signInWithPhoneCredential(credential)
                }

                override fun onVerificationFailed(e: FirebaseException) {
                    loadingSpinner.visibility = View.GONE
                    continueButton.isEnabled = true
                    Log.e("LoginActivity", "OTP send failed", e)
                    Toast.makeText(
                        this@LoginActivity,
                        "Couldn't send code: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }

                override fun onCodeSent(
                    verificationId: String,
                    token: PhoneAuthProvider.ForceResendingToken
                ) {
                    loadingSpinner.visibility = View.GONE
                    continueButton.isEnabled = true
                    storedVerificationId = verificationId

                    val intent = Intent(this@LoginActivity, OtpVerificationActivity::class.java)
                    intent.putExtra("verificationId", verificationId)
                    intent.putExtra("phoneNumber", phoneNumber)
                    startActivity(intent)
                }
            })
            .build()

        PhoneAuthProvider.verifyPhoneNumber(options)
    }
    private fun checkExistingSession() {
        val user = auth.currentUser

        // No user signed in — stay on login screen
        if (user == null) return

        // User signed in but email not verified — sign out and stay
        if (!user.isEmailVerified) {
            auth.signOut()
            return
        }

        // User signed in and verified — check if profile is complete
        loadingSpinner.visibility = View.VISIBLE
        continueButton.isEnabled = false

        db.collection("users")
            .document(user.uid)
            .get()
            .addOnSuccessListener { document ->
                loadingSpinner.visibility = View.GONE
                continueButton.isEnabled = true

                if (document.exists() && document.getBoolean("profileComplete") == true) {
                    // Profile complete → go to feed (placeholder for now)
                    Toast.makeText(this, "Welcome back, ${document.getString("firstName")}!", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, FeedActivity::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    // Profile incomplete → go to profile setup
                    val intent = Intent(this, ProfileSetupNameActivity::class.java)
                    startActivity(intent)
                    finish()
                }
            }
            .addOnFailureListener {
                loadingSpinner.visibility = View.GONE
                continueButton.isEnabled = true
                // If Firestore check fails, just show login normally
            }
    }
    private fun signInOrSignUpWithEmail(email: String, password: String) {
        loadingSpinner.visibility = View.VISIBLE
        continueButton.isEnabled = false

        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    loadingSpinner.visibility = View.GONE
                    continueButton.isEnabled = true

                    val user = auth.currentUser
                    if (user != null && !user.isEmailVerified) {
                        Toast.makeText(
                            this,
                            "Please verify your email first. Check your inbox.",
                            Toast.LENGTH_LONG
                        ).show()
                        auth.signOut()
                        return@addOnCompleteListener
                    }

                    Toast.makeText(this, "Signed in successfully!", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, FeedActivity::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    // No account exists yet — create one instead
                    createAccountWithEmail(email, password)
                }
            }
    }

    private fun createAccountWithEmail(email: String, password: String) {
        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener(this) { task ->
                loadingSpinner.visibility = View.GONE
                continueButton.isEnabled = true

                if (task.isSuccessful) {
                    // Send email verification before proceeding
                    auth.currentUser?.sendEmailVerification()
                        ?.addOnCompleteListener { verifyTask ->
                            if (verifyTask.isSuccessful) {
                                Toast.makeText(
                                    this,
                                    "Account created! Check your email to verify your address, then sign in again.",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                        }
                } else {
                    Toast.makeText(
                        this,
                        "Sign-in failed: ${task.exception?.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
    }


    private fun signInWithPhoneCredential(credential: PhoneAuthCredential) {
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    Toast.makeText(this, "Signed in successfully!", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, ProfileSetupNameActivity::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(this, "Verification failed: ${task.exception?.message}", Toast.LENGTH_LONG).show()
                }
            }
    }
}