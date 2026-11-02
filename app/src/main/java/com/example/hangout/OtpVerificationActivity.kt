package com.example.hangout

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthProvider

class OtpVerificationActivity : AppCompatActivity() {

    private lateinit var otpInput: EditText
    private lateinit var verifyButton: Button
    private lateinit var resendText: TextView
    private lateinit var sentToText: TextView
    private lateinit var otpLoadingSpinner: ProgressBar

    private lateinit var auth: FirebaseAuth
    private var verificationId: String? = null
    private var phoneNumber: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_otp_verification)

        auth = FirebaseAuth.getInstance()

        otpInput = findViewById(R.id.otpInput)
        verifyButton = findViewById(R.id.verifyButton)
        resendText = findViewById(R.id.resendText)
        sentToText = findViewById(R.id.sentToText)
        otpLoadingSpinner = findViewById(R.id.otpLoadingSpinner)

        verificationId = intent.getStringExtra("verificationId")
        phoneNumber = intent.getStringExtra("phoneNumber")

        sentToText.text = "Enter the 6-digit code sent to $phoneNumber"

        verifyButton.setOnClickListener {
            val code = otpInput.text.toString().trim()

            if (code.length != 6) {
                Toast.makeText(this, "Please enter the full 6-digit code", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val id = verificationId
            if (id == null) {
                Toast.makeText(this, "Something went wrong, please go back and try again", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val credential = PhoneAuthProvider.getCredential(id, code)
            verifyCode(credential)
        }

        resendText.setOnClickListener {
            Toast.makeText(this, "Resend coming soon \u2014 go back and try again for now", Toast.LENGTH_SHORT).show()
        }
    }

    private fun verifyCode(credential: PhoneAuthCredential) {
        otpLoadingSpinner.visibility = View.VISIBLE
        verifyButton.isEnabled = false

        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                otpLoadingSpinner.visibility = View.GONE
                verifyButton.isEnabled = true

                if (task.isSuccessful) {
                    Toast.makeText(this, "Phone verified! Welcome to HangOut", Toast.LENGTH_SHORT).show()
                    // TODO: navigate to main app / profile setup screen once it exists
                } else {
                    Toast.makeText(
                        this,
                        "Incorrect code, please try again: ${task.exception?.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
    }
}