package com.example.hangout

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class ProfileSetupInterestsActivity : AppCompatActivity() {

    private lateinit var chipGroup: ChipGroup
    private lateinit var finishButton: Button
    private lateinit var savingSpinner: ProgressBar

    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    // Full list of interest tags
    private val interests = listOf(
        "⚽ Sports", "🎬 Movies", "📺 TV Shows", "☕ Coffee",
        "🍕 Food", "✈️ Travel", "🎵 Music", "🎮 Gaming",
        "📚 Reading", "🏃 Fitness", "🎨 Art", "🧘 Wellness",
        "🌿 Outdoors", "🎭 Theatre", "🏖️ Beach", "🎤 Live Events"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile_setup_interests)

        chipGroup = findViewById(R.id.interestsChipGroup)
        finishButton = findViewById(R.id.finishButton)
        savingSpinner = findViewById(R.id.savingSpinner)

        // Build chips dynamically
        interests.forEach { interest ->
            val chip = Chip(this)
            chip.text = interest
            chip.isCheckable = true
            chip.isCheckedIconVisible = true
            chip.setChipBackgroundColorResource(android.R.color.white)
            chip.setTextColor(getColor(android.R.color.black))
            chip.chipStrokeWidth = 2f
            chip.chipStrokeColor = android.content.res.ColorStateList.valueOf(
                android.graphics.Color.parseColor("#DDDDDD")
            )
            chipGroup.addView(chip)
        }

        finishButton.setOnClickListener {
            val selectedInterests = mutableListOf<String>()

            for (i in 0 until chipGroup.childCount) {
                val chip = chipGroup.getChildAt(i) as Chip
                if (chip.isChecked) {
                    selectedInterests.add(chip.text.toString())
                }
            }

            if (selectedInterests.size < 2) {
                Toast.makeText(this, "Please pick at least 2 interests", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            saveProfileToFirestore(selectedInterests)
        }
    }

    private fun saveProfileToFirestore(selectedInterests: List<String>) {
        val userId = auth.currentUser?.uid
        if (userId == null) {
            Toast.makeText(this, "Session expired, please sign in again", Toast.LENGTH_LONG).show()
            return
        }

        finishButton.isEnabled = false
        savingSpinner.visibility = View.VISIBLE

        // Build the profile data map
        val firstName = intent.getStringExtra("firstName") ?: ""
        val lastName = intent.getStringExtra("lastName") ?: ""
        val fullName = intent.getStringExtra("fullName") ?: ""
        val dobDay = intent.getIntExtra("dobDay", -1)
        val dobMonth = intent.getIntExtra("dobMonth", -1)
        val dobYear = intent.getIntExtra("dobYear", -1)
        val age = intent.getIntExtra("age", -1)
        val photoUriString = intent.getStringExtra("photoUri")

        val profile = hashMapOf(
            "uid" to userId,
            "firstName" to firstName,
            "lastName" to lastName,
            "fullName" to fullName,
            "dobDay" to dobDay,
            "dobMonth" to dobMonth,
            "dobYear" to dobYear,
            "age" to age,
            "photoUri" to (photoUriString ?: ""),
            "interests" to selectedInterests,
            "profileComplete" to true,
            "createdAt" to System.currentTimeMillis()
        )

        // Save to Firestore under "users" collection
        db.collection("users")
            .document(userId)
            .set(profile)
            .addOnSuccessListener {
                savingSpinner.visibility = View.GONE
                finishButton.isEnabled = true
                Toast.makeText(this, "Welcome to HangOut, $firstName! 🎉", Toast.LENGTH_LONG).show()

                // TODO: navigate to main feed screen (Day 4)
                // For now, just go back to login to confirm the flow completed
                val intent = Intent(this, LoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
            }
            .addOnFailureListener { e ->
                savingSpinner.visibility = View.GONE
                finishButton.isEnabled = true
                Toast.makeText(this, "Failed to save profile: ${e.message}", Toast.LENGTH_LONG).show()
            }
    }
}