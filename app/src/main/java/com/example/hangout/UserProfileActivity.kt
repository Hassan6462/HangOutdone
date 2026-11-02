package com.example.hangout

import android.net.Uri
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.firebase.firestore.FirebaseFirestore

class UserProfileActivity : AppCompatActivity() {

    private lateinit var backButton: TextView
    private lateinit var profilePhoto: ImageView
    private lateinit var profilePhotoPlaceholder: TextView
    private lateinit var profileName: TextView
    private lateinit var profileAge: TextView
    private lateinit var trustScore: TextView
    private lateinit var interestsChipGroup: ChipGroup
    private lateinit var hangoutsPosted: TextView

    private val db = FirebaseFirestore.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_profile)

        backButton = findViewById(R.id.backButton)
        profilePhoto = findViewById(R.id.profilePhoto)
        profilePhotoPlaceholder = findViewById(R.id.profilePhotoPlaceholder)
        profileName = findViewById(R.id.profileName)
        profileAge = findViewById(R.id.profileAge)
        trustScore = findViewById(R.id.trustScore)
        interestsChipGroup = findViewById(R.id.interestsChipGroup)
        hangoutsPosted = findViewById(R.id.hangoutsPosted)

        backButton.setOnClickListener { finish() }

        val userId = intent.getStringExtra("userId")
        if (userId == null) {
            Toast.makeText(this, "User not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        loadUserProfile(userId)
        loadUserHangouts(userId)
    }

    private fun loadUserProfile(userId: String) {
        db.collection("users").document(userId).get()
            .addOnSuccessListener { doc ->
                if (!doc.exists()) {
                    Toast.makeText(this, "Profile not found", Toast.LENGTH_SHORT).show()
                    finish()
                    return@addOnSuccessListener
                }

                val firstName = doc.getString("firstName") ?: ""
                val lastName = doc.getString("lastName") ?: ""
                val age = doc.getLong("age")?.toString() ?: "?"
                val photoUri = doc.getString("photoUri") ?: ""

                @Suppress("UNCHECKED_CAST")
                val interests = doc.get("interests") as? List<String> ?: emptyList()

                profileName.text = "$firstName $lastName"
                profileAge.text = "$age years old"

                // Show photo if available
                // Show photo if available and accessible
                if (photoUri.isNotEmpty()) {
                    try {
                        profilePhoto.setImageURI(Uri.parse(photoUri))
                        profilePhotoPlaceholder.visibility = android.view.View.GONE
                    } catch (e: Exception) {
                        // URI expired or inaccessible — show placeholder instead
                        profilePhotoPlaceholder.visibility = android.view.View.VISIBLE
                    }
                }

                // Trust score — count ratings later, for now show "New member"
                trustScore.text = "New member"

                // Build interest chips
                interestsChipGroup.removeAllViews()
                interests.forEach { interest ->
                    val chip = Chip(this)
                    chip.text = interest
                    chip.isCheckable = false
                    chip.setChipBackgroundColorResource(android.R.color.white)
                    chip.setTextColor(getColor(android.R.color.black))
                    chip.chipStrokeWidth = 1f
                    chip.chipStrokeColor = android.content.res.ColorStateList.valueOf(
                        android.graphics.Color.parseColor("#DDDDDD")
                    )
                    interestsChipGroup.addView(chip)
                }
            }
            .addOnFailureListener {
                Toast.makeText(this, "Failed to load profile", Toast.LENGTH_SHORT).show()
            }
    }

    private fun loadUserHangouts(userId: String) {
        db.collection("hangouts")
            .whereEqualTo("postedByUid", userId)
            .get()
            .addOnSuccessListener { docs ->
                val count = docs.size()
                hangoutsPosted.text = when (count) {
                    0 -> "No hangouts posted yet"
                    1 -> "1 hangout posted"
                    else -> "$count hangouts posted"
                }
            }
            .addOnFailureListener {
                hangoutsPosted.text = "Couldn't load hangouts"
            }
    }
}